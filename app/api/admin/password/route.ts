import type { NextRequest } from "next/server";
import {
  destroyOtherSessions,
  setAdminCode,
  verifyAdminCode,
  SESSION_COOKIE,
} from "@/lib/auth";
import { guardAdmin, readJson, cleanStr } from "@/lib/admin-api";
import { getClientIp } from "@/lib/auth";
import { checkRateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Change the administrator access code.
 * Requires the current valid session + current code; the new code is re-hashed
 * with scrypt and all other sessions are invalidated.
 */
export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, "password_change", 10, 60 * 60 * 1000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  const body = await readJson(req);
  if (!body) return Response.json({ error: "Invalid body." }, { status: 400 });
  const current = cleanStr(body.current_code, 256);
  const next = cleanStr(body.new_code, 256);

  if (!current || !next) {
    return Response.json(
      { error: "Both the current and new access codes are required." },
      { status: 400 }
    );
  }
  if (next.length < 6) {
    return Response.json(
      { error: "The new access code must be at least 6 characters." },
      { status: 400 }
    );
  }
  if (!verifyAdminCode(current)) {
    return Response.json(
      { error: "The current access code is incorrect." },
      { status: 401 }
    );
  }

  setAdminCode(next);
  destroyOtherSessions(req.cookies.get(SESSION_COOKIE)?.value);
  return Response.json({ ok: true });
}