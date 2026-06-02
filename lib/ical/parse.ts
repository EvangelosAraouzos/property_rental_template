/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Minimal iCalendar (RFC 5545) parser — just enough for channel availability.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Booking.com and Airbnb export availability as a VCALENDAR of all-day VEVENTs
 *  ("blocked"/"reserved" spans) with DTSTART/DTEND as VALUE=DATE. We only need
 *  the busy ranges, so we parse exactly that rather than pulling a heavy
 *  dependency — keeping the channel sync free and self-contained.
 *
 *  NOTE: iCal sync is PERIODIC, not real-time. A feed reflects the other
 *  channel's calendar only as of the last fetch, which is precisely why website
 *  bookings stay request-to-reserve: owner confirmation is the safety net that
 *  covers the gap between syncs.
 */

import { addDays, toISODate } from "@/lib/booking/dates";

export interface BusyEvent {
  /** First night blocked (YYYY-MM-DD), inclusive. */
  start: string;
  /** Check-out morning (YYYY-MM-DD), exclusive — the night before is the last. */
  end: string;
  /** VEVENT SUMMARY, if any (e.g. "CLOSED - Not available"). */
  summary?: string;
  /** VEVENT UID, if any. */
  uid?: string;
}

/** Unfold RFC 5545 line continuations (a leading space/tab continues the prior line). */
function unfold(raw: string): string[] {
  const physical = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const logical: string[] = [];
  for (const line of physical) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && logical.length > 0) {
      logical[logical.length - 1] += line.slice(1);
    } else {
      logical.push(line);
    }
  }
  return logical;
}

/** Parse an iCal date value (DATE `YYYYMMDD` or DATE-TIME `YYYYMMDDTHHMMSSZ`) to a Date. */
function parseICalDate(value: string): Date | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d));
}

/**
 * Extract busy ranges from an iCal feed. DTEND is treated per spec as exclusive
 * for VALUE=DATE events; if a feed omits DTEND we assume a single night.
 */
export function parseICalBusy(raw: string): BusyEvent[] {
  const lines = unfold(raw);
  const events: BusyEvent[] = [];

  let inEvent = false;
  let start: Date | null = null;
  let end: Date | null = null;
  let summary: string | undefined;
  let uid: string | undefined;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      start = end = null;
      summary = uid = undefined;
      continue;
    }
    if (line === "END:VEVENT") {
      if (start) {
        // Default DTEND to the morning after DTSTART (one night) when absent.
        const endDate = end ?? addDays(start, 1);
        events.push({
          start: toISODate(start),
          end: toISODate(endDate),
          summary,
          uid,
        });
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    // Split "NAME;PARAMS:VALUE" — only the first colon separates name/value.
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const namePart = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const name = namePart.split(";")[0].toUpperCase();

    switch (name) {
      case "DTSTART":
        start = parseICalDate(value);
        break;
      case "DTEND":
        end = parseICalDate(value);
        break;
      case "SUMMARY":
        summary = value.replace(/\\,/g, ",").replace(/\\n/gi, " ").trim();
        break;
      case "UID":
        uid = value.trim();
        break;
    }
  }

  return events;
}

/** Expand busy ranges into the flat set of blocked nights (YYYY-MM-DD). */
export function busyEventsToDates(events: BusyEvent[]): Set<string> {
  const dates = new Set<string>();
  for (const ev of events) {
    let cur = new Date(
      Number(ev.start.slice(0, 4)),
      Number(ev.start.slice(5, 7)) - 1,
      Number(ev.start.slice(8, 10)),
    );
    const end = new Date(
      Number(ev.end.slice(0, 4)),
      Number(ev.end.slice(5, 7)) - 1,
      Number(ev.end.slice(8, 10)),
    );
    while (cur < end) {
      dates.add(toISODate(cur));
      cur = addDays(cur, 1);
    }
  }
  return dates;
}
