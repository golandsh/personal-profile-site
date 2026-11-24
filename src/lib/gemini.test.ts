import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_GEMINI_MODEL } from "@/lib/env";
import {
  GeminiError,
  OUT_OF_CREDITS_STATIC_REPLY,
  type GeminiClient,
  requestGeminiDigitalTwinReply,
} from "@/lib/gemini";

describe("gemini client", () => {
  const originalKey = process.env.CHAT_MODEL_API_KEY;
  const originalModel = process.env.CHAT_MODEL_NAME;

  beforeEach(() => {
    process.env.CHAT_MODEL_API_KEY = "AIza-test-gemini-key";
    delete process.env.CHAT_MODEL_NAME;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.CHAT_MODEL_API_KEY;
    } else {
      process.env.CHAT_MODEL_API_KEY = originalKey;
    }
    if (originalModel === undefined) {
      delete process.env.CHAT_MODEL_NAME;
    } else {
      process.env.CHAT_MODEL_NAME = originalModel;
    }
    vi.restoreAllMocks();
  });

  it("maps user/assistant roles to Gemini user/model contents and parses reply", async () => {
    const generateContent = vi
      .fn<GeminiClient["generateContent"]>()
      .mockResolvedValue({
        text: "  I built the Rule-Based Signature Assignment engine at WiseStamp.  ",
      });

    const result = await requestGeminiDigitalTwinReply(
      [
        { role: "user", content: "Tell me about WiseStamp" },
        { role: "assistant", content: "I worked there from 2021 to 2026." },
        { role: "user", content: "What rules did you build?" },
      ],
      { client: { generateContent } },
    );

    expect(result).toEqual({
      reply: "I built the Rule-Based Signature Assignment engine at WiseStamp.",
      model: DEFAULT_GEMINI_MODEL,
    });

    const callArg = generateContent.mock.calls[0]?.[0];
    expect(callArg?.model).toBe(DEFAULT_GEMINI_MODEL);
    expect(callArg?.contents).toEqual([
      { role: "user", parts: [{ text: "Tell me about WiseStamp" }] },
      { role: "model", parts: [{ text: "I worked there from 2021 to 2026." }] },
      { role: "user", parts: [{ text: "What rules did you build?" }] },
    ]);
    expect(callArg?.config.systemInstruction).toContain("Shlomi Goland");
  });

  it("throws typed GeminiError for missing key, empty reply, 429, upstream error, and timeout", async () => {
    delete process.env.CHAT_MODEL_API_KEY;
    await expect(
      requestGeminiDigitalTwinReply([{ role: "user", content: "Hi" }]),
    ).rejects.toMatchObject({ name: "GeminiError", code: "missing-api-key" });

    process.env.CHAT_MODEL_API_KEY = "AIza-test-gemini-key";

    const emptyClient: GeminiClient = {
      generateContent: vi.fn<GeminiClient["generateContent"]>().mockResolvedValue({
        text: "   ",
      }),
    };
    await expect(
      requestGeminiDigitalTwinReply([{ role: "user", content: "Hi" }], {
        client: emptyClient,
      }),
    ).rejects.toMatchObject({ code: "invalid-response" });

    const rateLimitError = Object.assign(new Error("Quota exceeded"), {
      status: 429,
    });
    const rateClient: GeminiClient = {
      generateContent: vi
        .fn<GeminiClient["generateContent"]>()
        .mockRejectedValue(rateLimitError),
    };
    await expect(
      requestGeminiDigitalTwinReply([{ role: "user", content: "Hi" }], {
        client: rateClient,
      }),
    ).rejects.toMatchObject({ code: "rate-limited" });

    const upstreamClient: GeminiClient = {
      generateContent: vi
        .fn<GeminiClient["generateContent"]>()
        .mockRejectedValue(new Error("INTERNAL_GEMINI_SECRET_TRACE")),
    };
    try {
      await requestGeminiDigitalTwinReply([{ role: "user", content: "Hi" }], {
        client: upstreamClient,
      });
      throw new Error("Expected GeminiError");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(GeminiError);
      if (error instanceof GeminiError) {
        expect(error.code).toBe("upstream-error");
        expect(error.message).not.toContain("INTERNAL_GEMINI_SECRET_TRACE");
      }
    }

    const abortError = new Error("Aborted");
    abortError.name = "AbortError";
    const abortClient: GeminiClient = {
      generateContent: vi
        .fn<GeminiClient["generateContent"]>()
        .mockRejectedValue(abortError),
    };
    await expect(
      requestGeminiDigitalTwinReply([{ role: "user", content: "Hi" }], {
        client: abortClient,
      }),
    ).rejects.toMatchObject({ code: "timeout" });

    const creditsError = Object.assign(
      new Error(
        "You exceeded your current quota, please check your plan and billing details.",
      ),
      { status: 429 },
    );
    const creditsClient: GeminiClient = {
      generateContent: vi
        .fn<GeminiClient["generateContent"]>()
        .mockRejectedValue(creditsError),
    };
    await expect(
      requestGeminiDigitalTwinReply([{ role: "user", content: "Hi" }], {
        client: creditsClient,
      }),
    ).rejects.toMatchObject({
      code: "credits-exhausted",
      message: OUT_OF_CREDITS_STATIC_REPLY,
    });
  });
});
