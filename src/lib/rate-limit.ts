import "server-only";

export interface RateLimitConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly maxTrackedKeys?: number;
  readonly now?: () => number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
}

export interface RateLimiter {
  check: (key: string) => RateLimitResult;
  reset: () => void;
}

const DEFAULT_MAX_TRACKED_KEYS = 2_000;
const MAX_KEY_LENGTH = 64;

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  const {
    maxRequests,
    windowMs,
    maxTrackedKeys = DEFAULT_MAX_TRACKED_KEYS,
    now = (): number => Date.now(),
  } = config;

  const buckets = new Map<string, number[]>();

  const pruneStaleEntries = (currentTime: number): void => {
    const windowStart = currentTime - windowMs;
    for (const [key, timestamps] of buckets.entries()) {
      const recent = timestamps.filter((ts) => ts > windowStart);
      if (recent.length === 0) {
        buckets.delete(key);
      } else if (recent.length !== timestamps.length) {
        buckets.set(key, recent);
      }
    }
  };

  const check = (rawKey: string): RateLimitResult => {
    const key = rawKey.trim().slice(0, MAX_KEY_LENGTH) || "anonymous";
    const currentTime = now();
    const windowStart = currentTime - windowMs;

    if (buckets.size >= maxTrackedKeys && !buckets.has(key)) {
      pruneStaleEntries(currentTime);
      if (buckets.size >= maxTrackedKeys) {
        const oldestKey = buckets.keys().next().value;
        if (oldestKey !== undefined) {
          buckets.delete(oldestKey);
        }
      }
    }

    const existing = buckets.get(key) ?? [];
    const recent = existing.filter((ts) => ts > windowStart);

    if (recent.length >= maxRequests) {
      const oldestInWindow = recent[0] ?? currentTime;
      const retryAfterMs = Math.max(
        1_000,
        oldestInWindow + windowMs - currentTime,
      );
      buckets.set(key, recent);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1_000),
      };
    }

    recent.push(currentTime);
    buckets.set(key, recent);

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - recent.length),
      retryAfterSeconds: 0,
    };
  };

  const reset = (): void => {
    buckets.clear();
  };

  return { check, reset };
}

function normalizeIpCandidate(rawValue: string | null): string | null {
  const trimmed = rawValue?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, MAX_KEY_LENGTH);
}

/**
 * Prefers edge-overwritten single-IP headers over spoofable leftmost
 * `x-forwarded-for` values. Falls back to the rightmost proxy-appended entry.
 */
export function extractClientKey(headers: Headers): string {
  const trustedSingleIp =
    normalizeIpCandidate(headers.get("cf-connecting-ip")) ??
    normalizeIpCandidate(headers.get("x-vercel-forwarded-for")) ??
    normalizeIpCandidate(headers.get("x-real-ip"));

  if (trustedSingleIp) {
    return trustedSingleIp;
  }

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    const rightmost = parts[parts.length - 1];
    if (rightmost) {
      return rightmost.slice(0, MAX_KEY_LENGTH);
    }
  }

  return "anonymous";
}
