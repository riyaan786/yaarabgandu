import type { NextRequest } from "next/server";
import { getCorrections } from "@/lib/content";
import { guardAdmin } from "@/lib/admin-api";

export const runtime = "nodejs";

/** Pending corrections/responses — admin only, never public. */
export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  return Response.json({ entries: getCorrections() });
}