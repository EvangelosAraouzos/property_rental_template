/**
 * Typed content helpers for reading Keystatic CMS data in Server Components
 * and Route Handlers. All functions are server-side only (filesystem access).
 *
 * Usage:
 *   import { getAllProperties, getRoom, getSettings } from "@/lib/content"
 *   const settings = await getSettings()
 *   const properties = await getAllProperties()
 */

import { createReader } from "@keystatic/core/reader";
import config from "@/keystatic.config";

// ─── Reader factory ───────────────────────────────────────────────────────────

function reader() {
  return createReader(process.cwd(), config);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings() {
  return reader().singletons.settings.read();
}
export type SettingsEntry = NonNullable<Awaited<ReturnType<typeof getSettings>>>;

// ─── Properties ───────────────────────────────────────────────────────────────

export async function getProperty(slug: string) {
  return reader().collections.properties.read(slug);
}
export type PropertyEntry = NonNullable<Awaited<ReturnType<typeof getProperty>>>;
export type PropertyListItem = { slug: string; entry: PropertyEntry };

/** All properties sorted by display order. */
export async function getAllProperties(): Promise<PropertyListItem[]> {
  const entries = await reader().collections.properties.all();
  return (entries as PropertyListItem[]).sort(
    (a, b) => (a.entry.order ?? 0) - (b.entry.order ?? 0)
  );
}

export async function getFeaturedProperties(): Promise<PropertyListItem[]> {
  const all = await getAllProperties();
  return all.filter((p) => p.entry.featured);
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function getRoom(slug: string) {
  return reader().collections.rooms.read(slug);
}
export type RoomEntry = NonNullable<Awaited<ReturnType<typeof getRoom>>>;
export type RoomListItem = { slug: string; entry: RoomEntry };

/** All rooms sorted by sortOrder. */
export async function getAllRooms(): Promise<RoomListItem[]> {
  const entries = await reader().collections.rooms.all();
  return (entries as RoomListItem[]).sort(
    (a, b) => (a.entry.sortOrder ?? 0) - (b.entry.sortOrder ?? 0)
  );
}

/** Rooms for a given property slug, sorted by sortOrder. */
export async function getRoomsByProperty(
  propertySlug: string
): Promise<RoomListItem[]> {
  const all = await getAllRooms();
  return all.filter((r) => r.entry.property === propertySlug);
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export async function getPage(slug: string) {
  return reader().collections.pages.read(slug);
}
export type PageEntry = NonNullable<Awaited<ReturnType<typeof getPage>>>;

export async function getAllPages() {
  return reader().collections.pages.all();
}

// ─── Policies ─────────────────────────────────────────────────────────────────

export async function getPolicy(slug: string) {
  return reader().collections.policies.read(slug);
}
export type PolicyEntry = NonNullable<Awaited<ReturnType<typeof getPolicy>>>;

export async function getAllPolicies() {
  const entries = await reader().collections.policies.all();
  return entries.sort(
    (a, b) =>
      ((a.entry as PolicyEntry).order ?? 0) -
      ((b.entry as PolicyEntry).order ?? 0)
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Resolve the bilingual { en, el } object for the active locale.
 * Falls back to English if the Greek string is empty.
 */
export function localise(
  field: { en: string; el: string } | null | undefined,
  locale: "en" | "el"
): string {
  if (!field) return "";
  return field[locale] || field.en || "";
}
