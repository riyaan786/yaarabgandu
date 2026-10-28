"use client";

import { useState } from "react";
import { IMAGE_CATEGORIES, type ImageCategory, type ImageRecord } from "@/lib/types";

/** One uploaded photo: preview, edit caption/date/category, publish, delete. */
export default function PhotoCard({
  image,
  onChanged,
}: {
  image: ImageRecord;
  onChanged: () => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(image.caption);
  const [captureDate, setCaptureDate] = useState(image.capture_date);
  const [category, setCategory] = useState(image.category);
  const [description, setDescription] = useState(image.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/images/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          res.status === 401
            ? "Your admin session has expired. Reload the page and sign in again."
            : data.error || "Update failed."
        );
        return false;
      }
      await onChanged();
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this photo permanently? The file is removed.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/images/${image.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Your admin session has expired. Reload the page and sign in again."
            : "Delete failed."
        );
        return;
      }
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  const published = image.published === 1;
  const categoryLabel =
    IMAGE_CATEGORIES.find((c) => c.value === image.category)?.label ??
    image.category;

  return (
    <li className="card overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/media/${image.id}`}
        alt={image.caption || image.original_name}
        className="h-40 w-full bg-slate-100 object-cover"
      />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ${
              published
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {published ? "Published" : "Draft"}
          </span>
          <span className="truncate text-[0.72rem] text-ink-soft">
            {image.capture_date || "no date"}
          </span>
        </div>

        <p className="truncate text-[0.85rem] font-semibold text-ink">
          {image.caption || image.original_name}
        </p>
        <p className="truncate text-[0.75rem] text-ink-soft">
          {categoryLabel} · {Math.round(image.size / 1024)} KB
        </p>

        {editing && (
          <div className="space-y-2 border-t border-line pt-2">
            <input
              className="input"
              placeholder="Caption"
              maxLength={300}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              aria-label="Caption"
            />
            <input
              type="date"
              className="input"
              value={captureDate}
              onChange={(e) => setCaptureDate(e.target.value)}
              aria-label="Date captured"
            />
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ImageCategory)}
              aria-label="Category"
            >
              {IMAGE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <textarea
              className="textarea"
              rows={3}
              maxLength={2000}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Description"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={busy}
                onClick={async () => {
                  const ok = await patch({
                    caption,
                    capture_date: captureDate,
                    category,
                    description,
                  });
                  if (ok) setEditing(false);
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={busy}
            onClick={() => void patch({ published: !published })}
          >
            {published ? "Unpublish" : "Publish"}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "Close" : "Edit details"}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={busy}
            onClick={() => void remove()}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}