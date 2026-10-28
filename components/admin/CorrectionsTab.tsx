"use client";

import { useCallback, useEffect, useState } from "react";
import type { CorrectionEntry, CorrectionStatus } from "@/lib/types";

const STATUSES: CorrectionStatus[] = ["pending", "reviewed", "responded"];

const KIND_LABELS: Record<string, string> = {
  correction: "Correction",
  response: "Response requested",
  other: "Other",
};

/** Private inbox: nothing submitted through the public form is shown publicly. */
export default function CorrectionsTab() {
  const [entries, setEntries] = useState<CorrectionEntry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    fetch("/api/admin/corrections", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setEntries(Array.isArray(data.entries) ? data.entries : []);
      })
      .catch(() => {
        /* offline — keep whatever is already on screen */
      });
  }, [reloadKey]);

  async function setStatus(id: string, status: CorrectionStatus) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/corrections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("Could not update the status.");
        return;
      }
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy-deep">Corrections inbox</h2>
        <p className="mt-1 text-[0.93rem] leading-relaxed text-ink-soft">
          Messages sent through the corrections form on the public page. They are
          stored privately and are never published automatically — if you decide to
          publish a correction or response, do it yourself in the relevant section.
        </p>
      </div>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="note">No messages received yet.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {entry.name || "Anonymous"}
                    {entry.organisation ? ` — ${entry.organisation}` : ""}
                  </p>
                  <p className="text-[0.8rem] text-ink-soft">
                    {KIND_LABELS[entry.kind] ?? entry.kind} ·{" "}
                    {new Date(entry.created_at + "Z").toLocaleString("en-IN")}
                    {entry.email ? ` · ${entry.email}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-slate-700">
                  {entry.status}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-[0.93rem] leading-relaxed text-ink">
                {entry.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== entry.status).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy === entry.id}
                    onClick={() => void setStatus(entry.id, s)}
                  >
                    Mark as {s}
                  </button>
                ))}
                {entry.email && (
                  <a
                    className="btn btn-outline btn-sm"
                    href={`mailto:${entry.email}`}
                  >
                    Reply by email
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}