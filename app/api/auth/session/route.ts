import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  return Response.json({ authed: isAdminRequest(req) });
}