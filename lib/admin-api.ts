import type { NextRequest } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/auth";
import { IMAGE_CATEGORIES, type ImageCategory } from "@/lib/types";

/** Returns an error Response when the caller may not perform admin actions. */
export function guardAdmin(req: NextRequest): Response | null {
  if (!isSameOrigin(req)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }
  return null;
}

export async function readJson(
  req: NextRequest
): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function cleanStr(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function toNumOrNull(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[,₹\s]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

/** IDs are server-generated UUIDs — reject anything else outright. */
export function toIdOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

export function toCategoryOrNull(value: unknown): ImageCategory | null {
  const v = cleanStr(value, 32);
  return IMAGE_CATEGORIES.some((c) => c.value === v)
    ? (v as ImageCategory)
    : null;
}

/** Date inputs accept YYYY-MM-DD (HTML date inputs) or a short free-form date. */
export function cleanDate(value: unknown): string {
  const v = cleanStr(value, 40);
  return /^[\d\s\-/.,A-Za-z]*$/.test(v) ? v : "";
}