import type { NextRequest } from "next/server";
import { getAllImages } from "@/lib/content";
import { getDb } from "@/lib/db";
import { guardAdmin, cleanStr, toCategoryOrNull } from "@/lib/admin-api";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  return Response.json({ images: getAllImages() });
}

/**
 * Multipart upload. The file is validated by magic bytes (JPG/PNG/WebP only),
 * capped at 10 MB, stored outside /public under a random server-generated
 * name, and always created as an unpublished draft.
 */
export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file received." }, { status: 400 });
  }

  const saved = await saveUpload(file);
  if ("status" in saved) {
    return Response.json({ error: saved.error }, { status: saved.status });
  }

  const caption = cleanStr(form.get("caption"), 300);
  const capture_date = cleanStr(form.get("capture_date"), 40);
  const description = cleanStr(form.get("description"), 2000);
  const category = toCategoryOrNull(form.get("category")) ?? "other";

  getDb()
    .prepare(
      `INSERT INTO images (id, filename, original_name, mime, size, caption, capture_date, description, category, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
    .run(
      saved.id,
      saved.filename,
      saved.originalName,
      saved.mime,
      saved.size,
      caption,
      capture_date,
      description,
      category
    );

  const image = getDb().prepare("SELECT * FROM images WHERE id = ?").get(saved.id);
  return Response.json({ image }, { status: 201 });
}