import { AiMessage } from "./types";

export interface AiConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  path?: string;
}

const SYSTEM_PROMPT = `You are an expert home chef. Create recipes from the ingredients the user already has.
- Use the ingredients listed by the user.
- Do not invent ingredients the user did not list, but you may use common pantry staples such as water, salt, pepper, cooking oil, and butter.
- Reply only with valid JSON matching the schema (no markdown, no commentary).`;

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  /** Ask for strict JSON object output where the provider supports it. */
  jsonMode?: boolean;
}

function buildConfigList(): AiConfig[] {
  const configs: AiConfig[] = [];

  const env = process.env ?? {};

  const firstNonEmpty = (keys: string[]): string | undefined =>
    keys
      .map((k) => env[k]?.trim())
      .filter(Boolean)[0];

  // Groq
  const groqKey = firstNonEmpty(["GROQ_API_KEY"]);
  if (groqKey) {
    configs.push({
      provider: "Groq",
      apiKey: groqKey,
      baseUrl: "https://api.groq.com/openai/v1",
      model: env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    });
  }

  // OpenRouter (also accepts GLM/other OpenRouter-issued keys)
  const openRouterKey = firstNonEmpty([
    "OPENROUTER_API_KEY",
    "GLM_API_KEY",
    "HF_GLM_API_KEY",
  ]);
  if (openRouterKey) {
    configs.push({
      provider: "OpenRouter",
      apiKey: openRouterKey,
      baseUrl: "https://openrouter.ai/api/v1",
      model: env.OPENROUTER_MODEL?.trim() || "meta-llama/llama-3.1-8b-instant",
    });
  }

  // Mistral
  const mistralKey = firstNonEmpty(["MISTRAL_API_KEY"]);
  if (mistralKey) {
    configs.push({
      provider: "Mistral",
      apiKey: mistralKey,
      baseUrl: "https://api.mistral.ai/v1",
      model: env.MISTRAL_MODEL?.trim() || "mistral-small-latest",
    });
  }

  // DeepSeek via DeepSeek endpoint
  const deepseekKey = firstNonEmpty(["HF_DEEPSEEK_API_KEY"]);
  if (deepseekKey) {
    configs.push({
      provider: "DeepSeek",
      apiKey: deepseekKey,
      baseUrl: "https://api.deepseek.com/v1",
      model: env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
    });
  }

  // GLM / Zhipu (bigmodel)
  const glmKey = firstNonEmpty(["GLM_API_KEY"]);
  if (glmKey && glmKey.startsWith("sk-")) {
    configs.push({
      provider: "GLM",
      apiKey: glmKey,
      baseUrl: "https://api.bigmodel.cn/openai/v1",
      model: env.GL_MODEL?.trim() || "glm-4-flash",
    });
  }

  // OpenAI
  const openaiKey = firstNonEmpty([
    "OPENAI_API_KEY",
    "OPENAI_API_KEY_1",
    "OPENAI_API_KEY_2",
    "OPENAI_API_KEY_3",
  ]);
  if (openaiKey) {
    configs.push({
      provider: "OpenAI",
      apiKey: openaiKey,
      baseUrl: "https://api.openai.com/v1",
      model: env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    });
  }

  // Google Gemini via OpenAI-compatible endpoint
  const geminiKey = firstNonEmpty(["GEMINI_API_KEY"]);
  if (geminiKey) {
    const model = env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    configs.push({
      provider: "Gemini",
      apiKey: geminiKey,
      baseUrl: `https://generativelanguage.googleapis.com/v1beta/models/${model}`,
      model: "",
      path: "openaiChat",
    });
  }

  return configs;
}

/** All configured AI providers, in priority order. Empty when none are set. */
export function getAiConfigurations(): AiConfig[] {
  return buildConfigList();
}

/** True when at least one AI provider is configured. */
export function isAiConfigured(): boolean {
  return getAiConfigurations().length > 0;
}

function buildRequest(config: AiConfig, messages: AiMessage[], options: ChatOptions) {
  const url = config.path
    ? `${config.baseUrl.replace(/\/$/, "")}/${config.path}`
    : `${config.baseUrl}/chat/completions`;
  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2000,
    stream: false,
  };
  // Gemini's OpenAI-compatible endpoint doesn't support response_format; the
  // system prompt already enforces JSON there.
  if (options.jsonMode && config.path !== "openaiChat") {
    body.response_format = { type: "json_object" };
  }
  return { url, body: JSON.stringify(body) };
}

/**
 * Send a chat request, transparently failing over across every configured
 * provider until one succeeds. This keeps the app working even if a single
 * key expires.
 */
export async function chatCompletion(
  messages: AiMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const configs = getAiConfigurations();
  if (configs.length === 0) {
    return "";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  for (const config of configs) {
    if (config.provider === "OpenRouter") {
      headers["HTTP-Referer"] = "https://fridgechef.local";
      headers["X-Title"] = "FridgeChef";
    }

    try {
      const { url, body } = buildRequest(config, messages, options);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          Authorization: `Bearer ${config.apiKey}`,
        },
        body,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn(
          `[ai] ${config.provider} failed (${res.status}): ${text.slice(0, 200)}`,
        );
        continue;
      }

      const data = (await res.json()) as {
        choices?: { message: AiMessage }[];
        error?: unknown;
      };

      if (data.error) {
        console.warn(`[ai] ${config.provider} error:`, data.error);
        continue;
      }

      const message = data.choices?.[0]?.message;
      if (!message || typeof message.content !== "string") {
        console.warn(`[ai] ${config.provider} unexpected response`);
        continue;
      }

      return message.content;
    } catch (err) {
      console.warn(`[ai] ${config.provider} request error:`, (err as Error).message);
      continue;
    }
  }

  throw new Error(
    "All configured AI providers failed. Check your API keys and network connection.",
  );
}

/**
 * Extract the first JSON array or object block from free-form assistant text.
 * Returns null when no JSON can be found.
 */
export function extractJson<T>(content: string): T | null {
  if (!content) return null;
  const trimmed = content.trim();

  const bracketMatch = trimmed.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (bracketMatch) {
    try {
      return JSON.parse(bracketMatch[0]) as T;
    } catch {
      /* fall through */
    }
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}
