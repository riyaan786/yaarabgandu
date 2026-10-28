import {
  cleanDate,
  cleanStr,
  toIdOrNull,
  toNumOrNull,
} from "./admin-api";
import { getImageById } from "./content";
import type { ContentResource } from "./types";

/** Whitelist — user-supplied type values can only map to these fixed tables. */
export const TABLES: Record<ContentResource, string> = {
  pricing: "pricing_entries",
  authority: "authority_logs",
  reviews: "review_timeline",
};

export function resourceOf(value: unknown): ContentResource | null {
  return typeof value === "string" && value in TABLES
    ? (value as ContentResource)
    : null;
}

export interface Validated {
  sets?: string[];
  params?: unknown[];
  error?: string;
}

/** Builds a fixed-column SET clause from untrusted input. Columns are fixed in code. */
export function validateContentInput(
  type: ContentResource,
  body: Record<string, unknown>,
  partial: boolean
): Validated {
  const sets: string[] = [];
  const params: unknown[] = [];
  const put = (col: string, val: unknown) => {
    sets.push(col);
    params.push(val);
  };

  if (type === "pricing") {
    if (!partial || "item" in body) {
      const item = cleanStr(body.item, 200);
      if (!item) return { error: "Item/service name is required." };
      put("item", item);
    }
    if ("amount_paid" in body) put("amount_paid", toNumOrNull(body.amount_paid));
    if ("comparable_price" in body)
      put("comparable_price", toNumOrNull(body.comparable_price));
    if ("date" in body) put("date", cleanDate(body.date));
    if ("notes" in body) put("notes", cleanStr(body.notes, 2000));
    if ("receipt_image_id" in body) {
      const imgId = toIdOrNull(body.receipt_image_id);
      if (imgId && !getImageById(imgId))
        return { error: "Receipt image does not exist." };
      put("receipt_image_id", imgId);
    }
  } else if (type === "authority") {
    if (!partial || "authority" in body) {
      const authority = cleanStr(body.authority, 120);
      if (!authority) return { error: "Authority name is required." };
      put("authority", authority);
    }
    if ("date" in body) put("date", cleanDate(body.date));
    if ("details" in body) put("details", cleanStr(body.details, 2000));
    if ("reference_number" in body)
      put("reference_number", cleanStr(body.reference_number, 120));
    if ("response" in body) put("response", cleanStr(body.response, 2000));
  } else {
    // review timeline
    if (!partial || "title" in body) {
      const title = cleanStr(body.title, 200);
      if (!title) return { error: "Title is required." };
      put("title", title);
    }
    if ("date" in body) put("date", cleanDate(body.date));
    if ("details" in body) put("details", cleanStr(body.details, 2000));
    if ("screenshot_image_id" in body) {
      const imgId = toIdOrNull(body.screenshot_image_id);
      if (imgId && !getImageById(imgId))
        return { error: "Screenshot image does not exist." };
      put("screenshot_image_id", imgId);
    }
  }

  if (sets.length === 0) return { error: "Nothing to update." };
  return { sets, params };
}