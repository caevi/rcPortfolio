"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Browser-side Supabase client (Client Components only).
 *
 * - Uses the public anon key: it is safe to ship to the browser because
 *   every table is protected by Row Level Security.
 * - Session is stored in cookies, so the server (middleware, Server
 *   Components, Route Handlers) sees the same logged-in admin.
 * - Memoised so the whole app shares one instance and one auth listener.
 */
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local."
    );
  }

  client = createBrowserClient<Database>(url, anonKey);
  return client;
}
