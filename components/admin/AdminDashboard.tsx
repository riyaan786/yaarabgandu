"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContentResource } from "@/lib/types";
import ContentTab from "./ContentTab";
import RecordsTab from "./RecordsTab";
import PhotosTab from "./PhotosTab";
import CorrectionsTab from "./CorrectionsTab";
import SettingsTab from "./SettingsTab";

type TabKey =
  | "photos"
  | "records"
  | ContentResource
  | "corrections"
  | "settings";

const TABS: { key: TabKey; label: string }[] = [
  { key: "photos", label: "Photos & evidence" },
  { key: "records", label: "Visit records" },
  { key: "pricing", label: "Pricing" },
  { key: "authority", label: "Authorities" },
  { key: "reviews", label: "Review timeline" },
  { key: "corrections", label: "Corrections inbox" },
  { key: "settings", label: "Security" },
];

/** Tab shell for the private documentation dashboard. */
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("photos");
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Admin sections"
          className="flex flex-wrap gap-1"
          role="tablist"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`btn btn-sm ${
                tab === t.key ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => void signOut()}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
        {tab === "photos" && <PhotosTab />}
        {tab === "records" && <RecordsTab />}
        {(tab === "pricing" || tab === "authority" || tab === "reviews") && (
          <ContentTab key={tab} resource={tab} />
        )}
        {tab === "corrections" && <CorrectionsTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}