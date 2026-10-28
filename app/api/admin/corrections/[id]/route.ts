import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { cleanStr, guardAdmin, readJson } from "@/lib/admin-api";

export const runtime = "nodejs";

const STATUSES = new Set(["pending", "reviewed", "responded"]);

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = await readJson(req);
  if (!body) return Response.json({ error: "Invalid body." }, { status: 400 });
  const status = cleanStr(body.status, 20);
  if (!STATUSES.has(status)) {
    return Response.json({ error: "Unknown status." }, { status: 400 });
  }
  const result = getDb()
    .prepare("UPDATE corrections SET status = ? WHERE id = ?")
    .run(status, id);
  if (result.changes === 0) {
    return Response.json({ error: "Entry not found." }, { status: 404 });
  }
  return Response.json({ ok: true });
}