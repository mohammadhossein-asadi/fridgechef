import { z } from "zod";

export const AiProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiKeyEnv: z.string(),
  baseUrl: z.string().url(),
  model: z.string(),
  path: z.string().default("/v1/chat/completions"),
}).strict();

export type AiProviderDefinition = z.infer<typeof AiProviderSchema>;

/** Extract the first valid JSON object/block from an AI response string. */
export function extractJson(text: string): string {
  if (!text) return "{}";
  const trimmed = text.trim();

  // Already a full JSON document.
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    /* fall through */
  }

  // JSON wrapped in ```code fences.
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    const candidate = fenceMatch[1].trim();
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      /* fall through */
    }
  }

  // Otherwise grab the outermost { ... } block.
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const candidate = trimmed.slice(start, end + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      /* fall through */
    }
  }

  return trimmed;
}
