import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  N8N_DEFAULT_MODEL_LABEL,
  N8N_TIMEOUT_MS,
  N8nError,
  formatConversationPrompt,
  requestN8nDigitalTwinReply,
} from "@/lib/n8n";

describe("n8n webhook client", () => {
  const originalUrl = process.env.N8N_WEBHOOK_URL;
  const originalSecret = process.env.N8N_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.N8N_WEBHOOK_URL = "https://example.ngrok-free.dev/webhook/digital-twin";
    process.env.N8N_WEBHOOK_SECRET = "test-webhook-secret";
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.N8N_WEBHOOK_URL;
    } else {
      process.env.N8N_WEBHOOK_URL = originalUrl;
    }
    if (originalSecret === undefined) {
      delete process.env.N8N_WEBHOOK_SECRET;
    } else {
      process.env.N8N_WEBHOOK_SECRET = originalSecret;
    }
    vi.restoreAllMocks();
  });

  it("formats single-turn and multi-turn conversation prompts cleanly", () => {
    expect(N8N_TIMEOUT_MS).toBeGreaterThanOrEqual(30_000);
    expect(
      formatConversationPrompt([{ role: "user", content: "  Hi there  " }]),
    ).toBe("Hi there");

    expect(
      formatConversationPrompt([
        { role: "user", content: "First question" },
        { role: "assistant", content: "First answer" },
        { role: "user", content: "Follow-up" },
      ]),
    ).toBe(
      "Conversation History:\nUser: First question\nAssistant: First answer\n\nCurrent Question:\nFollow-up",
    );
  });

  it("sends systemPrompt, prompt, auth header, and parses reply or output fallback", async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            reply: "  I worked at WiseStamp and Pango.  ",
            model: "ollama/llama3.2",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            output: "Fallback output field",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    const first = await requestN8nDigitalTwinReply(
      [{ role: "user", content: "Where did you work?" }],
      { fetchImpl: mockFetch },
    );
    expect(first).toEqual({
      reply: "I worked at WiseStamp and Pango.",
      model: "ollama/llama3.2",
    });

    const [calledUrl, calledInit] = mockFetch.mock.calls[0] ?? [];
    expect(calledUrl).toBe("https://example.ngrok-free.dev/webhook/digital-twin");
    const headers = new Headers(calledInit?.headers);
    expect(headers.get("X-Webhook-Secret")).toBe("test-webhook-secret");
    expect(headers.get("ngrok-skip-browser-warning")).toBe("true");

    const second = await requestN8nDigitalTwinReply(
      [{ role: "user", content: "Next question" }],
      { fetchImpl: mockFetch },
    );
    expect(second).toEqual({
      reply: "Fallback output field",
      model: N8N_DEFAULT_MODEL_LABEL,
    });
  });

  it("throws typed N8nError for missing config, 403 auth, 429, 500, invalid JSON, network error, and timeout", async () => {
    delete process.env.N8N_WEBHOOK_URL;
    await expect(
      requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }]),
    ).rejects.toMatchObject({ name: "N8nError", code: "missing-config" });

    process.env.N8N_WEBHOOK_URL = "https://example.ngrok-free.dev/webhook/digital-twin";

    const forbiddenFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("Authorization data is wrong!", { status: 403 }));
    await expect(
      requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }], {
        fetchImpl: forbiddenFetch,
      }),
    ).rejects.toMatchObject({ code: "auth-error" });

    const rateFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("Busy", { status: 429 }));
    await expect(
      requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }], {
        fetchImpl: rateFetch,
      }),
    ).rejects.toMatchObject({ code: "rate-limited" });

    const errorFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("Internal stack trace", { status: 500 }));
    try {
      await requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }], {
        fetchImpl: errorFetch,
      });
      throw new Error("Expected N8nError");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(N8nError);
      if (error instanceof N8nError) {
        expect(error.code).toBe("upstream-error");
        expect(error.message).not.toContain("Internal stack trace");
      }
    }

    const emptyFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ reply: "   " }), { status: 200 }));
    await expect(
      requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }], {
        fetchImpl: emptyFetch,
      }),
    ).rejects.toMatchObject({ code: "invalid-response" });

    const nonJsonFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    await expect(
      requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }], {
        fetchImpl: nonJsonFetch,
      }),
    ).rejects.toMatchObject({ code: "invalid-response" });

    const networkFetch = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(
      requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }], {
        fetchImpl: networkFetch,
      }),
    ).rejects.toMatchObject({ code: "upstream-error" });

    const abortError = new Error("Aborted");
    abortError.name = "AbortError";
    const abortFetch = vi.fn<typeof fetch>().mockRejectedValue(abortError);
    await expect(
      requestN8nDigitalTwinReply([{ role: "user", content: "Hi" }], {
        fetchImpl: abortFetch,
      }),
    ).rejects.toMatchObject({ code: "timeout" });
  });
});
