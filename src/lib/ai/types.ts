/** Minimal type definitions for the multi-provider AI layer. */

export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface ChatCompletionResponse {
  choices?: Array<{
    message?: AiMessage;
    finish_reason?: string | null;
  }>;
  error?: unknown;
}
