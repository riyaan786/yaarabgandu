"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IMAGE_CATEGORIES, type ImageRecord } from "@/lib/types";
import PhotoCard from "./PhotoCard";

const MAX_MB = 10;

const SESSION_EXPIRED =
  "Your admin session has expired. Reload this page, sign in again with the access code, then retry.";

export default function PhotosTab() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "drafts">("all");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [captureDate, setCaptureDate] = useState("");
  const [category, setCategory] = useState("service");
  const [description, setDescription] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    fetch("/api/admin/images", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          setError(SESSION_EXPIRED);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data) setImages(Array.isArray(data.images) ? data.images : []);
      })
      .catch(() => {
        /* offline — keep whatever is already on screen */
      });
  }, [reloadKey]);

  // Object URL for the chosen file, created once and revoked when it changes.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pick(f: File | null) {
    setError("");
    if (f && f.size > MAX_MB * 1024 * 1024) {
      setError(`“${f.name}” is larger than the ${MAX_MB} MB limit.`);
      return;
    }
    // Catch HEIC/HEIF before the upload starts. iPhone Safari quietly converts
    // these to JPEG, but Android Chrome does not — a Samsung/Pixel camera set to
    // "HEIF pictures" sends a .heic file that no browser except Safari can show.
    if (f && (/\.(heic|heif)$/i.test(f.name) || /^image\/hei[cf]$/i.test(f.type))) {
      setError(
        `“${f.name}” is a HEIC/HEIF image, which cannot be used on this page. On Android, open your Camera settings and set picture format to JPEG, or pick a screenshot/JPG from the gallery — or use “Camera opened directly instead” below.`
      );
      return;
    }
    setFile(f);
    if (f && !captureDate) {
      setCaptureDate(new Date().toISOString().slice(0, 10));
    }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a photo (or take one with the camera) first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("caption", caption);
      body.append("capture_date", captureDate);
      body.append("category", category);
      body.append("description", description);

      const res = await fetch("/api/admin/images", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 401 ? SESSION_EXPIRED : data.error || "Upload failed."
        );
        return;
      }

      if (publishNow && data.image?.id) {
        await fetch(`/api/admin/images/${data.image.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: true }),
        });
      }

      setNotice(
        publishNow
          ? "Photo uploaded and published to the public page."
          : "Photo uploaded as a draft (hidden from the public page)."
      );
      setFile(null);
      setCaption("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
      await load();
    } catch {
      setError("Network error while uploading. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const visible = images.filter((img) =>
    filter === "all"
      ? true
      : filter === "published"
        ? img.published === 1
        : img.published === 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy-deep">Photographs &amp; evidence</h2>
        <p className="mt-1 text-[0.93rem] leading-relaxed text-ink-soft">
          Take a photo on your phone or choose one from your gallery, add a
          caption and the date, then publish it. Uploads are checked on the server
          (JPG, PNG or WebP, maximum {MAX_MB} MB) and stored outside the public
          folder, so nothing is public until you publish it.
        </p>
      </div>

      <form onSubmit={upload} className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="photo-file" className="label">
              Photo — take one now, or choose from your gallery
            </label>
            <input
              id="photo-gallery"
              ref={galleryRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="input"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            <p className="hint">
              On both Android and iPhone this opens the normal sheet — camera or
              gallery. Camera photos are usually JPEG, which is accepted. JPG, PNG
              or WebP · up to {MAX_MB} MB.
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-[0.85rem] font-semibold text-navy-deep">
                Camera opened directly instead
              </summary>
              <input
                ref={fileRef}
                id="photo-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="input mt-2"
                onChange={(e) => pick(e.target.files?.[0] ?? null)}
              />
              <p className="hint">
                This one forces the rear camera on a phone. Use it when the picker
                keeps sending you to the gallery.
              </p>
            </details>
          </div>

          {preview && (
            <div className="sm:col-span-2">
              <p className="label">Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview of the photo about to be uploaded"
                className="max-h-72 w-auto rounded-lg border border-line"
              />
            </div>
          )}

          <div>
            <label htmlFor="photo-caption" className="label">
              Caption
            </label>
            <input
              id="photo-caption"
              className="input"
              maxLength={300}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="photo-date" className="label">
              Date captured
            </label>
            <input
              id="photo-date"
              type="date"
              className="input"
              value={captureDate}
              onChange={(e) => setCaptureDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="photo-category" className="label">
              Category
            </label>
            <select
              id="photo-category"
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {IMAGE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="photo-desc" className="label">
              Description
            </label>
            <textarea
              id="photo-desc"
              className="textarea"
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id="photo-publish"
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
            />
            <label htmlFor="photo-publish" className="text-[0.9rem] text-ink">
              Publish immediately (uncheck to save as a private draft)
            </label>
          </div>
        </div>

        {error && (
          <p className="error-text mt-4" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="success-text mt-4">{notice}</p>}

        <button type="submit" className="btn btn-primary mt-5" disabled={busy}>
          {busy ? "Uploading…" : publishNow ? "Upload & publish" : "Upload draft"}
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-navy-deep">
            All photos ({images.length})
          </h3>
          <div className="flex gap-1">
            {(["all", "published", "drafts"] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={`btn btn-sm ${filter === key ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter(key)}
              >
                {key === "all" ? "All" : key === "published" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="note">
            Nothing here yet. Upload your first photo using the form above.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((img) => (
              <PhotoCard key={img.id} image={img} onChanged={load} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}