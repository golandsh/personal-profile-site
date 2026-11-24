import "server-only";
import { GoogleGenAI, type Content } from "@google/genai";
import { buildDigitalTwinSystemPrompt } from "@/lib/digital-twin-prompt";
import type { ChatMessageInput } from "@/lib/digital-twin-schema";
import { MissingEnvError, getGeminiEnv } from "@/lib/env";

export const GEMINI_TIMEOUT_MS = 25_000;
export const OUT_OF_CREDITS_STATIC_REPLY =
  "Shlomi either forgot to top up the funds or he is just cheap 😄";

export type GeminiErrorCode =
  | "missing-api-key"
  | "credits-exhausted"
  | "rate-limited"
  | "timeout"
  | "upstream-error"
  | "invalid-response";

export class GeminiError extends Error {
  readonly code: GeminiErrorCode;

  constructor(code: GeminiErrorCode, message: string) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
  }
}

export interface GeminiReply {
  readonly reply: string;
  readonly model: string;
}

export interface GeminiClient {
  generateContent: (params: {
    readonly model: string;
    readonly contents: Content[];
    readonly config: {
      readonly systemInstruction: string;
      readonly temperature: number;
      readonly maxOutputTokens: number;
      readonly abortSignal: AbortSignal;
    };
  }) => Promise<{ readonly text?: string }>;
}

export interface RequestGeminiOptions {
  readonly client?: GeminiClient;
  readonly timeoutMs?: number;
}

function getHttpStatusFromError(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = error.status;
    if (typeof status === "number") {
      return status;
    }
  }
  return null;
}

const CREDITS_EXHAUSTED_PATTERNS = [
  "exceeded your current quota",
  "insufficient_quota",
  "billing",
  "credit",
  "payment required",
  "out of funds",
  "spending cap",
] as const;

function isCreditsExhaustedError(error: unknown): boolean {
  const status = getHttpStatusFromError(error);
  if (status === 402) {
    return true;
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : "";
  if (message.length === 0) {
    return false;
  }

  return CREDITS_EXHAUSTED_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );
}

export async function requestGeminiDigitalTwinReply(
  messages: readonly ChatMessageInput[],
  options: RequestGeminiOptions = {},
): Promise<GeminiReply> {
  let env: { readonly apiKey: string; readonly model: string };
  try {
    env = getGeminiEnv();
  } catch (error: unknown) {
    if (error instanceof MissingEnvError) {
      throw new GeminiError(
        "missing-api-key",
        "Digital Twin service is not configured.",
      );
    }
    throw new GeminiError(
      "upstream-error",
      "Unable to initialize Digital Twin service.",
    );
  }

  const client: GeminiClient =
    options.client ??
    new GoogleGenAI({ vertexai: false, apiKey: env.apiKey }).models;

  const timeoutMs = options.timeoutMs ?? GEMINI_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const contents: Content[] = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  try {
    const response = await client.generateContent({
      model: env.model,
      contents,
      config: {
        systemInstruction: buildDigitalTwinSystemPrompt(),
        temperature: 0.35,
        maxOutputTokens: 1000,
        abortSignal: controller.signal,
      },
    });

    const replyText = response.text?.trim() ?? "";
    if (replyText.length === 0) {
      throw new GeminiError(
        "invalid-response",
        "The AI model returned an empty response. Please try rephrasing your question.",
      );
    }

    return {
      reply: replyText,
      model: env.model,
    };
  } catch (error: unknown) {
    if (error instanceof GeminiError) {
      throw error;
    }
    if (
      controller.signal.aborted ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new GeminiError(
        "timeout",
        "The Digital Twin took too long to respond. Please try again.",
      );
    }
    if (isCreditsExhaustedError(error)) {
      throw new GeminiError(
        "credits-exhausted",
        OUT_OF_CREDITS_STATIC_REPLY,
      );
    }
    if (getHttpStatusFromError(error) === 429) {
      throw new GeminiError(
        "rate-limited",
        "The AI model is currently busy. Please wait a few seconds and try again.",
      );
    }
    throw new GeminiError(
      "upstream-error",
      "The Digital Twin model is temporarily unavailable. Please try again shortly.",
    );
  } finally {
    clearTimeout(timeoutHandle);
  }
}
