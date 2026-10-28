"use client";

import { useState } from "react";

const EVIDENCE_IMAGES = [
  "1000145967.jpg",
  "1000145971.jpg",
  "1000145973.jpg",
  "1000145977.jpg",
  "Screenshot_20260831_202557_Maps.jpg",
  "Screenshot_20260831_202609_Maps.jpg",
];

export default function EvidenceGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSrc, setSelectedSrc] = useState("");

  return (
    <section id="evidence-top" className="mt-10 scroll-mt-24">
      <h2 className="mt-0">Evidence — Photographs &amp; Documents</h2>
      <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-soft">
        Photographs and documents from my visit to YAARAB BATTERY AND TYRE WORKS.
        Click any image to view it larger.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EVIDENCE_IMAGES.map((file, i) => (
          <figure
            key={file}
            className="card-hover overflow-hidden rounded-lg border border-line bg-slate-100"
          >
            <button
              type="button"
              className="block aspect-[4/3] overflow-hidden bg-slate-200"
              onClick={() => {
                setSelectedSrc(`/${file}`);
                setModalOpen(true);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/${file}`}
                alt={`Evidence photo ${i + 1}`}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </button>
            <figcaption className="p-2 text-[0.85rem] text-ink-soft truncate">
              {file}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Full-screen modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/90 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white btn btn-outline"
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedSrc}
            alt="Full-screen evidence"
            className="max-h-[80vh] max-w-[90vw] object-contain bg-white rounded-lg shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}