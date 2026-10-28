import type { NextRequest } from "next/server";
import { getImageById } from "@/lib/content";
import { getDb } from "@/lib/db";
import {
  cleanDate,
  cleanStr,
  guardAdmin,
  readJson,
  toCategoryOrNull,
} from "@/lib/admin-api";
import { deleteUploadFile } from "@/lib/uploads";

export const runtime = "nodejs";

function findOr404(id: string): Response | null {
  if (!getImageById(id)) {
    return Response.json({ error: "Image not found." }, { status: 404 });
  }
  return null;
}

/** Edit caption/date/description/category or publish/unpublish. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const missing = findOr404(id);
  if (missing) return missing;

  const body = await readJson(req);
  if (!body) return Response.json({ error: "Invalid body." }, { status: 400 });

  const sets: string[] = [];
  const params: unknown[] = [];
  if ("caption" in body) {
    sets.push("caption = ?");
    params.push(cleanStr(body.caption, 300));
  }
  if ("capture_date" in body) {
    sets.push("capture_date = ?");
    params.push(cleanDate(body.capture_date));
  }
  if ("description" in body) {
    sets.push("description = ?");
    params.push(cleanStr(body.description, 2000));
  }
  if ("category" in body) {
    const cat = toCategoryOrNull(body.category);
    if (!cat) return Response.json({ error: "Unknown category." }, { status: 400 });
    sets.push("category = ?");
    params.push(cat);
  }
  if ("published" in body) {
    sets.push("published = ?");
    params.push(body.published ? 1 : 0);
  }
  if (sets.length === 0) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }
  sets.push("updated_at = datetime('now')");
  params.push(id);

  getDb()
    .prepare(`UPDATE images SET ${sets.join(", ")} WHERE id = ?`)
    .run(...params);
  return Response.json({ image: getImageById(id) });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = guardAdmin(_req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const image = getImageById(id);
  if (!image) {
    return Response.json({ error: "Image not found." }, { status: 404 });
  }
  getDb().prepare("DELETE FROM images WHERE id = ?").run(id);
  await deleteUploadFile(image.filename);
  return Response.json({ ok: true });
}