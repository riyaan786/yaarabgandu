import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { guardAdmin, readJson } from "@/lib/admin-api";
import {
  resourceOf,
  TABLES,
  validateContentInput,
} from "@/lib/content-validation";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const type = resourceOf(new URL(req.url).searchParams.get("type"));
  if (!type) return Response.json({ error: "Unknown type." }, { status: 400 });

  const body = await readJson(req);
  if (!body) return Response.json({ error: "Invalid body." }, { status: 400 });

  const db = getDb();
  const existing = db
    .prepare(`SELECT id FROM ${TABLES[type]} WHERE id = ?`)
    .get(id);
  if (!existing) {
    return Response.json({ error: "Entry not found." }, { status: 404 });
  }

  const result = validateContentInput(type, body, true);
  if (result.error || !result.sets) {
    return Response.json(
      { error: result.error || "Invalid data." },
      { status: 400 }
    );
  }
  db.prepare(
    `UPDATE ${TABLES[type]} SET ${result.sets.join(", ")}, updated_at = datetime('now') WHERE id = ?`
  ).run(...(result.params ?? []), id);
  const entry = db.prepare(`SELECT * FROM ${TABLES[type]} WHERE id = ?`).get(id);
  return Response.json({ entry });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const type = resourceOf(new URL(req.url).searchParams.get("type"));
  if (!type) return Response.json({ error: "Unknown type." }, { status: 400 });

  const db = getDb();
  const result = db.prepare(`DELETE FROM ${TABLES[type]} WHERE id = ?`).run(id);
  if (result.changes === 0) {
    return Response.json({ error: "Entry not found." }, { status: 404 });
  }
  return Response.json({ ok: true });
}