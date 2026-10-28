import { getDb } from "./db";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Fixed-window rate limiter backed by the database so limits survive
 * restarts and apply per deployment instance.
 */
export function checkRateLimit(
  ip: string,
  kind: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const db = getDb();
  const now = Date.now();
  const since = now - windowMs;

  // Opportunistic cleanup of old events.
  db.prepare("DELETE FROM rate_events WHERE created_at < ?").run(
    now - 24 * 60 * 60 * 1000
  );

  const row = db
    .prepare(
      "SELECT COUNT(*) AS c, MIN(created_at) AS oldest FROM rate_events WHERE ip = ? AND kind = ? AND created_at > ?"
    )
    .get(ip, kind, since) as { c: number; oldest: number | null };

  if (row.c >= max) {
    const oldest = row.oldest ?? now;
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }
  return { ok: true, remaining: max - row.c, retryAfterSec: 0 };
}

export function recordRateEvent(ip: string, kind: string): void {
  getDb()
    .prepare("INSERT INTO rate_events (ip, kind, created_at) VALUES (?, ?, ?)")
    .run(ip, kind, Date.now());
}

export function clearRateEvents(ip: string, kind: string): void {
  getDb()
    .prepare("DELETE FROM rate_events WHERE ip = ? AND kind = ?")
    .run(ip, kind);
}

/** Standard 429 response with Retry-After header. */
export function tooManyRequests(retryAfterSec: number): Response {
  return Response.json(
    { error: "Too many attempts. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}