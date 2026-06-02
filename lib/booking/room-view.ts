import {
  getRoom,
  getRooms,
  roomDescription,
  roomName,
  type RoomContent,
} from "@/content/rooms";
import type { Locale } from "@/config/site";

/**
 * Serialisable, localised room shape passed from server components into the
 * client `BookingWidget`. Keeps the (potentially Keystatic-sourced) content
 * decoupled from the client bundle — only plain data crosses the boundary.
 */
export interface RoomSummary {
  slug: string;
  name: string;
  description: string;
  image: string;
  maxGuests: number;
  bedrooms: number;
  pricePerNight: number;
}

function toSummary(room: RoomContent, locale: Locale): RoomSummary {
  return {
    slug: room.slug,
    name: roomName(room, locale),
    description: roomDescription(room, locale),
    image: room.image,
    maxGuests: room.maxGuests,
    bedrooms: room.bedrooms,
    pricePerNight: room.pricePerNight,
  };
}

/** All rooms as localised summaries. */
export function roomSummaries(locale: Locale): RoomSummary[] {
  return getRooms().map((r) => toSummary(r, locale));
}

/** A single room summary, or undefined if the slug is unknown. */
export function roomSummary(slug: string, locale: Locale): RoomSummary | undefined {
  const room = getRoom(slug);
  return room ? toSummary(room, locale) : undefined;
}
