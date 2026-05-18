import { Ratelimit } from "@upstash/ratelimit"
import { Redis }     from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis:     Redis.fromEnv(),
  limiter:   Ratelimit.slidingWindow(5, "15 m"),
  prefix:    "lc-crm:login",
  analytics: false,
})

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { success, reset } = await ratelimit.limit(key)
  if (success) return { allowed: true, retryAfterSeconds: 0 }
  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000)
  return { allowed: false, retryAfterSeconds }
}
