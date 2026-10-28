"use client";

import { useCallback, useEffect, useState } from "react";
import type { VisitRecord, VisitSection } from "@/lib/types";

const SECTIONS: { key: VisitSection; title: string; blurb: string }[] = [
  {
    key: "customer_service",
    title: "Visit details — customer service",
    blurb:
      "These details appear in the “My Experience With Customer Service” section of the public page.",
  },
  {
    key: "staff_language",
    title: "Visit details — language & behaviour",
    blurb:
      "These details appear in the “Language and Behaviour in Front of Customers” section.",
  },
];

type Values = Record<VisitSection, VisitRecord>;

const EMPTY: VisitRecord = {
  section: "customer_service",
  visit_date: "",
  visit_time: "",
  service: "",
  amount_paid: "",
  description: "",
  updated_at: "",
};

export default function RecordsTab() {
  const [values, setValues] = useState<Values>({
    customer_service: EMPTY,
    staff_language: { ...EMPTY, section: "staff_language" },
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<VisitSection | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    fetch("/api/admin/records", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.records) return;
        setValues({
          customer_service: data.records.customer_service ?? {
            ...EMPTY,
            section: "customer_service",
          },
          staff_language: data.records.staff_language ?? {
            ...EMPTY,
            section: "staff_language",
          },
        });
      })
      .catch(() => {
        /* offline — keep whatever is already on screen */
      });
  }, [reloadKey]);

  function update(section: VisitSection, field: keyof VisitRecord, value: string) {
    setValues((v) => ({ ...v, [section]: { ...v[section], [field]: value } }));
  }

  async function save(section: VisitSection) {
    setBusy(section);
    setNotice("");
    setError("");
    try {
      const res = await fetch(`/api/admin/records/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values[section]),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save these details.");
        return;
      }
      setNotice("Details saved.");
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
        <h2 className="text-lg font-bold text-navy-deep">Visit records</h2>
        <p className="mt-1 text-[0.93rem] leading-relaxed text-ink-soft">
          Record the factual details of your visit. Blank fields are simply left
          out of the public page, and nothing is displayed until you fill it in.
        </p>
      </div>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {notice && <p className="success-text">{notice}</p>}

      {SECTIONS.map(({ key, title, blurb }) => {
        const record = values[key];
        return (
          <form
            key={key}
            className="card p-5"
            onSubmit={(e) => {
              e.preventDefault();
              void save(key);
            }}
          >
            <h3 className="font-bold text-navy-deep">{title}</h3>
            <p className="mt-1 text-[0.9rem] text-ink-soft">{blurb}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${key}-date`} className="label">
                  Date of visit
                </label>
                <input
                  id={`${key}-date`}
                  type="date"
                  className="input"
                  value={record.visit_date}
                  onChange={(e) => update(key, "visit_date", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${key}-time`} className="label">
                  Approximate time
                </label>
                <input
                  id={`${key}-time`}
                  type="text"
                  className="input"
                  placeholder="e.g. around 6:30 pm"
                  maxLength={40}
                  value={record.visit_time}
                  onChange={(e) => update(key, "visit_time", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${key}-service`} className="label">
                  Service or product
                </label>
                <input
                  id={`${key}-service`}
                  type="text"
                  className="input"
                  maxLength={300}
                  value={record.service}
                  onChange={(e) => update(key, "service", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${key}-amount`} className="label">
                  Amount paid
                </label>
                <input
                  id={`${key}-amount`}
                  type="text"
                  className="input"
                  placeholder="e.g. ₹2,400"
                  maxLength={100}
                  value={record.amount_paid}
                  onChange={(e) => update(key, "amount_paid", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${key}-desc`} className="label">
                  Description of what happened
                </label>
                <textarea
                  id={`${key}-desc`}
                  className="textarea"
                  rows={6}
                  maxLength={5000}
                  value={record.description}
                  onChange={(e) => update(key, "description", e.target.value)}
                />
                <p className="hint">
                  Stick to what you personally experienced or observed.
                </p>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-5"
              disabled={busy === key}
            >
              {busy === key ? "Saving…" : "Save details"}
            </button>
          </form>
        );
      })}
    </div>
  );
}