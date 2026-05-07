/**
 * Login rate limiter.
 *
 * Two implementations behind one async API:
 *
 *   - **Vercel KV / Upstash Redis** when `KV_REST_API_URL` and
 *     `KV_REST_API_TOKEN` are set. Sliding window via `@upstash/ratelimit`,
 *     durable across cold starts and shared across regions.
 *
 *   - **In-memory Map** otherwise. Per-instance, lost on cold start, but
 *     adequate for single-region low-traffic admin and for local dev.
 *
 * Threshold: 5 attempts / 15 min / IP. Generous enough to avoid locking out
 * a fumbling admin; tight enough that an unattended brute-forcer hits the
 * wall in seconds. Only login POST is rate-limited; the cookie-based
 * session check in middleware is not (it's already cheap and stateless).
 */

import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// ────────────────────────────────────────────────────────────────────
// In-memory fallback. Map<ip, Array<timestamp>> with timestamps inside
// the rolling window only.
// ────────────────────────────────────────────────────────────────────

const memoryAttempts: Map<string, number[]> = new Map();

function inMemoryCheck(ip: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = (memoryAttempts.get(ip) ?? []).filter((t) => t > cutoff);

  // Always record this attempt (whether allowed or not). That way a flood of
  // failures actually produces a lockout instead of resetting the counter.
  recent.push(now);
  memoryAttempts.set(ip, recent);

  const remaining = Math.max(0, MAX_ATTEMPTS - recent.length);
  const reset = recent[0] + WINDOW_MS;

  return {
    success: recent.length <= MAX_ATTEMPTS,
    limit: MAX_ATTEMPTS,
    remaining,
    reset,
  };
}

// ────────────────────────────────────────────────────────────────────
// Vercel KV / Upstash variant. Lazily constructed so we don't reach into
// `kv` at import time (which would NPE if env vars are absent).
// ────────────────────────────────────────────────────────────────────

let kvLimiter: Ratelimit | null = null;

function getKvLimiter(): Ratelimit | null {
  if (kvLimiter) return kvLimiter;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;

  // Sliding window keeps the rate smooth — a flood at minute 14:59 doesn't
  // reset the counter at 15:00, the way a fixed window would.
  kvLimiter = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, '15 m'),
    analytics: false,
    prefix: 'pomfret:admin-login',
  });
  return kvLimiter;
}

// ────────────────────────────────────────────────────────────────────
// Public API.
// ────────────────────────────────────────────────────────────────────

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** UNIX ms timestamp when the oldest attempt in the window will fall off. */
  reset: number;
};

export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  // Treat empty/unknown IP as a single shared bucket so we still cap aggregate
  // unauthenticated traffic. (Better than per-empty-string-being-its-own-key.)
  const identifier = ip || 'unknown';

  const limiter = getKvLimiter();
  if (!limiter) return inMemoryCheck(identifier);

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Best-effort client-IP extraction for Server Actions / Route Handlers.
 * Reads the standard Vercel / proxy headers; falls back to 'unknown'.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Spec: client, proxy1, proxy2 — first entry is the real client.
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
