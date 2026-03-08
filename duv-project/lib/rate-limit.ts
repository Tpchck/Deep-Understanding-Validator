// simple in-memory rate limiter per user
// in production you'd use Redis/Upstash, but this works for a single-instance deploy

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;      // 5 submissions per minute per user

export function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = requestCounts.get(userId);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}
