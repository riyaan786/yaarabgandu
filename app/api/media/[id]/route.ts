import fs from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { UPLOADS_DIR } from "@/lib/db";
import { getImageById } from "@/lib/content";

const MIME_HEADERS: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};

/**
 * Serves evidence images.
 * - Published images: public.
 * - Unpublished (draft) images: admin session required.
 * Files live outside /public, so this route is the only access path.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const image = getImageById(id);
  if (!image) {
    return new Response("Not found", { status: 404 });
  }
  if (!image.published && !isAdminRequest(req)) {
    return new Response("Not found", { status: 404 });
  }

  // filename is generated server-side (uuid + fixed extension) — validate anyway.
  const safe = path.basename(image.filename);
  if (safe !== image.filename) {
    return new Response("Not found", { status: 404 });
  }
  let buf: Buffer;
  try {
    buf = await fs.readFile(path.join(UPLOADS_DIR, safe));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const published = Boolean(image.published);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": MIME_HEADERS[image.mime] || "application/octet-stream",
      "Content-Length": String(buf.length),
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      "Cache-Control": published
        ? "public, max-age=31536000, immutable"
        : "no-store, private",
    },
  });
}