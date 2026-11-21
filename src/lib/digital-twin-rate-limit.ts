import "server-only";
import { createConcurrencyLimiter } from "@/lib/concurrency";
import { createRateLimiter } from "@/lib/rate-limit";

// Per-IP throttling (10 requests/minute)
export const digitalTwinRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
});

// Global circuit breaker across all callers (40 requests/minute)
export const digitalTwinGlobalLimiter = createRateLimiter({
  maxRequests: 40,
  windowMs: 60_000,
  maxTrackedKeys: 1,
});

// Concurrent in-flight execution cap protecting self-hosted n8n + Ollama
export const digitalTwinConcurrencyLimiter = createConcurrencyLimiter(4);
