import { NextResponse, type NextRequest } from "next/server";
import {
  destroySession,
  isHttpsRequest,
  SESSION_COOKIE,
  tokenFromRequest,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  destroySession(tokenFromRequest(req));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsRequest(req),
    path: "/",
    maxAge: 0,
  });
  return res;
}