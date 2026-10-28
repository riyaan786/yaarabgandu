import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { cleanStr, guardAdmin, readJson } from "@/lib/admin-api";
import type { VisitSection } from "@/lib/types";

export const runtime = "nodejs";

const SECTIONS: VisitSection[] = ["customer_service", "staff_language"];

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ section: string }> }
) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { section } = await ctx.params;
  if (!SECTIONS.includes(section as VisitSection)) {
    return Response.json({ error: "Unknown section." }, { status: 400 });
  }
  const body = await readJson(req);
  if (!body) return Response.json({ error: "Invalid body." }, { status: 400 });

  const visit_date = cleanStr(body.visit_date, 40);
  const visit_time = cleanStr(body.visit_time, 40);
  const service = cleanStr(body.service, 300);
  const amount_paid = cleanStr(body.amount_paid, 100);
  const description = cleanStr(body.description, 5000);

  getDb()
    .prepare(
      `INSERT INTO visit_records (section, visit_date, visit_time, service, amount_paid, description, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(section) DO UPDATE SET
         visit_date = excluded.visit_date,
         visit_time = excluded.visit_time,
         service = excluded.service,
         amount_paid = excluded.amount_paid,
         description = excluded.description,
         updated_at = datetime('now')`
    )
    .run(section, visit_date, visit_time, service, amount_paid, description);

  return Response.json({ ok: true });
}