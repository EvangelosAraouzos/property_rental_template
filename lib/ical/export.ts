import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { RoomMeta } from "@/lib/booking/rooms-meta";
import { addDays, fromISODate, nightsBetween, toISODate, today } from "@/lib/booking/dates";
import { buildICal, type BusySpan } from "@/lib/ical/generate";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  iCal EXPORT — build a room's public busy feed for the OTHER channels.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Emits the room's website-CONFIRMED bookings + MANUAL blocks as busy spans.
 *  Pending holds are deliberately excluded (they are tentative and may be
 *  declined). Crucially it never leaks guest details — only opaque busy dates.
 *
 *  Booking.com / Airbnb poll this URL periodically, so the block they see is as
 *  of their last fetch — another reason website bookings stay request-to-reserve.
 */

/** Coalesce a sorted set of blocked nights into contiguous [start, end) spans. */
function coalesceNights(nights: string[]): { start: string; end: string }[] {
  const sorted = [...new Set(nights)].sort();
  const spans: { start: string; end: string }[] = [];
  for (const night of sorted) {
    const last = spans[spans.length - 1];
    // `last.end` is the exclusive check-out morning; if it equals this night the
    // span is contiguous, so extend it. Otherwise start a fresh span.
    if (last && last.end === night) {
      last.end = toISODate(addDays(fromISODate(night), 1));
    } else {
      spans.push({ start: night, end: toISODate(addDays(fromISODate(night), 1)) });
    }
  }
  return spans;
}

/**
 * Build the .ics text for one room. Uses the service role because it must read
 * confirmed reservations and join availability — but it only ever emits dates.
 */
export async function buildRoomExportICal(
  room: RoomMeta,
  calendarName: string,
): Promise<string> {
  const from = toISODate(today());
  const to = toISODate(addDays(today(), 400));
  const admin = supabaseAdmin();

  // 1. Manual blocks — emit directly.
  const { data: manual, error: manualErr } = await admin
    .from("availability")
    .select("date")
    .eq("room_id", room.id)
    .eq("source", "manual")
    .in("status", ["blocked", "booked"])
    .gte("date", from)
    .lt("date", to);
  if (manualErr) throw manualErr;

  // 2. Website holds for CONFIRMED reservations only (exclude pending/declined).
  const { data: confirmed, error: resErr } = await admin
    .from("reservations")
    .select("check_in, check_out")
    .eq("room_id", room.id)
    .eq("status", "confirmed")
    .gte("check_out", from);
  if (resErr) throw resErr;

  const nights: string[] = (manual ?? []).map((r: { date: string }) => r.date);
  for (const r of (confirmed ?? []) as { check_in: string; check_out: string }[]) {
    nights.push(...nightsBetween(r.check_in, r.check_out));
  }

  const spans: BusySpan[] = coalesceNights(nights)
    .filter((s) => s.end > from)
    .map((s) => ({
      start: s.start,
      end: s.end,
      uid: `${room.slug}-${s.start}-${s.end}@property-rental-template`,
      summary: "Not available",
    }));

  return buildICal(calendarName, spans);
}
