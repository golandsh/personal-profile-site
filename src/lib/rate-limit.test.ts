import { describe, expect, it } from "vitest";
import { createRateLimiter, extractClientKey } from "@/lib/rate-limit";

describe("rate-limit", () => {
  it("allows requests within quota, blocks excess with retryAfterSeconds, and supports reset()", () => {
    let currentTime = 1_000_000;
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 10_000,
      now: () => currentTime,
    });

    expect(limiter.check("203.0.113.10")).toEqual({
      allowed: true,
      remaining: 1,
      retryAfterSeconds: 0,
    });
    expect(limiter.check("203.0.113.10")).toEqual({
      allowed: true,
      remaining: 0,
      retryAfterSeconds: 0,
    });

    currentTime += 2_000;
    const blocked = limiter.check("203.0.113.10");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBe(8);

    // reset() clears tracked quota immediately
    limiter.reset();
    expect(limiter.check("203.0.113.10").allowed).toBe(true);
    expect(limiter.check("203.0.113.10").allowed).toBe(true);
    expect(limiter.check("203.0.113.10").allowed).toBe(false);

    // After sliding window expires, requests succeed again
    currentTime += 10_001;
    expect(limiter.check("203.0.113.10").allowed).toBe(true);
  });

  it("evicts stale entries after expiry and oldest entries when maxTrackedKeys is reached", () => {
    let currentTime = 50_000;
    const limiter = createRateLimiter({
      maxRequests: 1,
      windowMs: 5_000,
      maxTrackedKeys: 2,
      now: () => currentTime,
    });

    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-2").allowed).toBe(true);
    expect(limiter.check("ip-3").allowed).toBe(true);

    // ip-1 was evicted when ip-3 arrived
    expect(limiter.check("ip-1").allowed).toBe(true);

    // Advance past window so pruneStaleEntries clears expired keys cleanly
    currentTime += 6_000;
    expect(limiter.check("ip-4").allowed).toBe(true);
    expect(limiter.check("   ").allowed).toBe(true);
    expect(limiter.check("anonymous").allowed).toBe(false);
  });

  it("prefers edge-overwritten headers and falls back to rightmost x-forwarded-for or anonymous", () => {
    expect(
      extractClientKey(
        new Headers({
          "cf-connecting-ip": "203.0.113.5",
          "x-forwarded-for": "1.2.3.4, 198.51.100.7",
        }),
      ),
    ).toBe("203.0.113.5");
    expect(
      extractClientKey(
        new Headers({
          "x-vercel-forwarded-for": "203.0.113.6",
          "x-real-ip": "198.51.100.9",
        }),
      ),
    ).toBe("203.0.113.6");
    expect(
      extractClientKey(new Headers({ "x-real-ip": "198.51.100.9" })),
    ).toBe("198.51.100.9");
    expect(
      extractClientKey(
        new Headers({ "x-forwarded-for": "1.2.3.4, 198.51.100.7" }),
      ),
    ).toBe("198.51.100.7");
    expect(extractClientKey(new Headers())).toBe("anonymous");
  });
});
