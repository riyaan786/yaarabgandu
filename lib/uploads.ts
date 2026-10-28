import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "./db";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

export type AllowedMime = keyof typeof EXT_BY_MIME;

/**
 * Magic-byte sniffing — the declared MIME type and file extension supplied by
 * the client are never trusted. Executables, SVG (can contain script), HEIC
 * and everything else are rejected.
 */
export function sniffImageType(buf: Buffer): AllowedMime | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length >= 8 && buf.subarray(0, 8).equals(pngSig)) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/** Keep a readable but path-safe version of the original filename for display. */
export function sanitizeOriginalName(name: string): string {
  const base = name.split(/[\\/]/).pop() || "";
  const cleaned = base.replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return cleaned || "upload";
}

export interface SaveUploadResult {
  id: string;
  filename: string;
  mime: AllowedMime;
  size: number;
  originalName: string;
}

export type SaveUploadError = { status: 400 | 413 | 415; error: string };

export async function saveUpload(
  file: File
): Promise<SaveUploadResult | SaveUploadError> {
  if (!file || file.size === 0) {
    return { status: 400, error: "No file received." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      status: 413,
      error: "File is larger than the 10 MB upload limit.",
    };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_UPLOAD_BYTES) {
    return { status: 413, error: "File is larger than the 10 MB upload limit." };
  }
  const mime = sniffImageType(buf);
  if (!mime) {
    return {
      status: 415,
      error:
        "That file type is not accepted. Only JPG, PNG and WebP images are allowed. A HEIC/HEIF photo — from an iPhone, or from an Android camera set to “HEIF pictures” — is not, so use the camera option or set the camera to save JPEG.",
    };
  }
  const id = randomUUID();
  const filename = `${id}${EXT_BY_MIME[mime]}`;
  // Stored outside /public: only /api/media/[id] can serve these bytes.
  await fs.writeFile(path.join(/* turbopackIgnore: true */ UPLOADS_DIR, filename), buf, {
    mode: 0o644,
    flag: "wx",
  });
  return {
    id,
    filename,
    mime,
    size: buf.length,
    originalName: sanitizeOriginalName(file.name || "upload"),
  };
}

export async function deleteUploadFile(filename: string): Promise<void> {
  // Only ever operate on bare filenames inside UPLOADS_DIR.
  const safe = path.basename(filename);
  if (safe !== filename) return;
  try {
    await fs.unlink(path.join(UPLOADS_DIR, safe));
  } catch {
    /* already gone */
  }
}