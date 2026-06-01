/**
 * Keystatic CMS configuration.
 *
 * Storage strategy:
 *   • Development (default)     → local filesystem (git-tracked YAML under content/)
 *   • Production / CI           → GitHub storage (set env vars below)
 *
 * Required env vars for GitHub mode:
 *   KEYSTATIC_STORAGE_KIND=github
 *   NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER=<org-or-user>
 *   NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME=<repo>
 *   NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=<oauth-app-slug>   ← created in Keystatic Cloud
 */

import { config, fields, collection, singleton } from "@keystatic/core";

// ─── Storage ──────────────────────────────────────────────────────────────────

type StorageConfig =
  | { kind: "local" }
  | { kind: "github"; repo: { owner: string; name: string } };

const storage: StorageConfig =
  process.env.KEYSTATIC_STORAGE_KIND === "github"
    ? {
        kind: "github",
        repo: {
          owner: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER ?? "",
          name: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME ?? "",
        },
      }
    : { kind: "local" };

// ─── i18n helpers ─────────────────────────────────────────────────────────────

/** Short single-line bilingual text → { en, el } in YAML. */
const i18nText = (label: string, description?: string) =>
  fields.object(
    {
      en: fields.text({ label: `${label} (EN)` }),
      el: fields.text({ label: `${label} (EL)` }),
    },
    { label, description }
  );

/** Multi-line bilingual text (markdown supported). */
const i18nLong = (label: string, description?: string) =>
  fields.object(
    {
      en: fields.text({ label: `${label} (EN)`, multiline: true }),
      el: fields.text({ label: `${label} (EL)`, multiline: true }),
    },
    { label, description }
  );

// ─── Amenity catalogue (multiselect values) ───────────────────────────────────
// Labels shown in the admin UI only; the frontend translates values via
// messages/en.json and messages/el.json  (key path: amenities.<value>).

const AMENITIES = [
  { label: "Air-conditioning", value: "air-conditioning" },
  { label: "Flat-screen TV", value: "tv" },
  { label: "Netflix", value: "netflix" },
  { label: "Free Wi-Fi", value: "wifi" },
  { label: "Safe-deposit box", value: "safe" },
  { label: "Iron", value: "iron" },
  { label: "Private bathroom", value: "private-bathroom" },
  { label: "Toiletries (shampoo & shower gel)", value: "toiletries" },
  { label: "Slippers", value: "slippers" },
  { label: "Hairdryer", value: "hairdryer" },
  { label: "Washing machine", value: "washing-machine" },
  { label: "Refrigerator", value: "refrigerator" },
  { label: "Kitchenette", value: "kitchenette" },
  { label: "Toaster", value: "toaster" },
  { label: "Kitchenware", value: "kitchenware" },
  { label: "Espresso machine", value: "espresso-machine" },
  { label: "Coffee maker", value: "coffee-pot" },
  { label: "Water boiler", value: "water-boiler" },
  { label: "Drying rack", value: "drying-rack" },
  { label: "Balcony / terrace", value: "balcony" },
  { label: "Sea view", value: "sea-view" },
  { label: "City view", value: "city-view" },
  { label: "Courtyard access", value: "courtyard" },
  { label: "Heating", value: "heating" },
  { label: "Bathtub", value: "bathtub" },
  { label: "Baby cot (on request)", value: "baby-cot" },
  { label: "Luggage storage", value: "luggage-storage" },
  { label: "Parking nearby", value: "parking" },
] as const;

// ─── Room type options ─────────────────────────────────────────────────────────

const ROOM_TYPES = [
  { label: "Room", value: "room" },
  { label: "Studio", value: "studio" },
  { label: "Suite", value: "suite" },
] as const;

const BED_TYPES = [
  { label: "1 × double bed", value: "1-double" },
  { label: "2 × single beds (twin)", value: "2-single-twin" },
  { label: "1 × double + 1 × sofa-bed", value: "1-double-sofabed" },
  { label: "2 × double beds", value: "2-double" },
  { label: "1 × king-size bed", value: "1-king" },
  { label: "Other", value: "other" },
] as const;

// ─── Config ───────────────────────────────────────────────────────────────────

