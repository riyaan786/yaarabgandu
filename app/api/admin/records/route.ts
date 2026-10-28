import type { NextRequest } from "next/server";
import { getVisitRecord } from "@/lib/content";
import { guardAdmin } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  return Response.json({
    records: {
      customer_service: getVisitRecord("customer_service"),
      staff_language: getVisitRecord("staff_language"),
    },
  });
}