"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Fallback sign-in shown when /admin is opened without a valid session. */
export default function AdminSignIn() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 429
            ? "Too many incorrect attempts. Please wait and try again."
            : data.error || "Login failed."
        );
        return;
      }
      setCode("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-sm space-y-3 p-5">
      <div>
        <label htmlFor="admin-page-code" className="label">
          Administrator access code
        </label>
        <input
          id="admin-page-code"
          type="password"
          autoComplete="current-password"
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <p className="hint">
          Verified on the server against a scrypt hash. Nothing is stored in the
          browser.
        </p>
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}