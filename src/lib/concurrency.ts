import "server-only";

export interface ConcurrencyLimiter {
  tryAcquire: () => (() => void) | null;
  getActiveCount: () => number;
  reset: () => void;
}

export function createConcurrencyLimiter(
  maxConcurrent: number,
): ConcurrencyLimiter {
  if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1) {
    throw new Error("maxConcurrent must be a positive integer");
  }

  let activeCount = 0;

  const tryAcquire = (): (() => void) | null => {
    if (activeCount >= maxConcurrent) {
      return null;
    }
    activeCount += 1;
    let released = false;

    return (): void => {
      if (released) {
        return;
      }
      released = true;
      activeCount = Math.max(0, activeCount - 1);
    };
  };

  const getActiveCount = (): number => activeCount;

  const reset = (): void => {
    activeCount = 0;
  };

  return { tryAcquire, getActiveCount, reset };
}
