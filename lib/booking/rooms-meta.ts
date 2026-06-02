import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * The private `rooms_meta` row: the bridge between Keystatic content (slug) and
 * Supabase availability (id), plus the per-room channel sync config. Read with
 * the service role only — anon has no access to this table (it holds the import
 * feed URLs and the export token).
 */
export interface RoomMeta {
  id: string;
  slug: string;
  ical_import_booking_url: string | null;
  ical_import_airbnb_url: string | null;
  ical_export_token: string;
}

/** Resolve a Keystatic slug -> rooms_meta row (id + sync config). */
export async function getRoomMetaBySlug(slug: string): Promise<RoomMeta | null> {
  const { data, error } = await supabaseAdmin()
    .from("rooms_meta")
    .select("id, slug, ical_import_booking_url, ical_import_airbnb_url, ical_export_token")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as RoomMeta | null) ?? null;
}

/** Resolve an export token -> rooms_meta row (guards the .ics endpoint). */
export async function getRoomMetaByExportToken(token: string): Promise<RoomMeta | null> {
  const { data, error } = await supabaseAdmin()
    .from("rooms_meta")
    .select("id, slug, ical_import_booking_url, ical_import_airbnb_url, ical_export_token")
    .eq("ical_export_token", token)
    .maybeSingle();

  if (error) throw error;
  return (data as RoomMeta | null) ?? null;
}

/** All rooms_meta rows (admin / cron iteration). */
export async function getAllRoomsMeta(): Promise<RoomMeta[]> {
  const { data, error } = await supabaseAdmin()
    .from("rooms_meta")
    .select("id, slug, ical_import_booking_url, ical_import_airbnb_url, ical_export_token");

  if (error) throw error;
  return (data as RoomMeta[]) ?? [];
}
