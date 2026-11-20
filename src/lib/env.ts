import "server-only";
import { z } from "zod";

const ApiKeySchema = z.string().trim().min(1);
const SiteUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => value.startsWith("https://") || value.startsWith("http://"),
    { message: "OPENROUTER_SITE_URL must use http:// or https://" },
  );

export interface OpenRouterEnv {
  readonly apiKey: string;
  readonly siteUrl: string;
}

export class MissingEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingEnvError";
  }
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

  const siteUrlResult = SiteUrlSchema.safeParse(rawSiteUrl);
  if (!siteUrlResult.success) {
    throw new MissingEnvError("OPENROUTER_SITE_URL is invalid");
  }

  return {
    apiKey: apiKeyResult.data,
    siteUrl: siteUrlResult.data,
  };
}
