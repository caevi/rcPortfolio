"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") === "not_admin" ? "That account doesn't have admin access." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Same message for wrong email or password: don't leak which accounts exist.
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Only allow internal redirects (prevents open-redirect via ?next=https://evil).
    const next = params.get("next");
    const dest = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin/dashboard";
    router.replace(dest);
    router.refresh();
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-2xl"
    >
      <h1 className="mb-1 text-2xl font-semibold text-neutral-50">Admin sign in</h1>
      <p className="mb-8 text-sm text-neutral-400">Manage your portfolio content.</p>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-sm text-neutral-300">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
        />
      </label>

      <label className="mb-6 block">
        <span className="mb-1.5 block text-sm text-neutral-300">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
        />
      </label>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </motion.form>
  );
}
