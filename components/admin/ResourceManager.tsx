"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { FieldInput, toFormState, toPayload, type FormState } from "./FormFields";
import type { Resource } from "./resources";

type Row = Record<string, unknown> & { id: string };
type Notify = (msg: string, kind?: "success" | "error") => void;

/**
 * Generic list + create/edit/delete UI for one table, driven entirely by
 * the Resource config. All writes go straight to Supabase; RLS decides
 * whether they're allowed.
 */
export function ResourceManager({ resource, notify }: { resource: Resource; notify: Notify }) {
  // The table is chosen at runtime from config, so this component uses an
  // untyped view of the client; the Resource configs define the shape instead.
  const supabase = getSupabaseBrowserClient() as unknown as SupabaseClient;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from(resource.table).select("*");
    for (const [k, v] of Object.entries(resource.scope ?? {})) q = q.eq(k, v);
    for (const o of resource.orderBy) q = q.order(o.column, { ascending: o.ascending });
    const { data, error } = await q;
    if (error) notify(error.message, "error");
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  }, [supabase, resource, notify]);

  useEffect(() => {
    setEditing(null);
    setQuery("");
    load();
  }, [load]);

  function openEditor(row: Row | "new") {
    setEditing(row);
    setForm(toFormState(resource.fields, row === "new" ? null : row));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

    const payload = { ...toPayload(resource.fields, form), ...resource.scope };
    const table = supabase.from(resource.table);
    const { error } =
      editing === "new"
        ? await table.insert(payload)
        : await table.update(payload).eq("id", editing.id);

    setSaving(false);
    if (error) {
      notify(friendlyError(error.message), "error");
      return;
    }
    notify(`${capitalize(resource.singular)} ${editing === "new" ? "created" : "updated"}.`);
    setEditing(null);
    load();
  }

  async function onDelete(id: string) {
    setConfirmId(null);
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id)); // optimistic
    const { error } = await supabase.from(resource.table).delete().eq("id", id);
    if (error) {
      setRows(prev);
      notify(friendlyError(error.message), "error");
    } else {
      notify(`${capitalize(resource.singular)} deleted.`);
    }
  }

  const filtered = query
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()))
    : rows;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-50">{resource.label}</h2>
          <p className="text-sm text-neutral-500">
            {rows.length} {rows.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label={`Search ${resource.label}`}
            className="w-40 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500 sm:w-56"
          />
          <button
            onClick={() => openEditor("new")}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            + Add {resource.singular}
          </button>
        </div>
      </div>

      {loading ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-16 animate-pulse rounded-xl bg-neutral-900" />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
          {query ? "No matches." : `No ${resource.label.toLowerCase()} yet. Add your first one.`}
        </div>
      ) : (
        <motion.ul layout className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((row) => {
              const s = resource.summary(row);
              return (
                <motion.li
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-100">{s.title}</p>
                    {s.subtitle && <p className="truncate text-sm text-neutral-500">{s.subtitle}</p>}
                    {!!s.tags?.length && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {s.tags.slice(0, 6).map((t) => (
                          <span key={t} className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-neutral-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {confirmId === row.id ? (
                      <>
                        <button onClick={() => onDelete(row.id)} className="rounded-md bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500">
                          Confirm
                        </button>
                        <button onClick={() => setConfirmId(null)} className="rounded-md px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-100">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openEditor(row)} className="rounded-md px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">
                          Edit
                        </button>
                        <button onClick={() => setConfirmId(row.id)} className="rounded-md px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Slide-over editor */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setEditing(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label={`${editing === "new" ? "New" : "Edit"} ${resource.singular}`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onKeyDown={(e) => e.key === "Escape" && !saving && setEditing(null)}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-neutral-800 bg-neutral-950"
            >
              <form onSubmit={onSave} className="flex h-full flex-col">
                <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
                  <h3 className="text-lg font-semibold text-neutral-50">
                    {editing === "new" ? "New" : "Edit"} {resource.singular}
                  </h3>
                  <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-md p-1 text-neutral-400 hover:text-neutral-100">
                    ✕
                  </button>
                </header>
                <div className="grid flex-1 grid-cols-1 content-start gap-4 overflow-y-auto px-6 py-6 sm:grid-cols-2">
                  {resource.fields.map((f) => (
                    <FieldInput key={f.name} field={f} value={form[f.name]} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />
                  ))}
                </div>
                <footer className="flex justify-end gap-2 border-t border-neutral-800 px-6 py-4">
                  <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </footer>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function friendlyError(msg: string) {
  if (/row-level security/i.test(msg)) return "Permission denied — this account isn't an admin.";
  if (/duplicate key/i.test(msg)) return "An item with that name already exists.";
  if (/experience_dates_chk/i.test(msg)) return "End date must be after the start date.";
  return msg;
}
