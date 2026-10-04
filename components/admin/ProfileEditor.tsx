"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { FieldInput, toFormState, toPayload, type FormState } from "./FormFields";
import { friendlyError } from "./ResourceManager";
import { PROFILE_FIELDS } from "./resources";

type Notify = (msg: string, kind?: "success" | "error") => void;

/** Edits the single profile row, with resume / avatar upload to Storage. */
export function ProfileEditor({ notify }: { notify: Notify }) {
  const supabase = getSupabaseBrowserClient();
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(toFormState(PROFILE_FIELDS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profile").select("*").maybeSingle();
      if (error) notify(error.message, "error");
      if (data) {
        setId(data.id);
        setForm(toFormState(PROFILE_FIELDS, data));
      }
      setLoading(false);
    })();
  }, [supabase, notify]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = toPayload(PROFILE_FIELDS, form);
    const { data, error } = id
      ? await supabase.from("profile").update(payload as never).eq("id", id).select("id").single()
      : await supabase.from("profile").insert(payload as never).select("id").single();
    setSaving(false);
    if (error) return notify(friendlyError(error.message), "error");
    setId(data.id);
    notify("Profile saved.");
  }

  async function onUpload(e: ChangeEvent<HTMLInputElement>, field: "resume_url" | "avatar_url") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return notify("File must be under 10 MB.", "error");

    setUploading(field);
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${field === "resume_url" ? "resume" : "avatar"}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });
    setUploading(null);
    if (error) return notify(friendlyError(error.message), "error");

    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    setForm((s) => ({ ...s, [field]: data.publicUrl }));
    notify("Uploaded — click Save to apply.");
  }

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-neutral-900" />;

  return (
    <form onSubmit={onSave}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-50">Profile</h2>
          <p className="text-sm text-neutral-500">Shown in the hero section and footer.</p>
        </div>
        <button type="submit" disabled={saving} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:grid-cols-2">
        {PROFILE_FIELDS.map((f) => (
          <FieldInput key={f.name} field={f} value={form[f.name]} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />
        ))}

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <UploadButton label="Upload resume (PDF)" accept="application/pdf" busy={uploading === "resume_url"} onChange={(e) => onUpload(e, "resume_url")} />
          <UploadButton label="Upload avatar" accept="image/*" busy={uploading === "avatar_url"} onChange={(e) => onUpload(e, "avatar_url")} />
        </div>
      </div>
    </form>
  );
}

function UploadButton({
  label,
  accept,
  busy,
  onChange,
}: {
  label: string;
  accept: string;
  busy: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="cursor-pointer rounded-lg border border-dashed border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-red-500 hover:text-red-400 focus-within:ring-2 focus-within:ring-red-500/40">
      {busy ? "Uploading…" : label}
      <input type="file" accept={accept} onChange={onChange} disabled={busy} className="sr-only" />
    </label>
  );
}
