"use client";

import { useEffect, useState } from "react";
import type { ImageRecord } from "@/lib/types";

export default function Gallery({
  images,
  compact = false,
}: {
  images: ImageRecord[];
  compact?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight")
        setActive((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft")
        setActive((i) =>
          i === null ? i : (i - 1 + images.length) % images.length
        );
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, images.length]);

  if (images.length === 0) return null;
  const current = active === null ? null : images[active];

  return (
    <>
      <ul
        className={`mt-4 grid gap-3 ${
          compact
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {images.map((img, index) => (
          <li key={img.id}>
            <figure>
              <button
                type="button"
                className="gallery-tile"
                onClick={() => setActive(index)}
                aria-label={`Open larger view: ${img.caption || img.original_name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/media/${img.id}`}
                  alt={img.caption || img.description || img.original_name}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <figcaption className="mt-2 text-[0.85rem] leading-snug text-ink-soft">
                {img.caption && (
                  <span className="block font-semibold text-ink">
                    {img.caption}
                  </span>
                )}
                {img.capture_date && (
                  <span className="block text-xs">
                    Captured {img.capture_date}
                  </span>
                )}
                {img.description && (
                  <span className="mt-0.5 block">{img.description}</span>
                )}
                <a
                  href={`/api/media/${img.id}`}
                  className="mt-0.5 inline-block text-xs font-semibold"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open file
                </a>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-navy-deep/92 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || "Document image"}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-white">
              <p className="truncate text-sm font-bold">
                {current.caption || current.original_name}
              </p>
              <p className="text-xs text-slate-300">
                {current.capture_date ? `${current.capture_date} · ` : ""}
                {active! + 1} of {images.length}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm shrink-0"
              onClick={() => setActive(null)}
            >
              Close
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/media/${current.id}`}
              alt={current.caption || current.description || current.original_name}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>
          {current.description && (
            <p className="mx-auto max-w-2xl text-center text-sm text-slate-200">
              {current.description}
            </p>
          )}
          {images.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setActive((i) =>
                    i === null ? i : (i - 1 + images.length) % images.length
                  )
                }
              >
                ‹ Previous
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setActive((i) => (i === null ? i : (i + 1) % images.length))
                }
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}