import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Sliding window: 60 requests per minute per client for /api routes.
// Null when Redis is not configured, so local work never blocks on it.
export const apiLimiter =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "ratelimit:api",
      })
    : null;