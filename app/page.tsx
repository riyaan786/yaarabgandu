import { redirect } from "next/navigation";
import { SITE } from "@/lib/config";

/** The canonical homepage lives at the descriptive, SEO-friendly URL. */
export default function RootPage() {
  redirect(SITE.homePath);
}