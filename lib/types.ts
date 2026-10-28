export type ImageCategory =
  | "service"
  | "conduct"
  | "receipt"
  | "reviews"
  | "footpath"
  | "complaint"
  | "correspondence"
  | "other";

export const IMAGE_CATEGORIES: { value: ImageCategory; label: string }[] = [
  { value: "service", label: "Service & visit records" },
  { value: "conduct", label: "Staff conduct" },
  { value: "receipt", label: "Receipts & quotations" },
  { value: "reviews", label: "Online review screenshots" },
  { value: "footpath", label: "Footpath & pedestrian access" },
  { value: "complaint", label: "Complaint acknowledgements" },
  { value: "correspondence", label: "Correspondence" },
  { value: "other", label: "Other documentation" },
];

export interface ImageRecord {
  id: string;
  filename: string;
  original_name: string;
  mime: string;
  size: number;
  caption: string;
  capture_date: string;
  description: string;
  category: ImageCategory;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface PricingEntry {
  id: string;
  item: string;
  amount_paid: number | null;
  comparable_price: number | null;
  date: string;
  receipt_image_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AuthorityLog {
  id: string;
  date: string;
  authority: string;
  details: string;
  reference_number: string;
  response: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewTimelineEntry {
  id: string;
  date: string;
  title: string;
  details: string;
  screenshot_image_id: string | null;
  created_at: string;
  updated_at: string;
}

export type VisitSection = "customer_service" | "staff_language";

export interface VisitRecord {
  section: VisitSection;
  visit_date: string;
  visit_time: string;
  service: string;
  amount_paid: string;
  description: string;
  updated_at: string;
}

export type CorrectionKind = "correction" | "response" | "other";
export type CorrectionStatus = "pending" | "reviewed" | "responded";

export interface CorrectionEntry {
  id: string;
  name: string;
  organisation: string;
  email: string;
  kind: CorrectionKind;
  message: string;
  status: CorrectionStatus;
  created_at: string;
}

export type ContentResource = "pricing" | "authority" | "reviews";