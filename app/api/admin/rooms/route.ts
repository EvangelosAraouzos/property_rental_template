import { NextResponse, type NextRequest } from "next/server";

import { isAuthorized } from "@/lib/auth";
import { getAllRoomsMeta } from "@/lib/booking/rooms-meta";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/rooms  (guarded by `Authorization: Bearer <ADMIN_TOKEN>`)
 *
 * Returns each room's sync config + export token so the admin can show the
 * per-room .ics export URLs the owner pastes into Booking.com / Airbnb. The
 * export token is sensitive (it's a bearer credential), so this is admin-only.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request, "ADMIN_TOKEN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const rooms = await getAllRoomsMeta();
    return NextResponse.json({
      rooms: rooms.map((r) => ({
        slug: r.slug,
        exportToken: r.ical_export_token,
        bookingImportUrl: r.ical_import_booking_url,
        airbnbImportUrl: r.ical_import_airbnb_url,
      })),
    });
  } catch (err) {
    console.error("[admin/rooms] error:", err);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
  }
}
