/**
 * Date helpers for the booking system. We work in plain `YYYY-MM-DD` strings
 * (date-only, no timezone) everywhere a calendar night is meant — this matches
 * how Postgres `date`, Booking.com and Airbnb all model availability and avoids
 * off-by-one bugs from timezone-shifted `Date` objects.
 */

/** Format a Date (interpreted in local time) as `YYYY-MM-DD`. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse `YYYY-MM-DD` into a local-midnight Date. */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Today at local midnight. */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Add `n` days to a Date (returns a new Date). */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/**
 * Every NIGHT in a stay as `YYYY-MM-DD`: check-in inclusive, check-out
 * exclusive (you don't occupy the room the morning you leave).
 */
export function nightsBetween(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  let cur = fromISODate(checkIn);
  const end = fromISODate(checkOut);
  while (cur < end) {
    out.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

/** Number of nights between two ISO dates. */
export function countNights(checkIn: string, checkOut: string): number {
  return nightsBetween(checkIn, checkOut).length;
}

/** True if `s` is a syntactically valid `YYYY-MM-DD` calendar date. */
export function isISODate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = fromISODate(s);
  return toISODate(d) === s; // rejects e.g. 2025-02-30
}
