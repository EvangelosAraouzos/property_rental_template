import { config, fields, collection, singleton } from "@keystatic/core";

// ─── Localised field helpers ─────────────────────────────────────────────────

/** Inline bilingual text (EN / EL) stored as an object in YAML. */
const i18nText = (label: string) =>
  fields.object(
    {
      en: fields.text({ label: `${label} (EN)` }),
      el: fields.text({ label: `${label} (EL)` }),
    },
    { label }
  );

/** Multiline bilingual text. */
const i18nLong = (label: string) =>
  fields.object(
    {
      en: fields.text({ label: `${label} (EN)`, multiline: true }),
      el: fields.text({ label: `${label} (EL)`, multiline: true }),
    },
    { label }
  );

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

/** Bilingual amenity item used in property + room arrays. */
const amenityItem = fields.object(
  {
    en: fields.text({ label: "Amenity (EN)" }),
    el: fields.text({ label: "Amenity (EL)" }),
  },
  { label: "Amenity" }
);

// ─── Config ───────────────────────────────────────────────────────────────────

export default config({
  storage: { kind: "local" },

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
        checkIn: fields.text({
          label: "Check-in Time",
          defaultValue: "15:00",
        }),
        checkOut: fields.text({
          label: "Check-out Time",
          defaultValue: "11:00",
        }),
        minStay: fields.integer({
          label: "Minimum Stay (nights)",
          defaultValue: 2,
        }),

        heroHeading: i18nText("Hero Heading"),
        heroSubheading: i18nLong("Hero Sub-heading"),

        aboutTitle: i18nText("About Title"),
        aboutBody: i18nLong("About Body"),

        highlights: fields.array(
          fields.object({
            icon: fields.text({ label: "Icon (Lucide icon name)" }),
            title: i18nText("Title"),
            body: i18nLong("Body"),
          }),
          { label: "Highlights" }
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
          description:
            "URL-safe identifier, e.g. onar-a. Must match the directory name.",
        }),
        title: i18nText("Title"),
        tagline: i18nText("Tagline"),
        shortDescription: i18nLong("Short Description"),

        address: fields.text({ label: "Address" }),
        coordinates: fields.object(
          {
            lat: fields.number({ label: "Latitude", defaultValue: 37.4445 }),
            lng: fields.number({ label: "Longitude", defaultValue: 24.9419 }),
          },
          { label: "Map Coordinates" }
        ),

        coverImage: fields.image({
          label: "Cover Image",
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

        amenities: fields.array(amenityItem, { label: "Amenities" }),

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
          description: "URL-safe identifier, e.g. onar-a-sea-view-studio.",
        }),
        property: fields.relationship({
          label: "Property",
          collection: "properties",
          validation: { isRequired: true },
          description: "Parent property building.",
        }),

        title: i18nText("Title"),
        tagline: i18nText("Tagline"),
        shortDescription: i18nLong("Short Description"),

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

        adults: fields.integer({ label: "Max Adults", defaultValue: 2 }),
        children: fields.integer({ label: "Max Children", defaultValue: 0 }),
        bedrooms: fields.integer({
          label: "Bedrooms (0 = studio)",
          defaultValue: 0,
        }),
        bathrooms: fields.integer({ label: "Bathrooms", defaultValue: 1 }),
        sizeM2: fields.integer({ label: "Size (m²)", defaultValue: 0 }),
        floor: fields.integer({ label: "Floor", defaultValue: 0 }),

        priceFrom: fields.integer({
          label: "Price From (EUR / night)",
          defaultValue: 0,
        }),
        bookingUrl: fields.url({ label: "Booking.com URL" }),
        airbnbUrl: fields.url({ label: "Airbnb URL" }),

        amenities: fields.array(amenityItem, { label: "Amenities" }),

        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        order: fields.integer({ label: "Display Order", defaultValue: 0 }),
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
          description: "Used as the URL segment, e.g. about.",
        }),
        title: i18nText("Title"),
        seoDescription: i18nLong("SEO Description"),
        content: i18nLong("Content"),
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
            { label: "Check-in / Check-out", value: "check-in" },
            { label: "House Rules", value: "house-rules" },
            { label: "Cancellation Policy", value: "cancellation" },
            { label: "Payment Policy", value: "payment" },
            { label: "Pet Policy", value: "pets" },
          ],
          defaultValue: "house-rules",
        }),
        order: fields.integer({ label: "Display Order", defaultValue: 0 }),
        content: i18nLong("Content"),
      },
    }),
  },
});
