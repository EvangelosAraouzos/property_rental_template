import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAllRoomsMeta, type RoomMeta } from "@/lib/booking/rooms-meta";
import { addDays, toISODate, today } from "@/lib/booking/dates";
import { busyEventsToDates, parseICalBusy } from "@/lib/ical/parse";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  iCal IMPORT — pull Booking.com & Airbnb blocked dates into `availability`.
 * ─────────────────────────────────────────────────────────────────────────────
 *  This runs on a SCHEDULE (cron) and is also runnable on demand from the admin.
 *  It is the free, no-channel-manager way to keep the website calendar roughly
 *  in step with the other channels. It is PERIODIC, not real-time: between runs
 *  the website may not yet know about a booking made elsewhere — which is the
 *  whole reason the website stays request-to-reserve (owner confirmation closes
 *  the gap).
 *
 *  Sync strategy per (room, channel): fetch the feed, expand it to blocked
 *  nights within the horizon, then replace ONLY that channel's rows for the room
 *  (delete its existing rows in-horizon, insert the current set). Manual blocks
 *  and website holds — which live under different `source` values — are never
 *  touched.
 */

const CHANNELS = [
  { source: "booking_com" as const, urlKey: "ical_import_booking_url" as const },
  { source: "airbnb" as const, urlKey: "ical_import_airbnb_url" as const },
];

export interface ChannelResult {
  roomSlug: string;
  source: "booking_com" | "airbnb";
  ok: boolean;
  blockedDates?: number;
  error?: string;
}

export interface ImportSummary {
  ranAt: string;
  horizonFrom: string;
  horizonTo: string;
  results: ChannelResult[];
}

async function syncChannel(
  room: RoomMeta,
  source: "booking_com" | "airbnb",
  url: string,
  from: string,
  to: string,
): Promise<ChannelResult> {
  const base = { roomSlug: room.slug, source };
  try {
    const res = await fetch(url, {
      // Always fetch fresh — a cached feed defeats the point of syncing.
      cache: "no-store",
      headers: { Accept: "text/calendar, text/plain, */*" },
    });
    if (!res.ok) {
      return { ...base, ok: false, error: `feed HTTP ${res.status}` };
    }

    const raw = await res.text();
    const allNights = busyEventsToDates(parseICalBusy(raw));
    // Keep only nights inside our horizon.
    const nights = [...allNights].filter((d) => d >= from && d < to).sort();

    const admin = supabaseAdmin();

    // Replace this channel's rows for this room within the horizon.
    const { error: delErr } = await admin
      .from("availability")
      .delete()
      .eq("room_id", room.id)
      .eq("source", source)
      .gte("date", from)
      .lt("date", to);
    if (delErr) throw delErr;

    if (nights.length > 0) {
      const rows = nights.map((date) => ({
        room_id: room.id,
        date,
        status: "blocked" as const,
        source,
      }));
      const { error: insErr } = await admin.from("availability").insert(rows);
      if (insErr) throw insErr;
    }

    return { ...base, ok: true, blockedDates: nights.length };
  } catch (err) {
    return { ...base, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Run the import for every room/channel that has a configured feed URL. */
export async function runICalImport(): Promise<ImportSummary> {
  const from = toISODate(today());
  const to = toISODate(addDays(today(), 400)); // a touch beyond the booking horizon
  const rooms = await getAllRoomsMeta();

  const tasks: Promise<ChannelResult>[] = [];
  for (const room of rooms) {
    for (const channel of CHANNELS) {
      const url = room[channel.urlKey];
      if (url) tasks.push(syncChannel(room, channel.source, url, from, to));
    }
  }

  const results = await Promise.all(tasks);
  return { ranAt: new Date().toISOString(), horizonFrom: from, horizonTo: to, results };
}
