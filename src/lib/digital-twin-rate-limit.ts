import "server-only";
import { createRateLimiter } from "@/lib/rate-limit";

export const digitalTwinRateLimiter = createRateLimiter({
  maxRequests: 15,
  windowMs: 60_000,
});
