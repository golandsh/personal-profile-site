import { describe, expect, it } from "vitest";
import { createConcurrencyLimiter } from "@/lib/concurrency";

describe("createConcurrencyLimiter", () => {
  it("throws when maxConcurrent is less than 1 or non-integer", () => {
    expect(() => createConcurrencyLimiter(0)).toThrow();
    expect(() => createConcurrencyLimiter(-2)).toThrow();
    expect(() => createConcurrencyLimiter(1.5)).toThrow();
  });

  it("caps active slots, returns null when full, and makes release idempotent", () => {
    const limiter = createConcurrencyLimiter(2);

    const release1 = limiter.tryAcquire();
    const release2 = limiter.tryAcquire();
    expect(release1).not.toBeNull();
    expect(release2).not.toBeNull();
    expect(limiter.getActiveCount()).toBe(2);

    // 3rd concurrent request is rejected
    expect(limiter.tryAcquire()).toBeNull();

    // Double-releasing slot 1 only decrements once
    release1?.();
    release1?.();
    expect(limiter.getActiveCount()).toBe(1);

    const release3 = limiter.tryAcquire();
    expect(release3).not.toBeNull();
    expect(limiter.getActiveCount()).toBe(2);

    limiter.reset();
    expect(limiter.getActiveCount()).toBe(0);
  });
});
