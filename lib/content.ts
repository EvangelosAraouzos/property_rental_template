import { promises as fs } from "fs";
import path from "path";

const CONTENT = path.join(process.cwd(), "content");

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function listSlugs(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(path.join(CONTENT, dir));
    return entries.filter((e) => e.endsWith(".json")).map((e) => e.slice(0, -5));
  } catch {
    return [];
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SettingsData {
  heroTitleEn: string;
  heroTitleEl: string;
  heroSubtitleEn: string;
  heroSubtitleEl: string;
  heroImagePath: string;
  heroVideoPath: string;
  heroPosterPath: string;
  aboutEn: string;
  aboutEl: string;
  syrosTeaserEn: string;
  syrosTeaserEl: string;
  syrosTeaserImagePath: string;
  featuredRoomSlugs: string[];
}

export interface PropertyData {
  nameEn: string;
  nameEl: string;
  taglineEn: string;
  taglineEl: string;
  type: "luxury" | "rustic";
  descriptionEn: string;
  descriptionEl: string;
  address: string;
  lat: number;
  lng: number;
  heroImagePath: string;
  imagePaths: string[];
  amenityKeys: string[];
  highlightsEn: string[];
  highlightsEl: string[];
  distanceLabelEn: string[];
  distanceLabelEl: string[];
  distanceValue: string[];
  featured: boolean;
  order: number;
}

export interface RoomData {
  nameEn: string;
  nameEl: string;
  propertySlug: string;
  descriptionEn: string;
  descriptionEl: string;
  size: number;
  capacity: number;
  beds: string;
  floor: string;
  priceFrom: number;
  viewEn: string;
  viewEl: string;
  heroImagePath: string;
  imagePaths: string[];
  videoPath: string;
  videoPosterPath: string;
  amenityKeys: string[];
  houseRulesEn: string;
  houseRulesEl: string;
  breakfastNoteEn: string;
  breakfastNoteEl: string;
  featured: boolean;
  order: number;
}

export interface PageData {
  titleEn: string;
  titleEl: string;
  heroImagePath: string;
  seoTitleEn: string;
  seoTitleEl: string;
  seoDescriptionEn: string;
  seoDescriptionEl: string;
  sectionHeadingsEn: string[];
  sectionBodiesEn: string[];
  sectionHeadingsEl: string[];
  sectionBodiesEl: string[];
}

export interface PolicyData {
  titleEn: string;
  titleEl: string;
  order: number;
  sectionHeadingsEn: string[];
  sectionBodiesEn: string[];
  sectionHeadingsEl: string[];
  sectionBodiesEl: string[];
}

// ─── Reader helpers ──────────────────────────────────────────────────────────

export async function getSettings(): Promise<SettingsData | null> {
  return readJson<SettingsData>(path.join(CONTENT, "settings.json"));
}

export async function getAllProperties(): Promise<Array<{ slug: string; data: PropertyData }>> {
  const slugs = await listSlugs("properties");
  const results = await Promise.all(
    slugs.map(async (slug) => {
      const data = await readJson<PropertyData>(path.join(CONTENT, "properties", `${slug}.json`));
      return data ? { slug, data } : null;
    })
  );
  return (results.filter(Boolean) as Array<{ slug: string; data: PropertyData }>).sort(
    (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
  );
}

export async function getProperty(slug: string): Promise<PropertyData | null> {
  return readJson<PropertyData>(path.join(CONTENT, "properties", `${slug}.json`));
}

export async function getAllRooms(propertySlug?: string): Promise<Array<{ slug: string; data: RoomData }>> {
  const slugs = await listSlugs("rooms");
  const results = await Promise.all(
    slugs.map(async (slug) => {
      const data = await readJson<RoomData>(path.join(CONTENT, "rooms", `${slug}.json`));
      return data ? { slug, data } : null;
    })
  );
  return (results.filter(Boolean) as Array<{ slug: string; data: RoomData }>)
    .filter((r) => !propertySlug || r.data.propertySlug === propertySlug)
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

export async function getRoom(slug: string): Promise<RoomData | null> {
  return readJson<RoomData>(path.join(CONTENT, "rooms", `${slug}.json`));
}

export async function getAllPages(): Promise<Array<{ slug: string; data: PageData }>> {
  const slugs = await listSlugs("pages");
  const results = await Promise.all(
    slugs.map(async (slug) => {
      const data = await readJson<PageData>(path.join(CONTENT, "pages", `${slug}.json`));
      return data ? { slug, data } : null;
    })
  );
  return results.filter(Boolean) as Array<{ slug: string; data: PageData }>;
}

export async function getPage(slug: string): Promise<PageData | null> {
  return readJson<PageData>(path.join(CONTENT, "pages", `${slug}.json`));
}

export async function getAllPolicies(): Promise<Array<{ slug: string; data: PolicyData }>> {
  const slugs = await listSlugs("policies");
  const results = await Promise.all(
    slugs.map(async (slug) => {
      const data = await readJson<PolicyData>(path.join(CONTENT, "policies", `${slug}.json`));
      return data ? { slug, data } : null;
    })
  );
  return (results.filter(Boolean) as Array<{ slug: string; data: PolicyData }>).sort(
    (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
  );
}

export async function getPolicy(slug: string): Promise<PolicyData | null> {
  return readJson<PolicyData>(path.join(CONTENT, "policies", `${slug}.json`));
}

// Zip parallel section arrays into structured pairs
export function zipSections(
  headings: string[],
  bodies: string[]
): Array<{ heading: string; body: string }> {
  return headings.map((heading, i) => ({ heading, body: bodies[i] ?? "" }));
}

// Zip parallel distance arrays into structured triples
export function zipDistances(
  labelsEn: string[],
  labelsEl: string[],
  values: string[]
): Array<{ labelEn: string; labelEl: string; value: string }> {
  return labelsEn.map((labelEn, i) => ({
    labelEn,
    labelEl: labelsEl[i] ?? labelEn,
    value: values[i] ?? "",
  }));
}

// Pick the right locale string from a pair
export function loc<T>(en: T, el: T, locale: string): T {
  return locale === "el" ? el : en;
}
