import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "./db";

export const SESSION_COOKIE = "yaarab_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

/** scrypt hash: `scrypt$N$r$p$saltB64$keyB64` — never store the raw code. */
export function hashSecret(plain: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(plain, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export function verifySecret(plain: string, stored: string): boolean {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [, nStr, rStr, pStr, saltB64, keyB64] = parts;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(keyB64, "base64");
    const actual = scryptSync(plain, salt, expected.length, {
      N: Number(nStr),
      r: Number(rStr),
      p: Number(pStr),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Verify the supplied code against the single server-side credential. */
export function verifyAdminCode(code: string): boolean {
  const row = getDb()
    .prepare("SELECT password_hash FROM admin_credentials WHERE id = 1")
    .get() as { password_hash: string } | undefined;
  if (!row) return false;
  return verifySecret(code, row.password_hash);
}

export function setAdminCode(code: string): void {
  getDb()
    .prepare(
      "UPDATE admin_credentials SET password_hash = ?, updated_at = datetime('now') WHERE id = 1"
    )
    .run(hashSecret(code));
}

/* ── Sessions ─────────────────────────────────────────────────────────── */

export interface Session {
  token: string;
  tokenHash: string;
}

export function createSession(): Session {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const db = getDb();
  // Opportunistic cleanup of expired sessions.
  db.prepare("DELETE FROM admin_sessions WHERE expires_at < ?").run(Date.now());
  db.prepare(
    "INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)"
  ).run(tokenHash, expiresAt);
  return { token, tokenHash };
}

export function sessionIsValid(token: string | undefined): boolean {
  if (!token) return false;
  const tokenHash = sha256(token);
  const db = getDb();
  const row = db
    .prepare("SELECT expires_at FROM admin_sessions WHERE token_hash = ?")
    .get(tokenHash) as { expires_at: number } | undefined;
  if (!row) return false;
  if (row.expires_at < Date.now()) {
    db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(tokenHash);
    return false;
  }
  return true;
}

export function destroySession(token: string | undefined): void {
  if (!token) return;
  getDb()
    .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
    .run(sha256(token));
}

export function destroyOtherSessions(currentToken: string | undefined): void {
  const db = getDb();
  if (!currentToken) {
    db.prepare("DELETE FROM admin_sessions").run();
    return;
  }
  db.prepare("DELETE FROM admin_sessions WHERE token_hash <> ?").run(
    sha256(currentToken)
  );
}

export function tokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(SESSION_COOKIE)?.value;
}

export function isAdminRequest(req: NextRequest): boolean {
  return sessionIsValid(tokenFromRequest(req));
}

/** For server components: read the session cookie outside a route handler. */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return sessionIsValid(store.get(SESSION_COOKIE)?.value);
}

/* ── Request helpers ──────────────────────────────────────────────────── */

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

/**
 * Defence-in-depth same-origin check for state-changing admin requests.
 * Browsers always send Origin on cross-origin fetches; same-origin requests
 * either omit it or match the host. Absent Origin (e.g. curl) is allowed.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}


/**
 * Whether this request arrived over HTTPS.
 *
 * The session cookie must only be flagged `Secure` when the connection really
 * is HTTPS. Keying it off NODE_ENV alone breaks phone testing on the LAN: over
 * plain http://192.168.1.10:3000 the browser silently drops a Secure cookie, so
 * sign-in appears to work while every admin API call after it returns 401.
 */
export function isHttpsRequest(req: NextRequest): boolean {
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto) return proto === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}
