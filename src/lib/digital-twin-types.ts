export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_CONVERSATION_MESSAGES = 16;
export const MAX_TOTAL_CONVERSATION_CHARS = 12_000;
export const MAX_REQUEST_BODY_BYTES = 32_768;

export type ChatRole = "user" | "assistant";

export interface ChatMessageInput {
  readonly role: ChatRole;
  readonly content: string;
}

/**
 * Keeps the most recent messages within both message-count and character budgets
 * so long assistant replies never trigger a 400 payload-limit error on follow-ups.
 */
export function trimConversationHistory(
  messages: readonly ChatMessageInput[],
  maxMessages: number = MAX_CONVERSATION_MESSAGES,
  maxTotalChars: number = MAX_TOTAL_CONVERSATION_CHARS,
): ChatMessageInput[] {
  const recent = messages.slice(-maxMessages);
  const selected: ChatMessageInput[] = [];
  let charCount = 0;

  for (let index = recent.length - 1; index >= 0; index -= 1) {
    const entry = recent[index];
    if (!entry) {
      continue;
    }
    if (
      selected.length > 0 &&
      charCount + entry.content.length > maxTotalChars
    ) {
      break;
    }
    selected.push({ role: entry.role, content: entry.content });
    charCount += entry.content.length;
  }

  return selected.reverse();
}

export interface DigitalTwinSuccess {
  readonly reply: string;
  readonly model: string;
}

export interface DigitalTwinError {
  readonly error: string;
}

export function isDigitalTwinSuccess(
  value: unknown,
): value is DigitalTwinSuccess {
  return (
    typeof value === "object" &&
    value !== null &&
    "reply" in value &&
    "model" in value &&
    typeof value.reply === "string" &&
    value.reply.trim().length > 0 &&
    typeof value.model === "string" &&
    value.model.trim().length > 0
  );
}

export function isDigitalTwinError(value: unknown): value is DigitalTwinError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string" &&
    value.error.trim().length > 0
  );
}

export const SUGGESTED_PROMPTS: readonly string[] = [
  "Summarize Shlomi's 20-year career",
  "Tell me about his Recurly & payments architecture",
  "How did he build and scale the Kyiv engineering team?",
  "What AI workflows does he lead with Cursor & Claude Code?",
];
