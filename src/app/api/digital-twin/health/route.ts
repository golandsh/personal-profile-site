import { NextResponse } from "next/server";
import {
  getActiveLlmProvider,
  getGeminiEnv,
  getOpenRouterEnv,
} from "@/lib/env";
import { checkN8nHealth } from "@/lib/n8n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface DigitalTwinHealthResponse {
  readonly available: boolean;
}

export async function GET(): Promise<NextResponse<DigitalTwinHealthResponse>> {
  const provider = getActiveLlmProvider();

  if (provider === "gemini") {
    let available = false;
    try {
      getGeminiEnv();
      available = true;
    } catch {
      available = false;
    }

    return NextResponse.json(
      { available },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (provider === "openrouter") {
    let available = false;
    try {
      getOpenRouterEnv();
      available = true;
    } catch {
      available = false;
    }

    return NextResponse.json(
      { available },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const available = await checkN8nHealth();
  return NextResponse.json(
    { available },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
