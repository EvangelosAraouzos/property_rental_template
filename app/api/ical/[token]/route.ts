import { type NextRequest } from "next/server";

import { getRoomMetaByExportToken } from "@/lib/booking/rooms-meta";
import { buildRoomExportICal } from "@/lib/ical/export";
import { getRoom, roomName } from "@/content/rooms";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

/**
 * GET /api/ical/<export-token>
 *
 * Public, token-guarded per-room .ics feed. The owner pastes this URL into
 * Booking.com / Airbnb so those channels mirror the room's website-confirmed
 * bookings + manual blocks. The token (from rooms_meta) is the only credential;
 * the feed exposes busy dates ONLY — never guest details.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/ical/[token]">) {
  const { token } = await ctx.params;

  const meta = await getRoomMetaByExportToken(token);
  if (!meta) {
    return new Response("Not found", { status: 404 });
  }

  const content = getRoom(meta.slug);
  const calendarName = `${siteConfig.name} · ${
    content ? roomName(content, siteConfig.defaultLocale) : meta.slug
  }`;

  try {
    const ics = await buildRoomExportICal(meta, calendarName);
    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="${meta.slug}.ics"`,
        // Allow channels to poll often, but let a CDN ease load briefly.
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("[ical export] error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
