import type { ContentResource } from "@/lib/types";

export type FieldType = "text" | "number" | "date" | "textarea" | "image";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  maxLength?: number;
  rows?: number;
}

export interface ResourceDef {
  key: ContentResource;
  title: string;
  blurb: string;
  empty: string;
  fields: FieldDef[];
  /** Field shown as the heading of each saved entry. */
  heading: string;
}

export const RESOURCES: Record<ContentResource, ResourceDef> = {
  pricing: {
    key: "pricing",
    title: "Pricing details",
    blurb:
      "Record what you paid and, where you have one, a comparable price. The table on the public page only appears once at least one entry exists.",
    empty:
      "No pricing entries yet. Add the first one — it will appear in the pricing table on the public page.",
    heading: "item",
    fields: [
      {
        name: "item",
        label: "Item or service",
        type: "text",
        required: true,
        maxLength: 200,
      },
      {
        name: "amount_paid",
        label: "Amount paid (₹)",
        type: "number",
        help: "Leave blank if you do not want to state an amount.",
      },
      {
        name: "comparable_price",
        label: "Comparable price (₹)",
        type: "number",
        help: "A quotation or market price you obtained for the same item.",
      },
      { name: "date", label: "Date", type: "date" },
      {
        name: "receipt_image_id",
        label: "Linked receipt or document",
        type: "image",
        help: "Optional — pick an image you have already uploaded.",
      },
      {
        name: "notes",
        label: "Notes",
        type: "textarea",
        rows: 4,
        maxLength: 2000,
      },
    ],
  },
  authority: {
    key: "authority",
    title: "Authorities contacted",
    blurb:
      "Record each complaint or representation you make, with the reference number and any response. The table appears publicly only when entries exist.",
    empty:
      "No authority communications recorded yet. Add one when you raise the matter with a municipal, traffic or other authority.",
    heading: "authority",
    fields: [
      {
        name: "authority",
        label: "Authority or office",
        type: "text",
        required: true,
        maxLength: 120,
        help: "e.g. BBMP, local traffic police station, ward office.",
      },
      { name: "date", label: "Date contacted", type: "date" },
      {
        name: "reference_number",
        label: "Reference / complaint number",
        type: "text",
        maxLength: 120,
      },
      {
        name: "details",
        label: "What was reported",
        type: "textarea",
        rows: 4,
        maxLength: 2000,
      },
      {
        name: "response",
        label: "Response received",
        type: "textarea",
        rows: 3,
        maxLength: 2000,
        help: "Leave blank until you receive a reply.",
      },
    ],
  },
  reviews: {
    key: "reviews",
    title: "Review timeline",
    blurb:
      "Document each review you observed, with the date shown on it and a screenshot. Entries appear publicly in the review section.",
    empty: "No review records yet. Add the first observation to start the timeline.",
    heading: "title",
    fields: [
      {
        name: "title",
        label: "Short heading",
        type: "text",
        required: true,
        maxLength: 200,
        help: "e.g. “Five-star review posted two hours after my visit”.",
      },
      { name: "date", label: "Date displayed on the review", type: "date" },
      {
        name: "details",
        label: "What the review said / what you observed",
        type: "textarea",
        rows: 5,
        maxLength: 2000,
      },
      {
        name: "screenshot_image_id",
        label: "Review screenshot",
        type: "image",
        help: "Optional — pick an uploaded screenshot for this entry.",
      },
    ],
  },
};