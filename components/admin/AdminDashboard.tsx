"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ProfileEditor } from "./ProfileEditor";
import { ResourceManager } from "./ResourceManager";
import { RESOURCES } from "./resources";

type Toast = { id: number; msg: string; kind: "success" | "error" };

const TABS = [{ key: "profile", label: "Profile" }, ...RESOURCES.map((r) => ({ key: r.key, label: r.label }))];

/**
 * Admin shell: sidebar (top tabs on mobile) + active panel + toasts.
 * Rendered by app/admin/dashboard/page.tsx after a server-side admin check.
 */
export function AdminDashboard({ email }: { email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((msg: string, kind: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  async function signOut() {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const resource = RESOURCES.find((r) => r.key === tab);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100 md:flex">
      <aside className="border-b border-neutral-800 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-500">Portfolio</p>
            <p className="text-lg font-semibold">Admin</p>
          </div>
          <a href="/" target="_blank" className="text-xs text-neutral-400 hover:text-neutral-100 md:mt-2 md:inline-block">
            View site ↗
          </a>
        </div>

        <nav aria-label="Sections" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active ? "text-neutral-50" : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-active"
                    className="absolute inset-0 rounded-lg bg-neutral-800/80"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden px-5 py-5 md:absolute md:bottom-0 md:block md:w-60">
          <p className="mb-2 truncate text-xs text-neutral-500" title={email}>
            {email}
          </p>
          <button onClick={signOut} className="text-sm text-neutral-400 hover:text-red-400">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex justify-end md:hidden">
            <button onClick={signOut} className="text-sm text-neutral-400 hover:text-red-400">
              Sign out
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {resource ? <ResourceManager resource={resource} notify={notify} /> : <ProfileEditor notify={notify} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              className={`pointer-events-auto rounded-lg px-4 py-2.5 text-sm shadow-lg ring-1 ${
                t.kind === "error" ? "bg-red-950 text-red-200 ring-red-500/40" : "bg-neutral-900 text-neutral-100 ring-red-600/40"
              }`}
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
