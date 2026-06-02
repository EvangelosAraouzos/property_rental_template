import { NextResponse, type NextRequest } from "next/server";

import { getRooms } from "@/content/rooms";
import { getAllRoomsMeta } from "@/lib/booking/rooms-meta";
import { getBusyDatesForRooms, isRangeFree } from "@/lib/booking/availability";
import { countNights, isISODate } from "@/lib/booking/dates";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export interface RoomSearchResult {
  slug: string;
  maxGuests: number;
  bedrooms: number;
  pricePerNight: number;
  image: string;
}

/**
 * GET /api/rooms/search?checkIn=&checkOut=&guests=
 *
 * The heart of the 1–2-click flow: given dates + guest count, return the rooms
 * that (a) sleep that many guests and (b) are free for every requested night.
 * Joins Keystatic-style content (capacity, price) with Supabase availability.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const checkIn = p.get("checkIn") ?? "";
  const checkOut = p.get("checkOut") ?? "";
  const guests = Number(p.get("guests") ?? "1");

  if (!isISODate(checkIn) || !isISODate(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > siteConfig.booking.maxGuests) {
    return NextResponse.json({ error: "Invalid guest count" }, { status: 400 });
  }

  try {
    // Rooms that can physically host the party.
    const contentRooms = getRooms().filter((r) => r.maxGuests >= guests);
    if (contentRooms.length === 0) {
      return NextResponse.json({ checkIn, checkOut, guests, nights: countNights(checkIn, checkOut), rooms: [] });
    }

    // Map content slugs -> Supabase ids (only rooms that exist in both).
    const metas = await getAllRoomsMeta();
    const idBySlug = new Map(metas.map((m) => [m.slug, m.id]));
    const searchable = contentRooms.filter((r) => idBySlug.has(r.slug));

    const ids = searchable.map((r) => idBySlug.get(r.slug)!);
    const busyByRoom = await getBusyDatesForRooms(ids, checkIn, checkOut);

    const rooms: RoomSearchResult[] = searchable
      .filter((r) => {
        const busy = busyByRoom.get(idBySlug.get(r.slug)!) ?? new Set<string>();
        return isRangeFree(busy, checkIn, checkOut);
      })
      .map((r) => ({
        slug: r.slug,
        maxGuests: r.maxGuests,
        bedrooms: r.bedrooms,
        pricePerNight: r.pricePerNight,
        image: r.image,
      }));

    return NextResponse.json({
      checkIn,
      checkOut,
      guests,
      nights: countNights(checkIn, checkOut),
      rooms,
    });
  } catch (err) {
    console.error("[rooms/search] error:", err);
    return NextResponse.json({ error: "Could not search availability" }, { status: 500 });
  }
}
