/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  iCalendar (.ics) generation for the per-room EXPORT feed.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Emits the room's website-confirmed bookings + manual blocks as all-day busy
 *  VEVENTs, so the owner can paste the export URL into Booking.com / Airbnb to
 *  mirror those blocks there. It deliberately exposes ONLY busy spans — never a
 *  guest name, email or any reservation detail.
 *
 *  Like the import side, this is consumed PERIODICALLY by the other channels
 *  (they re-fetch on their own schedule), so it is not a real-time lock — owner
 *  confirmation remains the safety net against double-bookings.
 */

export interface BusySpan {
  /** First night (YYYY-MM-DD), inclusive. */
  start: string;
  /** Check-out morning (YYYY-MM-DD), exclusive. */
  end: string;
  /** Stable identifier for the VEVENT UID. */
  uid: string;
  /** Generic label — never guest PII. */
  summary: string;
}

/** `YYYY-MM-DD` -> `YYYYMMDD` for VALUE=DATE properties. */
function toICalDate(iso: string): string {
  return iso.replace(/-/g, "");
}

/** RFC 5545 fold: lines must be <= 75 octets; continuation lines start with a space. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    chunks.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return chunks.join("\r\n");
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Build a complete VCALENDAR document (CRLF line endings, per spec). */
export function buildICal(calendarName: string, spans: BusySpan[]): string {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//property-rental-template//booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:${escapeText(calendarName)}`),
  ];

  for (const span of spans) {
    lines.push(
      "BEGIN:VEVENT",
      fold(`UID:${span.uid}`),
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toICalDate(span.start)}`,
      `DTEND;VALUE=DATE:${toICalDate(span.end)}`,
      fold(`SUMMARY:${escapeText(span.summary)}`),
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
