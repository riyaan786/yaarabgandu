import { getDb } from "./db";
import type {
  AuthorityLog,
  CorrectionEntry,
  ImageRecord,
  PricingEntry,
  ReviewTimelineEntry,
  VisitRecord,
  VisitSection,
} from "./types";

/** Published evidence only — this is what visitors can see. */
export function getPublishedImages(category?: string): ImageRecord[] {
  const db = getDb();
  if (category) {
    return db
      .prepare(
        "SELECT * FROM images WHERE published = 1 AND category = ? ORDER BY capture_date DESC, created_at DESC"
      )
      .all(category) as ImageRecord[];
  }
  return db
    .prepare(
      "SELECT * FROM images WHERE published = 1 ORDER BY capture_date DESC, created_at DESC"
    )
    .all() as ImageRecord[];
}

export function getImageById(id: string): ImageRecord | undefined {
  return getDb()
    .prepare("SELECT * FROM images WHERE id = ?")
    .get(id) as ImageRecord | undefined;
}

export function getAllImages(): ImageRecord[] {
  return getDb()
    .prepare("SELECT * FROM images ORDER BY created_at DESC")
    .all() as ImageRecord[];
}

export function getPricingEntries(): PricingEntry[] {
  return getDb()
    .prepare("SELECT * FROM pricing_entries ORDER BY date DESC, created_at DESC")
    .all() as PricingEntry[];
}

export function getAuthorityLogs(): AuthorityLog[] {
  return getDb()
    .prepare("SELECT * FROM authority_logs ORDER BY date DESC, created_at DESC")
    .all() as AuthorityLog[];
}

export function getReviewTimeline(): ReviewTimelineEntry[] {
  return getDb()
    .prepare("SELECT * FROM review_timeline ORDER BY date ASC, created_at ASC")
    .all() as ReviewTimelineEntry[];
}

export function getVisitRecord(section: VisitSection): VisitRecord {
  const row = getDb()
    .prepare("SELECT * FROM visit_records WHERE section = ?")
    .get(section) as VisitRecord | undefined;
  return (
    row ?? {
      section,
      visit_date: "",
      visit_time: "",
      service: "",
      amount_paid: "",
      description: "",
      updated_at: "",
    }
  );
}

export function getCorrections(): CorrectionEntry[] {
  return getDb()
    .prepare("SELECT * FROM corrections ORDER BY created_at DESC")
    .all() as CorrectionEntry[];
}

/** Indian rupee formatting for documented amounts. */
export function formatRupee(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string): string {
  if (!value) return "";
  // Accepts YYYY-MM-DD (or a datetime prefix) — display in a stable, readable form.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${m[3]} ${months[Number(m[2]) - 1]} ${m[1]}`;
}