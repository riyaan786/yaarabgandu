"use client";

import { useState } from "react";

/** Rotate the administrator access code (verified server-side). */
export default function SettingsTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmNext, setConfirmNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (next !== confirmNext) {
      setError("The two new codes do not match.");
      return;
    }
    if (next.length < 6) {
      setError("The new access code must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_code: current, new_code: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not change the access code.");
        return;
      }
      setCurrent("");
      setNext("");
      setConfirmNext("");
      setNotice(
        "Access code updated. All other signed-in sessions have been signed out."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy-deep">Security</h2>
        <p className="mt-1 text-[0.93rem] leading-relaxed text-ink-soft">
          The access code is verified on the server against a scrypt hash and is
          never stored in the browser. Changing it signs out every other device.
        </p>
      </div>

      <form onSubmit={submit} className="card max-w-md space-y-4 p-5">
        <div>
          <label htmlFor="pw-current" className="label">
            Current access code
          </label>
          <input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            className="input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="pw-next" className="label">
            New access code
          </label>
          <input
            id="pw-next"
            type="password"
            autoComplete="new-password"
            className="input"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          <p className="hint">At least 6 characters.</p>
        </div>
        <div>
          <label htmlFor="pw-confirm" className="label">
            Repeat the new access code
          </label>
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            className="input"
            value={confirmNext}
            onChange={(e) => setConfirmNext(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="success-text">{notice}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Updating…" : "Update access code"}
        </button>
      </form>

      <div className="card max-w-md p-5">
        <h3 className="font-bold text-navy-deep">How your data is kept</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.9rem] leading-relaxed text-ink-soft">
          <li>
            Content, records and messages are stored in a SQLite database on this
            server.
          </li>
          <li>
            Uploaded photographs live in <code>data/uploads/</code> — outside the
            public folder — and are streamed only when an entry is published.
          </li>
          <li>
            Each upload is checked on the server (real image magic bytes, JPG/PNG/
            WebP only, maximum size limited) before it is saved.
          </li>
          <li>
            Sign-in attempts are rate-limited, and the session cookie is HttpOnly
            and SameSite.
          </li>
        </ul>
      </div>
    </div>
  );
}