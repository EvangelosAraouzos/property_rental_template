import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ANON Supabase client. Subject to Row Level Security, so it can only do what
 * the public policies allow: READ `availability` and INSERT a pending
 * `reservations` row. Used by the public-facing route handlers to prove (and
 * lean on) RLS rather than the service role.
 *
 * The anon key is publishable and may also be used directly from the browser if
 * desired; here we use it server-side for tidy, single-origin requests.
 */
let cached: SupabaseClient | null = null;

export function supabaseAnon(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase anon client is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
