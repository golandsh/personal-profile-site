import { NextResponse } from "next/server";
import { digitalTwinRateLimiter } from "@/lib/digital-twin-rate-limit";
import {
  DigitalTwinRequestSchema,
  MAX_REQUEST_BODY_BYTES,
  type DigitalTwinError,
  type DigitalTwinSuccess,
} from "@/lib/digital-twin-schema";
import { OpenRouterError, requestDigitalTwinReply } from "@/lib/openrouter";
import { extractClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(
  error: string,
  status: number,
  extraHeaders?: Readonly<Record<string, string>>,
): NextResponse<DigitalTwinError> {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...extraHeaders,
      },
    },
  );
}

function mapOpenRouterError(
  error: OpenRouterError,
): NextResponse<DigitalTwinError> {
  switch (error.code) {
    case "missing-api-key":
      return jsonError(
        "Digital Twin is temporarily unavailable due to server configuration.",
        503,
      );
    case "rate-limited":
      return jsonError(error.message, 429, { "Retry-After": "10" });
    case "timeout":
      return jsonError(error.message, 504);
    case "invalid-response":
    case "upstream-error":
      return jsonError(error.message, 502);
    default: {
      const exhaustive: never = error.code;
      return jsonError(`Unexpected error: ${String(exhaustive)}`, 502);
    }
  }
}

type ReadBodyResult =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly reason: "too-large" | "unreadable" };

async function readBoundedRequestText(
  request: Request,
  maxBytes: number,
): Promise<ReadBodyResult> {
  if (!request.body) {
    return { ok: true, text: "" };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { ok: false, reason: "too-large" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, text };
  } catch {
    return { ok: false, reason: "unreadable" };
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<DigitalTwinSuccess | DigitalTwinError>> {
  const secFetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (secFetchSite === "cross-site") {
    return jsonError("Cross-site requests are not permitted.", 403);
  }

  const clientKey = extractClientKey(request.headers);
  const limit = digitalTwinRateLimiter.check(clientKey);
  if (!limit.allowed) {
    return jsonError(
      "Too many messages sent. Please wait a moment before asking again.",
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  const mediaType = contentType.split(";")[0]?.trim() ?? "";
  if (mediaType !== "application/json") {
    return jsonError("Content-Type must be application/json.", 415);
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (
      Number.isFinite(parsedLength) &&
      parsedLength > MAX_REQUEST_BODY_BYTES
    ) {
      return jsonError("Request payload is too large.", 413);
    }
  }

  const bodyResult = await readBoundedRequestText(
    request,
    MAX_REQUEST_BODY_BYTES,
  );
  if (!bodyResult.ok) {
    return bodyResult.reason === "too-large"
      ? jsonError("Request payload is too large.", 413)
      : jsonError("Unable to read request body.", 400);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(bodyResult.text);
  } catch {
    return jsonError("Invalid JSON request body.", 400);
  }

  const validated = DigitalTwinRequestSchema.safeParse(parsedJson);
  if (!validated.success) {
    return jsonError(
      "Please enter a valid question (up to 1,000 characters).",
      400,
    );
  }

  try {
    const result = await requestDigitalTwinReply(validated.data.messages);
    return NextResponse.json(
      {
        reply: result.reply,
        model: result.model,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    if (error instanceof OpenRouterError) {
      return mapOpenRouterError(error);
    }
    return jsonError(
      "Unable to complete your request right now. Please try again.",
      502,
    );
  }
}
