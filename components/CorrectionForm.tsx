"use client";

import { useState } from "react";

const KINDS = [
  { value: "correction", label: "Correction to something written here" },
  { value: "response", label: "I want to publish a response" },
  { value: "other", label: "Something else" },
];

export default function CorrectionForm() {
  const [form, setForm] = useState({
    name: "",
    organisation: "",
    email: "",
    kind: "correction",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 429
            ? "Too many submissions from this connection. Please try again later."
            : data.error || "Could not send your message."
        );
        setStatus("idle");
        return;
      }
      setStatus("sent");
      setForm({
        name: "",
        organisation: "",
        email: "",
        kind: "correction",
        message: "",
      });
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="card mt-6 p-5">
        <p className="success-text">
          Thank you — your message has been received.
        </p>
        <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-soft">
          It will be reviewed before anything from it is published on this page. If
          you left an email address and a reply is needed, I will use it only for
          that purpose.
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-4"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="label">
            Your name <span className="font-normal">(optional)</span>
          </label>
          <input
            id="cf-name"
            className="input"
            value={form.name}
            maxLength={120}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cf-org" className="label">
            Organisation <span className="font-normal">(optional)</span>
          </label>
          <input
            id="cf-org"
            className="input"
            value={form.organisation}
            maxLength={160}
            onChange={(e) => update("organisation", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-email" className="label">
            Email <span className="font-normal">(optional)</span>
          </label>
          <input
            id="cf-email"
            type="email"
            className="input"
            value={form.email}
            maxLength={200}
            onChange={(e) => update("email", e.target.value)}
          />
          <p className="hint">Used only to reply to you. Never published.</p>
        </div>
        <div>
          <label htmlFor="cf-kind" className="label">
            Reason for contacting me
          </label>
          <select
            id="cf-kind"
            className="select"
            value={form.kind}
            onChange={(e) => update("kind", e.target.value)}
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className="label">
          Your message
        </label>
        <textarea
          id="cf-message"
          className="textarea"
          value={form.message}
          maxLength={5000}
          required
          onChange={(e) => update("message", e.target.value)}
        />
        <p className="hint">
          Please include dates, reference numbers or details of any evidence you
          hold. Minimum 20 characters ({form.message.trim().length}/5000).
        </p>
      </div>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}