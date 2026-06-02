/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ROOMS — CONTENT (Keystatic stand-in)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Room *content* (name, description, capacity, photos, indicative price) is
 *  client data and is destined to live in Keystatic (`content/`). Keystatic is
 *  not wired yet, so this typed module is the temporary content source. The
 *  generic booking code reads rooms ONLY through `getRooms()` / `getRoom()`
 *  below, so swapping this for a Keystatic reader later is a one-file change.
 *
 *  The `slug` here is the stable join key to Supabase `rooms_meta.slug`
 *  (availability + reservations). Keep the two in sync (see supabase/seed.sql).
 *
 *  Localised fields are keyed by locale so copy stays translatable like the rest
 *  of the site. Nothing here is referenced by hardcoded string in a component.
 */

import type { Locale } from "@/config/site";

export interface RoomContent {
  /** Stable slug — must match `rooms_meta.slug` in Supabase. */
  slug: string;
  /** Maximum guests this room sleeps (drives the availability search filter). */
  maxGuests: number;
  /** Number of bedrooms, for display. */
  bedrooms: number;
  /** Indicative nightly price in `siteConfig.currency` (display only — no card
   *  payment in this version). */
  pricePerNight: number;
  /** Hero/representative image path under /public. */
  image: string;
  /** Localised display name. */
  name: Record<Locale, string>;
  /** Localised short description. */
  description: Record<Locale, string>;
}

/**
 * Onar Syros rooms. Replace with Keystatic-sourced content when that lands; the
 * shape returned by `getRooms()` is the contract the booking UI depends on.
 */
const ROOMS: RoomContent[] = [
  {
    slug: "aegean-suite",
    maxGuests: 4,
    bedrooms: 2,
    pricePerNight: 180,
    image: "/brand/rooms/aegean-suite.svg",
    name: {
      en: "Aegean Suite",
      el: "Σουίτα Αιγαίο",
    },
    description: {
      en: "A light-filled two-bedroom suite with a private balcony over the harbour of Ermoupolis.",
      el: "Μια φωτεινή σουίτα δύο υπνοδωματίων με ιδιωτικό μπαλκόνι πάνω από το λιμάνι της Ερμούπολης.",
    },
  },
  {
    slug: "cycladic-loft",
    maxGuests: 2,
    bedrooms: 1,
    pricePerNight: 120,
    image: "/brand/rooms/cycladic-loft.svg",
    name: {
      en: "Cycladic Loft",
      el: "Σοφίτα των Κυκλάδων",
    },
    description: {
      en: "An intimate whitewashed loft for two, steps from the marble streets of the old town.",
      el: "Μια ατμοσφαιρική ασβεστωμένη σοφίτα για δύο, λίγα βήματα από τα μαρμάρινα σοκάκια της παλιάς πόλης.",
    },
  },
  {
    slug: "garden-studio",
    maxGuests: 3,
    bedrooms: 1,
    pricePerNight: 140,
    image: "/brand/rooms/garden-studio.svg",
    name: {
      en: "Garden Studio",
      el: "Στούντιο με Κήπο",
    },
    description: {
      en: "A ground-floor studio opening onto a shaded courtyard garden, sleeping up to three.",
      el: "Ένα ισόγειο στούντιο που ανοίγει σε μια σκιερή αυλή με κήπο, για έως τρία άτομα.",
    },
  },
];

/** All rooms (content order). */
export function getRooms(): RoomContent[] {
  return ROOMS;
}

/** A single room by slug, or undefined if unknown. */
export function getRoom(slug: string): RoomContent | undefined {
  return ROOMS.find((r) => r.slug === slug);
}

/** Localised name helper. */
export function roomName(room: RoomContent, locale: Locale): string {
  return room.name[locale] ?? room.name.en;
}

/** Localised description helper. */
export function roomDescription(room: RoomContent, locale: Locale): string {
  return room.description[locale] ?? room.description.en;
}
