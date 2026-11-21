import "server-only";
import { z } from "zod";

const ApiKeySchema = z.string().trim().min(1);
const HttpUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => value.startsWith("https://") || value.startsWith("http://"),
    { message: "URL must use http:// or https://" },
  );

const HttpsOrLocalUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) =>
      value.startsWith("https://") ||
      value.startsWith("http://localhost") ||
      value.startsWith("http://127.0.0.1"),
    { message: "Webhook URL must use https:// (or localhost in development)" },
  );

export interface OpenRouterEnv {
  readonly apiKey: string;
  readonly siteUrl: string;
}

export interface N8nEnv {
  readonly webhookUrl: string;
  readonly webhookSecret: string | null;
}

export type LlmProvider = "n8n" | "openrouter";

export class MissingEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingEnvError";
  }
}

export function getActiveLlmProvider(): LlmProvider {
  const configured = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (configured === "openrouter") {
    return "openrouter";
  }
  if (configured === "n8n") {
    return "n8n";
  }
  return process.env.N8N_WEBHOOK_URL?.trim() ? "n8n" : "openrouter";
}

export function getOpenRouterEnv(): OpenRouterEnv {
  const apiKeyResult = ApiKeySchema.safeParse(process.env.OPENROUTER_API_KEY);
  if (!apiKeyResult.success) {
    throw new MissingEnvError("OPENROUTER_API_KEY is not configured");
  }

  const rawSiteUrl = process.env.OPENROUTER_SITE_URL?.trim();
  if (!rawSiteUrl) {
    return {
      apiKey: apiKeyResult.data,
      siteUrl: "http://localhost:3000",
    };
  }

  const siteUrlResult = HttpUrlSchema.safeParse(rawSiteUrl);
  if (!siteUrlResult.success) {
    throw new MissingEnvError("OPENROUTER_SITE_URL is invalid");
  }

  return {
    apiKey: apiKeyResult.data,
    siteUrl: siteUrlResult.data,
  };
}

export function getN8nEnv(): N8nEnv {
  const webhookResult = HttpsOrLocalUrlSchema.safeParse(
    process.env.N8N_WEBHOOK_URL,
  );
  if (!webhookResult.success) {
    throw new MissingEnvError("N8N_WEBHOOK_URL is not configured or invalid");
  }

  const rawSecret = process.env.N8N_WEBHOOK_SECRET?.trim();
  return {
    webhookUrl: webhookResult.data,
    webhookSecret: rawSecret && rawSecret.length > 0 ? rawSecret : null,
  };
}