export default config({
  storage,

  ui: {
    brand: { name: "Onar Syros CMS" },
    navigation: {
      Site: ["settings"],
      Properties: ["properties", "rooms"],
      "Pages & Policies": ["pages", "policies"],
    },
  },

  // ── Singletons ──────────────────────────────────────────────────────────────

  singletons: {
    settings: singleton({
      label: "Site Settings",
      path: "content/settings",
      schema: {
        // ── Identity ──────────────────────────────────────────────────────────
        businessName: fields.text({ label: "Business Name" }),
        tagline: i18nText("Tagline"),
        logo: fields.text({
          label: "Logo path",
          defaultValue: "/brand/logo.svg",
          description: "Public path to the primary SVG/PNG logo.",
        }),
        logoAlt: fields.text({
          label: "Alt logo path (light variant)",
          defaultValue: "/brand/logo-light.svg",
          description: "Used on dark backgrounds. Leave blank if none.",
        }),

        // ── Contact ───────────────────────────────────────────────────────────
        contact: fields.object(
          {
            phone: fields.text({ label: "Phone" }),
            email: fields.text({ label: "Email" }),
            address: fields.text({ label: "Address" }),
          },
          { label: "Primary Contact" }
        ),
        contactSecondary: fields.object(
          {
            phone: fields.text({
              label: "Phone",
              defaultValue: "",
              description: "Leave blank if there is no secondary contact.",
            }),
            email: fields.text({ label: "Email", defaultValue: "" }),
            address: fields.text({ label: "Address", defaultValue: "" }),
          },
          { label: "Secondary Contact" }
        ),

        // ── Social / booking links ─────────────────────────────────────────────
        socialInstagram: fields.url({ label: "Instagram URL" }),
        socialFacebook: fields.url({ label: "Facebook URL" }),
        socialAirbnb: fields.url({ label: "Airbnb profile URL" }),
        socialBookingCom: fields.url({ label: "Booking.com profile URL" }),
        socialWhatsapp: fields.url({
          label: "WhatsApp URL",
          description: "e.g. https://wa.me/30XXXXXXXXXX",
        }),

        // ── Operations ────────────────────────────────────────────────────────
        checkIn: fields.text({ label: "Check-in Time", defaultValue: "15:00" }),
        checkOut: fields.text({
          label: "Check-out Time",
          defaultValue: "11:00",
        }),
        currency: fields.text({ label: "Currency (ISO 4217)", defaultValue: "EUR" }),

        defaultHouseRules: i18nLong(
          "Default House Rules",
          "Markdown supported. Copied as starter text when creating a new room."
        ),

        // ── Brand tokens (informational — runtime still reads config/site.ts) ─
        brand: fields.object(
          {
            colorBackground: fields.text({
              label: "Background",
              defaultValue: "#fbfaf7",
            }),
            colorForeground: fields.text({
              label: "Foreground",
              defaultValue: "#1c2a33",
            }),
            colorPrimary: fields.text({
              label: "Primary",
              defaultValue: "#1f6f8b",
            }),
            colorPrimaryForeground: fields.text({
              label: "Primary foreground",
              defaultValue: "#fbfaf7",
            }),
            colorSecondary: fields.text({
              label: "Secondary",
              defaultValue: "#e9e2d0",
            }),
            colorSecondaryForeground: fields.text({
              label: "Secondary foreground",
              defaultValue: "#3a3326",
            }),
            colorAccent: fields.text({
              label: "Accent",
              defaultValue: "#c9714b",
            }),
            colorAccentForeground: fields.text({
              label: "Accent foreground",
              defaultValue: "#fbfaf7",
            }),
            colorMuted: fields.text({
              label: "Muted",
              defaultValue: "#efede7",
            }),
            colorMutedForeground: fields.text({
              label: "Muted foreground",
              defaultValue: "#6b6b63",
            }),
            colorBorder: fields.text({
              label: "Border",
              defaultValue: "#e2ded4",
            }),
            colorCard: fields.text({ label: "Card", defaultValue: "#ffffff" }),
            radius: fields.text({
              label: "Border radius",
              defaultValue: "0.625rem",
            }),
          },
          {
            label: "Brand Tokens",
            description:
              "Reference values. The live site currently reads tokens from config/site.ts — update both until the CMS→runtime bridge is wired.",
          }
        ),
      },
    }),
  },

  // ── Collections ─────────────────────────────────────────────────────────────

  collections: {
    // ── Properties ────────────────────────────────────────────────────────────
    properties: collection({
      label: "Properties",
      slugField: "slug",
      path: "content/properties/*/",
      schema: {
        slug: fields.text({
          label: "Slug",
          validation: { isRequired: true },
          description: "URL-safe identifier, e.g. onar-luxuries. Matches the directory name.",
        }),
        name: i18nText("Name"),
        shortDescription: i18nText("Short Description"),
        longDescription: i18nLong("Long Description"),
        locationText: i18nLong(
          "Location Text",
          "Narrative paragraph describing the location, distances and neighbourhood."
        ),
        lat: fields.number({
          label: "Latitude",
          defaultValue: 37.4445,
        }),
        lng: fields.number({
          label: "Longitude",
          defaultValue: 24.9419,
        }),
        distanceNotes: fields.array(
          fields.object({
            en: fields.text({ label: "Note (EN)" }),
            el: fields.text({ label: "Note (EL)" }),
          }),
          {
            label: "Distance & POI Notes",
            description:
              'e.g. "350m from port", "1km to beach". Displayed as a list on the property page.',
          }
        ),
        heroImage: fields.image({
          label: "Hero Image",
          directory: "public/images/properties",
          publicPath: "/images/properties",
        }),
        gallery: fields.array(
          fields.image({
            label: "Image",
            directory: "public/images/properties",
            publicPath: "/images/properties",
          }),
          { label: "Gallery" }
        ),
        breakfastNote: i18nText(
          "Breakfast Note",
          "Leave blank if breakfast is not included."
        ),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        order: fields.integer({ label: "Display Order", defaultValue: 0 }),
      },
    }),

    // ── Rooms ─────────────────────────────────────────────────────────────────
    rooms: collection({
      label: "Rooms",
      slugField: "slug",
      path: "content/rooms/*/",
      schema: {
        slug: fields.text({
          label: "Slug",
          validation: { isRequired: true },
        }),
        property: fields.relationship({
          label: "Property",
          collection: "properties",
          validation: { isRequired: true },
        }),
        name: i18nText("Name"),
        roomType: fields.select({
          label: "Room Type",
          options: ROOM_TYPES,
          defaultValue: "room",
        }),
        bedType: fields.select({
          label: "Bed Configuration",
          options: BED_TYPES,
          defaultValue: "1-double",
        }),
        maxGuests: fields.integer({ label: "Max Guests", defaultValue: 2 }),
        sizeM2: fields.integer({
          label: "Size (m²)",
          defaultValue: 0,
          description: "0 = not specified.",
        }),
        floor: fields.integer({
          label: "Floor",
          defaultValue: 0,
          description: "0 = ground floor.",
        }),
        amenities: fields.multiselect({
          label: "Amenities",
          options: AMENITIES,
          defaultValue: [],
        }),
        houseRulesText: i18nLong("House Rules Text"),
        breakfastNote: i18nText("Breakfast Note"),
        description: i18nLong("Description"),
        coverImage: fields.image({
          label: "Cover Image",
          directory: "public/images/rooms",
          publicPath: "/images/rooms",
        }),
        gallery: fields.array(
          fields.image({
            label: "Image",
            directory: "public/images/rooms",
            publicPath: "/images/rooms",
          }),
          { label: "Gallery" }
        ),
        videoUrl: fields.url({ label: "Video URL (optional)" }),
        pricePerNight: fields.integer({
          label: "Base Price / Night (optional)",
          description: "Leave at 0 to hide pricing.",
          defaultValue: 0,
        }),
        sortOrder: fields.integer({ label: "Sort Order", defaultValue: 0 }),
      },
    }),

    // ── Pages ─────────────────────────────────────────────────────────────────
    pages: collection({
      label: "Pages",
      slugField: "slug",
      path: "content/pages/*/",
      schema: {
        slug: fields.text({
          label: "Slug",
          validation: { isRequired: true },
          description: "Used as the URL segment, e.g. about or syros.",
        }),
        title: i18nText("Title"),
        seoDescription: i18nText("SEO Description"),
        heroImage: fields.image({
          label: "Hero Image",
          directory: "public/images/pages",
          publicPath: "/images/pages",
        }),
        gallery: fields.array(
          fields.image({
            label: "Image",
            directory: "public/images/pages",
            publicPath: "/images/pages",
          }),
          { label: "Gallery" }
        ),
        content: i18nLong("Content", "Markdown supported."),
      },
    }),

    // ── Policies ──────────────────────────────────────────────────────────────
    policies: collection({
      label: "Policies",
      slugField: "slug",
      path: "content/policies/*/",
      schema: {
        slug: fields.text({
          label: "Slug",
          validation: { isRequired: true },
        }),
        title: i18nText("Title"),
        type: fields.select({
          label: "Policy Type",
          options: [
            { label: "Terms of Use", value: "terms-of-use" },
            { label: "Privacy & Cookies", value: "privacy-cookies" },
            {
              label: "Reservation & Cancellation",
              value: "reservation-cancellation",
            },
          ],
          defaultValue: "terms-of-use",
        }),
        lastUpdated: fields.date({ label: "Last Updated" }),
        order: fields.integer({ label: "Display Order", defaultValue: 0 }),
        content: i18nLong("Content", "Markdown supported."),
      },
    }),
  },
});
