import { NextResponse, type NextRequest } from "next/server";
import {
  createSession,
  getClientIp,
  isAdminRequest,
  isHttpsRequest,
  isSameOrigin,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  verifyAdminCode,
} from "@/lib/auth";
import {
  checkRateLimit,
  clearRateEvents,
  recordRateEvent,
  tooManyRequests,
} from "@/lib/rate-limit";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (isAdminRequest(req)) {
    return Response.json({ ok: true, already: true });
  }

  const ip = getClientIp(req);
  // Max 5 failed attempts per IP per 15 minutes.
  const limit = checkRateLimit(ip, "login_fail", 5, 15 * 60 * 1000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  let code = "";
  try {
    const body = await req.json();
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!code || code.length > 256) {
    return Response.json({ error: "Access code is required." }, { status: 400 });
  }

  if (!verifyAdminCode(code)) {
    recordRateEvent(ip, "login_fail");
    // Small constant-ish delay to slow brute-force attempts.
    await sleep(250 + Math.floor(Math.random() * 150));
    return Response.json({ error: "Incorrect access code." }, { status: 401 });
  }

  clearRateEvents(ip, "login_fail");
  const session = createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsRequest(req),
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return res;
}