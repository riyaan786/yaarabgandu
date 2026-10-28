"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentResource, ImageRecord } from "@/lib/types";
import { RESOURCES, type FieldDef, type ResourceDef } from "./resources";

type Entry = Record<string, unknown>;
type Values = Record<string, string>;

function blankValues(def: ResourceDef): Values {
  return Object.fromEntries(def.fields.map((f) => [f.name, ""]));
}

function toValues(def: ResourceDef, entry: Entry): Values {
  const out: Values = {};
  for (const f of def.fields) {
    const raw = entry[f.name];
    out[f.name] = raw === null || raw === undefined ? "" : String(raw);
  }
  return out;
}

function headingOf(def: ResourceDef, entry: Entry): string {
  const v = entry[def.heading];
  return typeof v === "string" && v ? v : RESOURCES[def.key].title;
}

/** Create, edit and delete entries for one content type. */
export default function ContentTab({ resource }: { resource: ContentResource }) {
  const def = RESOURCES[resource];
  const [entries, setEntries] = useState<Entry[]>([]);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [values, setValues] = useState<Values>(() => blankValues(def));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/content?type=${resource}`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch("/api/admin/images", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then(([contentData, imagesData]) => {
      if (contentData) {
        setEntries(
          Array.isArray(contentData.entries) ? contentData.entries : []
        );
      }
      if (imagesData) {
        setImages(Array.isArray(imagesData.images) ? imagesData.images : []);
      }
    });
  }, [resource, reloadKey]);

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = editingId
        ? await fetch(`/api/admin/content/${editingId}?type=${resource}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          })
        : await fetch("/api/admin/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: resource, ...values }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save this entry.");
        return;
      }
      setNotice(editingId ? "Entry updated." : "Entry added.");
      setValues(blankValues(def));
      setEditingId(null);
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/content/${id}?type=${resource}`, {
      method: "DELETE",
    });
    if (res.ok) {
      if (editingId === id) {
        setEditingId(null);
        setValues(blankValues(def));
      }
      setNotice("Entry deleted.");
      await load();
    }
  }

  function renderField(f: FieldDef) {
    const id = `cf-${resource}-${f.name}`;
    const value = values[f.name] ?? "";
    if (f.type === "image") {
      return (
        <div key={f.name}>
          <label htmlFor={id} className="label">
            {f.label}
          </label>
          <select
            id={id}
            className="select"
            value={value}
            onChange={(e) => set(f.name, e.target.value)}
          >
            <option value="">— none —</option>
            {images.map((img) => (
              <option key={img.id} value={img.id}>
                {img.published ? "Published" : "Draft"} ·{" "}
                {img.caption || img.original_name}
              </option>
            ))}
          </select>
          {f.help && <p className="hint">{f.help}</p>}
        </div>
      );
    }
    if (f.type === "textarea") {
      return (
        <div key={f.name} className="sm:col-span-2">
          <label htmlFor={id} className="label">
            {f.label}
          </label>
          <textarea
            id={id}
            className="textarea"
            rows={f.rows ?? 4}
            maxLength={f.maxLength}
            value={value}
            onChange={(e) => set(f.name, e.target.value)}
          />
          {f.help && <p className="hint">{f.help}</p>}
        </div>
      );
    }
    return (
      <div key={f.name}>
        <label htmlFor={id} className="label">
          {f.label}
        </label>
        <input
          id={id}
          className="input"
          type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
          inputMode={f.type === "number" ? "decimal" : undefined}
          maxLength={f.type === "text" ? f.maxLength : undefined}
          value={value}
          onChange={(e) => set(f.name, e.target.value)}
        />
        {f.help && <p className="hint">{f.help}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy-deep">{def.title}</h2>
        <p className="mt-1 text-[0.93rem] leading-relaxed text-ink-soft">
          {def.blurb}
        </p>
      </div>

      <form onSubmit={save} className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {def.fields.map(renderField)}
        </div>
        {error && (
          <p className="error-text mt-4" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="success-text mt-4">{notice}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : editingId ? "Save changes" : "Add entry"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setEditingId(null);
                setValues(blankValues(def));
                setError("");
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-navy-deep">
          Saved entries ({entries.length})
        </h3>
        {entries.length === 0 ? (
          <p className="note">{def.empty}</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => {
              const id = String(entry.id);
              return (
                <li key={id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {headingOf(def, entry)}
                      </p>
                      <dl className="mt-2 grid gap-x-6 gap-y-1 text-[0.88rem] text-ink-soft sm:grid-cols-2">
                        {def.fields
                          .filter((f) => f.name !== def.heading)
                          .map((f) => {
                            const linked: ImageRecord | undefined =
                              f.type === "image"
                                ? images.find((i) => i.id === entry[f.name])
                                : undefined;
                            const raw: unknown =
                              f.type === "image" ? linked : entry[f.name];
                            const text =
                              raw === null || raw === undefined
                                ? ""
                                : typeof raw === "string" || typeof raw === "number"
                                  ? String(raw)
                                  : (raw as ImageRecord).caption ||
                                    (raw as ImageRecord).original_name;
                            if (!text) return null;
                            return (
                              <div key={f.name} className="truncate">
                                <dt className="inline font-semibold">
                                  {f.label}:{" "}
                                </dt>
                                <dd className="inline">{text}</dd>
                              </div>
                            );
                          })}
                      </dl>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setEditingId(id);
                          setValues(toValues(def, entry));
                          setNotice("");
                          setError("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => void remove(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}