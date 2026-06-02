import { NextResponse, type NextRequest } from "next/server";

import { isAuthorized } from "@/lib/auth";
import { runICalImport } from "@/lib/ical/import";

export const dynamic = "force-dynamic";
// Importing several feeds can take a while; give it room on platforms that
// honour this (e.g. Vercel functions).
export const maxDuration = 60;

/**
 * GET /api/cron/ical-import   (scheduled)
 *
 * Pulls every room's Booking.com + Airbnb feeds into `availability`. Configure
 * your host's scheduler to hit this with `Authorization: Bearer <CRON_SECRET>`.
 *
 * Example Vercel cron lives in vercel.json (every 2 hours). Vercel automatically
 * attaches the CRON_SECRET bearer token to scheduled invocations.
 *
 * Reminder: this sync is PERIODIC. Between runs the website may lag the other
 * channels — which is why website bookings stay request-to-reserve (owner
 * confirmation is the double-booking safety net).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request, "CRON_SECRET")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runICalImport();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[cron/ical-import] error:", err);
    return NextResponse.json({ error: "import_failed" }, { status: 500 });
  }
}
