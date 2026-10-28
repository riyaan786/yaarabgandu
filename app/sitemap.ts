import type { MetadataRoute } from "next";
import { getSiteUrl, SITE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    {
      url: `${base}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}${SITE.homePath}`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}