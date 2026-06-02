import { NextResponse, type NextRequest } from "next/server";

import { getRoomMetaBySlug } from "@/lib/booking/rooms-meta";
import { getBusyDates } from "@/lib/booking/availability";
import { addDays, isISODate, toISODate, today } from "@/lib/booking/dates";
import { siteConfig } from "@/config/site";

// Availability changes constantly (and is read per-request); never cache it.
export const dynamic = "force-dynamic";

/**
 * GET /api/availability?room=<slug>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
 *
 * Public endpoint returning the busy nights for one room so the date picker can
 * disable them. Exposes only dates — never guest data. The slug -> id lookup is
 * server-side (rooms_meta is private); the date read runs under RLS.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get("room");
  if (!slug) {
    return NextResponse.json({ error: "Missing room slug" }, { status: 400 });
  }

  const from = params.get("from") ?? toISODate(today());
  const to = params.get("to") ?? toISODate(addDays(today(), siteConfig.booking.horizonDays));
  if (!isISODate(from) || !isISODate(to) || to <= from) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  try {
    const meta = await getRoomMetaBySlug(slug);
    if (!meta) {
      return NextResponse.json({ error: "Unknown room" }, { status: 404 });
    }

    const busy = await getBusyDates(meta.id, from, to);
    return NextResponse.json({ room: slug, from, to, busyDates: [...busy].sort() });
  } catch (err) {
    console.error("[availability] error:", err);
    return NextResponse.json({ error: "Could not load availability" }, { status: 500 });
  }
}
