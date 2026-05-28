/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Tracks request counts per user within a fixed time window.
 * In production, consider replacing with Redis/Upstash for
 * multi-instance deployments; this implementation is suitable
 * for single-instance Vercel serverless functions.
 */

/** Per-user request tracking entry. */
interface RateLimitEntry {
  /** Number of requests made in the current window. */
  count: number;
  /** Timestamp (ms) when the current window expires. */
  resetAt: number;
}

const requestCounts = new Map<string, RateLimitEntry>();

/** Duration of the rate limit window in milliseconds (1 minute). */
const WINDOW_MS = 60 * 1000;
/** Maximum allowed requests per user within a single window. */
const MAX_REQUESTS = 5;

/**
 * Check whether a user is allowed to make a request.
 *
 * @param userId - Unique identifier for the user (Supabase UID or IP fallback).
 * @returns `allowed: true` if under the limit, otherwise `allowed: false` with `retryAfterMs`.
 */
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
