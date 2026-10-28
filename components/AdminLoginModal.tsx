"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Secure login box: posts the code to the server-side API; nothing is checked in the browser. */
export default function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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
            ? "Too many incorrect attempts. Please try again later."
            : data.error || "Login failed."
        );
        return;
      }
      onClose();
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-navy-deep/60 p-4 pt-24"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
        className="card w-full max-w-sm p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2
            id="admin-login-title"
            className="text-base font-bold text-navy-deep"
          >
            Administrator access
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            aria-label="Close login box"
          >
            Close
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="admin-code" className="label">
              Access code
            </label>
            <input
              ref={inputRef}
              id="admin-code"
              name="code"
              type="password"
              autoComplete="current-password"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <p className="hint">
              Verified on the server. It is never stored in this page.
            </p>
          </div>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy}
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}