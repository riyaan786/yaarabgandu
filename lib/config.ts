export const SITE = {
  /** Exact business name — spelling must never change to "Tire". */
  businessName: "YAARAB BATTERY AND TYRE WORKS",
  locality: "Fraser Town, Bangalore (Bengaluru), Karnataka, India",
  /** Canonical homepage path (root `/` permanently redirects here). */
  homePath: "/yaarab-battery-and-tyre-works-fraser-town-bangalore",
  seoTitle:
    "YAARAB BATTERY AND TYRE WORKS, Fraser Town Bangalore – Customer Experience",
  description:
    "A customer's documented experience at YAARAB BATTERY AND TYRE WORKS in Fraser Town, Bangalore, covering customer service, pricing concerns, online reviews and pedestrian-safety concerns.",
} as const;

export const NAV: { href: string; label: string }[] = [
  { href: SITE.homePath, label: "Home" },
  { href: "#customer-service", label: "Customer Service" },
  { href: "#staff-language", label: "Language" },
  { href: "#pricing", label: "Pricing" },
  { href: "#reviews", label: "Reviews" },
  { href: "#footpath", label: "Footpath & Safety" },
  { href: "#evidence", label: "Photos & Evidence" },
  { href: "#contact", label: "Contact" },
];

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return raw.replace(/\/+$/, "");
}

export const FOOTER_NOTICE =
  "This website documents a customer's personal experience and observations. Information presented as personal experience represents the author's account. Readers should review supporting documentation and make their own assessment.";