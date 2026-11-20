import "server-only";
import { z } from "zod";
import { buildDigitalTwinSystemPrompt } from "@/lib/digital-twin-prompt";
import type { ChatMessageInput } from "@/lib/digital-twin-schema";
import { MissingEnvError, getOpenRouterEnv } from "@/lib/env";

export const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";
export const DIGITAL_TWIN_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
export const DIGITAL_TWIN_FALLBACK_MODELS: readonly string[] = [
  DIGITAL_TWIN_MODEL,
  "openrouter/free",
];
export const OPENROUTER_TIMEOUT_MS = 25_000;
export const OPENROUTER_RATE_LIMIT_RETRY_MS = 1_200;

export type OpenRouterErrorCode =
  | "missing-api-key"
  | "rate-limited"
  | "timeout"
  | "upstream-error"
  | "invalid-response";

export class OpenRouterError extends Error {
  readonly code: OpenRouterErrorCode;

  constructor(code: OpenRouterErrorCode, message: string) {
    super(message);
    this.name = "OpenRouterError";
    this.code = code;
  }
}

const ContentPartSchema = z
  .object({
    type: z.string(),
    text: z.string().optional(),
  })
  .passthrough();

const OpenRouterResponseSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.union([
            z.string(),
            z.array(ContentPartSchema),
            z.null(),
          ]),
        }),
      }),
    )
    .min(1),
});

function extractReplyText(
  content:
    | string
    | readonly { readonly type: string; readonly text?: string }[]
    | null,
): string {
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .filter(
        (part): part is { readonly type: "text"; readonly text: string } =>
          part.type === "text" && typeof part.text === "string",
      )
      .map((part) => part.text)
      .join("")
      .trim();
  }
  return "";
}

function waitForDelay(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      reject(abortError);
      return;
    }

    const onAbort = (): void => {
      clearTimeout(timer);
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      reject(abortError);
    };

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export interface OpenRouterReply {
  readonly reply: string;
  readonly model: string;
}

export interface RequestDigitalTwinOptions {
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
  readonly retryDelayMs?: number;
}

export async function requestDigitalTwinReply(
  messages: readonly ChatMessageInput[],
  options: RequestDigitalTwinOptions = {},
): Promise<OpenRouterReply> {
  let env: { readonly apiKey: string; readonly siteUrl: string };
  try {
    env = getOpenRouterEnv();
  } catch (error: unknown) {
    if (error instanceof MissingEnvError) {
      throw new OpenRouterError(
        "missing-api-key",
        "Digital Twin service is not configured.",
      );
    }
    throw new OpenRouterError(
      "upstream-error",
      "Unable to initialize Digital Twin service.",
    );
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? OPENROUTER_TIMEOUT_MS;
  const retryDelayMs = options.retryDelayMs ?? OPENROUTER_RATE_LIMIT_RETRY_MS;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const systemPrompt = buildDigitalTwinSystemPrompt();
  const requestBody = JSON.stringify({
    model: DIGITAL_TWIN_MODEL,
    models: [...DIGITAL_TWIN_FALLBACK_MODELS],
    reasoning: { enabled: false },
    temperature: 0.35,
    max_tokens: 1500,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  });

  const requestHeaders: Record<string, string> = {
    Authorization: `Bearer ${env.apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": env.siteUrl,
    "X-Title": "Shlomi Goland - Digital Twin",
  };

  try {
    let response = await fetchImpl(OPENROUTER_API_URL, {
      method: "POST",
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 429) {
      await waitForDelay(retryDelayMs, controller.signal);
      response = await fetchImpl(OPENROUTER_API_URL, {
        method: "POST",
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
        cache: "no-store",
      });
    }

    if (response.status === 429) {
      throw new OpenRouterError(
        "rate-limited",
        "The AI model is currently busy. Please wait a few seconds and try again.",
      );
    }

    if (!response.ok) {
      throw new OpenRouterError(
        "upstream-error",
        "The Digital Twin model is temporarily unavailable. Please try again shortly.",
      );
    }

    let rawJson: unknown;
    try {
      rawJson = await response.json();
    } catch {
      throw new OpenRouterError(
        "invalid-response",
        "Received an unreadable response from the AI model.",
      );
    }

    const parsed = OpenRouterResponseSchema.safeParse(rawJson);
    if (!parsed.success) {
      throw new OpenRouterError(
        "invalid-response",
        "Received an unexpected response format from the AI model.",
      );
    }

    const firstChoice = parsed.data.choices[0];
    const replyText = firstChoice
      ? extractReplyText(firstChoice.message.content)
      : "";

    if (replyText.length === 0) {
      throw new OpenRouterError(
        "invalid-response",
        "The AI model returned an empty response. Please try rephrasing your question.",
      );
    }

    return {
      reply: replyText,
      model: parsed.data.model ?? DIGITAL_TWIN_MODEL,
    };
  } catch (error: unknown) {
    if (error instanceof OpenRouterError) {
      throw error;
    }
    if (
      controller.signal.aborted ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new OpenRouterError(
        "timeout",
        "The Digital Twin took too long to respond. Please try again.",
      );
    }
    throw new OpenRouterError(
      "upstream-error",
      "Unable to reach the Digital Twin service right now.",
    );
  } finally {
    clearTimeout(timeoutHandle);
  }
}
