import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { guardAdmin, readJson } from "@/lib/admin-api";
import {
  resourceOf,
  TABLES,
  validateContentInput,
} from "@/lib/content-validation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const type = resourceOf(new URL(req.url).searchParams.get("type"));
  if (!type) return Response.json({ error: "Unknown type." }, { status: 400 });
  const entries = getDb()
    .prepare(`SELECT * FROM ${TABLES[type]} ORDER BY created_at DESC`)
    .all();
  return Response.json({ entries });
}

export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const body = await readJson(req);
  if (!body) return Response.json({ error: "Invalid body." }, { status: 400 });
  const type = resourceOf(body.type);
  if (!type) return Response.json({ error: "Unknown type." }, { status: 400 });

  const result = validateContentInput(type, body, false);
  if (result.error || !result.sets) {
    return Response.json(
      { error: result.error || "Invalid data." },
      { status: 400 }
    );
  }
  const id = randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO ${TABLES[type]} (id, ${result.sets.join(", ")}) VALUES (?, ${result.sets
      .map(() => "?")
      .join(", ")})`
  ).run(id, ...(result.params ?? []));
  const entry = db.prepare(`SELECT * FROM ${TABLES[type]} WHERE id = ?`).get(id);
  return Response.json({ entry }, { status: 201 });
}