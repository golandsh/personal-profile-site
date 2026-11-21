import "server-only";
import { z } from "zod";
import { buildDigitalTwinSystemPrompt } from "@/lib/digital-twin-prompt";
import type { ChatMessageInput } from "@/lib/digital-twin-schema";
import { MissingEnvError, getN8nEnv } from "@/lib/env";

export const N8N_TIMEOUT_MS = 25_000;
export const N8N_DEFAULT_MODEL_LABEL = "ollama-n8n";

export type N8nErrorCode =
  | "missing-config"
  | "auth-error"
  | "rate-limited"
  | "timeout"
  | "upstream-error"
  | "invalid-response";

export class N8nError extends Error {
  readonly code: N8nErrorCode;

  constructor(code: N8nErrorCode, message: string) {
    super(message);
    this.name = "N8nError";
    this.code = code;
  }
}

const N8nResponseSchema = z
  .object({
    reply: z.string().optional(),
    output: z.string().optional(),
    model: z.string().optional(),
  })
  .passthrough();

export function formatConversationPrompt(
  messages: readonly ChatMessageInput[],
): string {
  if (messages.length === 1) {
    return messages[0]?.content.trim() ?? "";
  }

  const history = messages.slice(0, -1);
  const latest = messages[messages.length - 1];

  const historyLines = history
    .map(
      (message) =>
        `${message.role === "user" ? "User" : "Assistant"}: ${message.content.trim()}`,
    )
    .join("\n");

  return [
    "Conversation History:",
    historyLines,
    "",
    "Current Question:",
    latest?.content.trim() ?? "",
  ].join("\n");
}

export interface N8nReply {
  readonly reply: string;
  readonly model: string;
}

export interface RequestN8nOptions {
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
}

export async function requestN8nDigitalTwinReply(
  messages: readonly ChatMessageInput[],
  options: RequestN8nOptions = {},
): Promise<N8nReply> {
  let env: { readonly webhookUrl: string; readonly webhookSecret: string | null };
  try {
    env = getN8nEnv();
  } catch (error: unknown) {
    if (error instanceof MissingEnvError) {
      throw new N8nError(
        "missing-config",
        "Digital Twin webhook is not configured.",
      );
    }
    throw new N8nError(
      "upstream-error",
      "Unable to initialize Digital Twin webhook.",
    );
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? N8N_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  if (env.webhookSecret) {
    headers["X-Webhook-Secret"] = env.webhookSecret;
  }

  const body = JSON.stringify({
    systemPrompt: buildDigitalTwinSystemPrompt(),
    prompt: formatConversationPrompt(messages),
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  });

  try {
    const response = await fetchImpl(env.webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      throw new N8nError(
        "auth-error",
        "Digital Twin webhook authorization failed. Check N8N_WEBHOOK_SECRET.",
      );
    }

    if (response.status === 429) {
      throw new N8nError(
        "rate-limited",
        "The Digital Twin is busy right now. Please wait a few seconds and try again.",
      );
    }

    if (!response.ok) {
      throw new N8nError(
        "upstream-error",
        "The Digital Twin workflow is temporarily unavailable. Please try again shortly.",
      );
    }

    let rawJson: unknown;
    try {
      rawJson = await response.json();
    } catch {
      throw new N8nError(
        "invalid-response",
        "Received an unreadable response from the Digital Twin workflow.",
      );
    }

    const parsed = N8nResponseSchema.safeParse(rawJson);
    if (!parsed.success) {
      throw new N8nError(
        "invalid-response",
        "Received an unexpected response format from the Digital Twin workflow.",
      );
    }

    const replyText = (parsed.data.reply ?? parsed.data.output ?? "").trim();
    if (replyText.length === 0) {
      throw new N8nError(
        "invalid-response",
        "The Digital Twin workflow returned an empty response.",
      );
    }

    const modelName = parsed.data.model?.trim();
    return {
      reply: replyText,
      model:
        modelName && modelName.length > 0 ? modelName : N8N_DEFAULT_MODEL_LABEL,
    };
  } catch (error: unknown) {
    if (error instanceof N8nError) {
      throw error;
    }
    if (
      controller.signal.aborted ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new N8nError(
        "timeout",
        "The Digital Twin took too long to respond. Please try again.",
      );
    }
    throw new N8nError(
      "upstream-error",
      "Unable to reach the Digital Twin workflow right now.",
    );
  } finally {
    clearTimeout(timeoutHandle);
  }
}
