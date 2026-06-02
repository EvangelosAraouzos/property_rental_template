import { NextResponse, type NextRequest } from "next/server";

import { reservationSchema } from "@/lib/booking/validation";
import { getRoomMetaBySlug } from "@/lib/booking/rooms-meta";
import { getRoom, roomName } from "@/content/rooms";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendReservationEmails } from "@/lib/email/reservation-emails";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/config/site";

export const dynamic = "force-dynamic";

/**
 * POST /api/reservations
 *
 * The request-to-reserve submit. Validates input, then calls the atomic
 * `hold_reservation` RPC which (in one transaction) creates a PENDING
 * reservation and tentatively holds every night — relying on a unique
 * constraint to defeat concurrent double-bookings. On success it fires the
 * owner + guest emails (best-effort) and returns the reservation id.
 *
 * No HTML <form> reload: the client posts JSON here and renders the result.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // 1. Validate (authoritative — the client check is only for UX).
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Locale is optional in the body, only used to localise the room name in mail.
  const locale = (typeof (body as { locale?: string }).locale === "string"
    ? (body as { locale: string }).locale
    : siteConfig.defaultLocale) as Locale;

  const content = getRoom(input.roomSlug);
  if (!content) {
    return NextResponse.json({ error: "unknown_room" }, { status: 404 });
  }
  if (input.guests > content.maxGuests) {
    return NextResponse.json({ error: "too_many_guests" }, { status: 422 });
  }

  try {
    const meta = await getRoomMetaBySlug(input.roomSlug);
    if (!meta) {
      return NextResponse.json({ error: "unknown_room" }, { status: 404 });
    }

    // 2. Atomically create the pending reservation + hold the nights.
    const { data: reservationId, error } = await supabaseAdmin().rpc("hold_reservation", {
      p_room_id: meta.id,
      p_guest_name: input.name,
      p_guest_email: input.email,
      p_guest_phone: input.phone || null,
      p_check_in: input.checkIn,
      p_check_out: input.checkOut,
      p_guests_count: input.guests,
      p_message: input.message || null,
    });

    if (error) {
      // The RPC raises 'dates_unavailable' when a night just got taken.
      if (error.message?.includes("dates_unavailable")) {
        return NextResponse.json({ error: "dates_unavailable" }, { status: 409 });
      }
      console.error("[reservations] hold_reservation failed:", error);
      return NextResponse.json({ error: "could_not_reserve" }, { status: 500 });
    }

    // 3. Notify owner + guest (best-effort; never rolls back the hold).
    const emails = await sendReservationEmails({
      reservationId: reservationId as string,
      roomName: roomName(content, locale),
      guestName: input.name,
      guestEmail: input.email,
      guestPhone: input.phone || undefined,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      message: input.message || undefined,
    });

    return NextResponse.json(
      { ok: true, reservationId, status: "pending", emails },
      { status: 201 },
    );
  } catch (err) {
    console.error("[reservations] error:", err);
    return NextResponse.json({ error: "could_not_reserve" }, { status: 500 });
  }
}
