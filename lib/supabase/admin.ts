import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * SERVICE-ROLE Supabase client. SERVER-ONLY — it bypasses Row Level Security,
 * so it must never be imported into a client component (the `server-only`
 * import above turns that into a build error).
 *
 * Used by the trusted paths that legitimately need full access:
 *   - resolving a Keystatic slug -> `rooms_meta` row (private table),
 *   - the iCal import cron (writing channel blocks),
 *   - the iCal export endpoint (reading the export token + confirmed bookings),
 *   - the atomic `hold_reservation` RPC.
 */
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
