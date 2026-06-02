import { supabaseAnon } from "@/lib/supabase/anon";
import { nightsBetween } from "@/lib/booking/dates";

/**
 * Availability reads. These run through the ANON client, so they exercise the
 * public RLS policy (`availability_public_read`) — exactly the access a browser
 * would have. No guest data is reachable here; only busy/free dates.
 */

/**
 * The set of busy `YYYY-MM-DD` dates for a room within [from, to). A date is
 * busy if any availability row (any source) marks it blocked or booked.
 */
export async function getBusyDates(
  roomId: string,
  from: string,
  to: string,
): Promise<Set<string>> {
  const { data, error } = await supabaseAnon()
    .from("availability")
    .select("date")
    .eq("room_id", roomId)
    .in("status", ["blocked", "booked"])
    .gte("date", from)
    .lt("date", to);

  if (error) throw error;
  return new Set((data ?? []).map((r: { date: string }) => r.date));
}

/** Busy dates for several rooms at once, keyed by room id. */
export async function getBusyDatesForRooms(
  roomIds: string[],
  from: string,
  to: string,
): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>();
  roomIds.forEach((id) => result.set(id, new Set()));
  if (roomIds.length === 0) return result;

  const { data, error } = await supabaseAnon()
    .from("availability")
    .select("room_id, date")
    .in("room_id", roomIds)
    .in("status", ["blocked", "booked"])
    .gte("date", from)
    .lt("date", to);

  if (error) throw error;
  for (const row of (data ?? []) as { room_id: string; date: string }[]) {
    result.get(row.room_id)?.add(row.date);
  }
  return result;
}

/** True if every night of [checkIn, checkOut) is free for this room. */
export function isRangeFree(busy: Set<string>, checkIn: string, checkOut: string): boolean {
  return nightsBetween(checkIn, checkOut).every((night) => !busy.has(night));
}
