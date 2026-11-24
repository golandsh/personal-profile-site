import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/digital-twin/health/route";
import type * as N8nModule from "@/lib/n8n";
import { checkN8nHealth } from "@/lib/n8n";

vi.mock("@/lib/n8n", async (importOriginal) => {
  const actual = await importOriginal<typeof N8nModule>();
  return {
    ...actual,
    checkN8nHealth: vi.fn(),
  };
});

const mockedCheckN8nHealth = vi.mocked(checkN8nHealth);

describe("GET /api/digital-twin/health", () => {
  const originalProvider = process.env.LLM_PROVIDER;
  const originalN8nUrl = process.env.N8N_WEBHOOK_URL;
  const originalOpenRouterKey = process.env.OPENROUTER_API_KEY;

  beforeEach(() => {
    mockedCheckN8nHealth.mockReset();
    delete process.env.LLM_PROVIDER;
    process.env.N8N_WEBHOOK_URL =
      "https://example.ngrok-free.dev/webhook/digital-twin";
  });

  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.LLM_PROVIDER;
    } else {
      process.env.LLM_PROVIDER = originalProvider;
    }
    if (originalN8nUrl === undefined) {
      delete process.env.N8N_WEBHOOK_URL;
    } else {
      process.env.N8N_WEBHOOK_URL = originalN8nUrl;
    }
    if (originalOpenRouterKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalOpenRouterKey;
    }
  });

  it("returns available: true when n8n health check succeeds", async () => {
    mockedCheckN8nHealth.mockResolvedValue(true);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ available: true });
  });

  it("returns available: false when n8n health check fails", async () => {
    mockedCheckN8nHealth.mockResolvedValue(false);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ available: false });
  });

  it("checks OPENROUTER_API_KEY when LLM_PROVIDER=openrouter", async () => {
    process.env.LLM_PROVIDER = "openrouter";
    delete process.env.OPENROUTER_API_KEY;

    const missingResponse = await GET();
    expect(await missingResponse.json()).toEqual({ available: false });

    process.env.OPENROUTER_API_KEY = "sk-or-test";
    const okResponse = await GET();
    expect(await okResponse.json()).toEqual({ available: true });
  });
});
