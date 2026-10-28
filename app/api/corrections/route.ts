import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { checkRateLimit, recordRateEvent, tooManyRequests } from "@/lib/rate-limit";

const KINDS = new Set(["correction", "response", "other"]);

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Public corrections/responses inbox.
 * Submissions are stored as `pending` and are NEVER published automatically —
 * they are only visible inside the admin dashboard.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Max 3 submissions per IP per hour.
  const limit = checkRateLimit(ip, "correction", 3, 60 * 60 * 1000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const organisation = clean(body.organisation, 160);
  const email = clean(body.email, 200);
  const kind = KINDS.has(body.kind as string) ? (body.kind as string) : "other";
  const message = clean(body.message, 5000);

  if (message.length < 20) {
    return Response.json(
      { error: "Please provide a detailed message (at least 20 characters)." },
      { status: 400 }
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "Please provide a valid email address or leave it blank." },
      { status: 400 }
    );
  }

  getDb()
    .prepare(
      "INSERT INTO corrections (id, name, organisation, email, kind, message) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(randomUUID(), name, organisation, email, kind, message);

  recordRateEvent(ip, "correction");
  return Response.json({ ok: true });
}