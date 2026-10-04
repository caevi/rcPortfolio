"use client";

import { useState, type ChangeEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Field } from "./resources";

/** Form state is always strings/booleans; converted to DB types on save. */
export type FormState = Record<string, string | boolean>;

export function toFormState(fields: Field[], row?: Record<string, unknown> | null): FormState {
  const state: FormState = {};
  for (const f of fields) {
    const v = row?.[f.name];
    if (f.type === "checkbox") state[f.name] = Boolean(v);
    else if (f.type === "tags") state[f.name] = Array.isArray(v) ? v.join(", ") : "";
    else if (f.type === "lines") state[f.name] = Array.isArray(v) ? v.join("\n") : "";
    else if (f.type === "select") state[f.name] = v == null ? f.options?.[0]?.value ?? "" : String(v);
    else state[f.name] = v == null ? "" : String(v);
  }
  return state;
}

export function toPayload(fields: Field[], state: FormState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = state[f.name];
    if (f.type === "checkbox") {
      out[f.name] = Boolean(raw);
      continue;
    }
    const s = String(raw ?? "").trim();
    switch (f.type) {
      case "tags":
        out[f.name] = [...new Set(s.split(",").map((t) => t.trim()).filter(Boolean))];
        break;
      case "lines":
        out[f.name] = s.split("\n").map((t) => t.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
        break;
      case "number":
        // sort_order is NOT NULL in the schema; other numbers may be null.
        out[f.name] = s === "" ? (f.name === "sort_order" ? 0 : null) : Number(s);
        break;
      default:
        out[f.name] = s === "" ? null : s;
    }
  }
  return out;
}

const inputCls =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/25";

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string | boolean;
  onChange: (v: string | boolean) => void;
}) {
  const id = `field-${field.name}`;

  if (field.type === "image") {
    return <ImageField id={id} field={field} value={String(value ?? "")} onChange={onChange} />;
  }

  if (field.type === "checkbox") {
    return (
      <label htmlFor={id} className={`flex items-center gap-3 pt-6 ${field.wide ? "sm:col-span-2" : ""}`}>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-600 bg-neutral-950 accent-red-500"
        />
        <span className="text-sm text-neutral-200">{field.label}</span>
      </label>
    );
  }

  const common = {
    id,
    required: field.required,
    placeholder: field.placeholder,
    value: String(value ?? ""),
    className: inputCls,
  };

  let control: React.ReactNode;
  if (field.type === "textarea" || field.type === "lines") {
    control = (
      <textarea {...common} rows={field.type === "lines" ? 5 : 4} onChange={(e) => onChange(e.target.value)} />
    );
  } else if (field.type === "select") {
    control = (
      <select {...common} onChange={(e) => onChange(e.target.value)}>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else {
    const htmlType = field.type === "tags" ? "text" : field.type;
    control = (
      <input {...common} type={htmlType} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value)} />
    );
  }

  return (
    <div className={field.wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-neutral-300">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      {control}
      {field.type === "tags" && typeof value === "string" && value.trim() && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.split(",").map((t) => t.trim()).filter(Boolean).map((t, i) => (
            <span key={`${t}-${i}`} className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-300">
              {t}
            </span>
          ))}
        </div>
      )}
      {field.help && <p className="mt-1 text-xs text-neutral-500">{field.help}</p>}
    </div>
  );
}

const MAX_IMAGE_MB = 5;

/**
 * URL input + "Upload" button + live preview.
 * Uploads go to the public `portfolio` Storage bucket (admin-only writes, see schema.sql)
 * and the field is filled with the file's public URL. Paths like /projects/x.webp
 * (files in the Next.js public/ folder) work too.
 */
function ImageField({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Image must be under ${MAX_IMAGE_MB} MB.`);

    setError(null);
    setUploading(true);
    const supabase = getSupabaseBrowserClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `projects/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    setUploading(false);
    if (upErr) {
      setError(/row-level security/i.test(upErr.message) ? "Upload blocked — this account isn't an admin." : upErr.message);
      return;
    }
    setBroken(false);
    onChange(supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl);
  }

  return (
    <div className={field.wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-neutral-300">
        {field.label}
      </label>

      <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950">
        <div className="relative flex aspect-[16/9] items-center justify-center bg-neutral-900">
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Cover preview" onError={() => setBroken(true)} onLoad={() => setBroken(false)} className="h-full w-full object-cover" />
          ) : (
            <p className="px-6 text-center text-sm text-neutral-500">
              {broken ? "Couldn't load that image — check the URL." : "No image yet. The card will show a generated cover."}
            </p>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/70 text-sm text-neutral-200">Uploading…</div>
          )}
        </div>

        <div className="flex gap-2 border-t border-neutral-800 p-2">
          <input
            id={id}
            type="text"
            inputMode="url"
            value={value}
            placeholder="https://… or /projects/my-app.webp"
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
            className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-red-500"
          />
          <label className="shrink-0 cursor-pointer rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 transition hover:bg-neutral-700 focus-within:ring-2 focus-within:ring-red-500/40">
            Upload
            <input type="file" accept="image/*" onChange={onFile} disabled={uploading} className="sr-only" />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="shrink-0 rounded-lg px-2 text-sm text-neutral-500 hover:text-red-400" aria-label="Remove image">
              ✕
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {field.help && !error && <p className="mt-1 text-xs text-neutral-500">{field.help}</p>}
    </div>
  );
}
