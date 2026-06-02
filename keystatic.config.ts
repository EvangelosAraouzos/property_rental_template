import { config, collection, singleton, fields } from "@keystatic/core";

const ml = (label: string) => fields.text({ label, multiline: true });
const tf = (label: string) => fields.text({ label });
const req = (label: string) => fields.text({ label, validation: { isRequired: true } });

export default config({
  storage: { kind: "local" },
  ui: { brand: { name: "Onar CMS" } },

  singletons: {
    settings: singleton({
      label: "Home & Site Settings",
      path: "content/settings",
      schema: {
        heroTitleEn: tf("Hero Title (EN)"),
        heroTitleEl: tf("Hero Title (EL)"),
        heroSubtitleEn: tf("Hero Subtitle (EN)"),
        heroSubtitleEl: tf("Hero Subtitle (EL)"),
        heroImagePath: tf("Hero Image Path"),
        heroVideoPath: tf("Hero Video Path (mp4, optional)"),
        heroPosterPath: tf("Hero Video Poster Path"),
        aboutEn: ml("About / One-liner intro (EN)"),
        aboutEl: ml("About / One-liner intro (EL)"),
        syrosTeaserEn: ml("Syros Teaser Text (EN)"),
        syrosTeaserEl: ml("Syros Teaser Text (EL)"),
        syrosTeaserImagePath: tf("Syros Teaser Image Path"),
        featuredRoomSlugs: fields.array(tf("Room Slug"), {
          label: "Featured Room Slugs",
          itemLabel: (p) => p.value ?? "Room",
        }),
      },
    }),
  },

  collections: {
    properties: collection({
      label: "Properties",
      path: "content/properties/*",
      slugField: "nameEn",
      format: { data: "json" },
      schema: {
        nameEn: req("Name (EN)"),
        nameEl: req("Name (EL)"),
        taglineEn: tf("Tagline (EN)"),
        taglineEl: tf("Tagline (EL)"),
        type: fields.select({
          label: "Type",
          options: [
            { label: "Luxury", value: "luxury" },
            { label: "Rustic", value: "rustic" },
          ],
          defaultValue: "luxury",
        }),
        descriptionEn: ml("Description (EN)"),
        descriptionEl: ml("Description (EL)"),
        address: tf("Address"),
        lat: fields.number({ label: "Latitude" }),
        lng: fields.number({ label: "Longitude" }),
        heroImagePath: tf("Hero Image Path"),
        imagePaths: fields.array(tf("Image Path"), {
          label: "Gallery Images",
          itemLabel: () => "Image",
        }),
        amenityKeys: fields.array(tf("Amenity Key"), {
          label: "Amenities",
          itemLabel: (p) => p.value ?? "",
        }),
        highlightsEn: fields.array(tf("Highlight (EN)"), {
          label: "Highlights (EN)",
          itemLabel: (p) => p.value ?? "",
        }),
        highlightsEl: fields.array(tf("Highlight (EL)"), {
          label: "Highlights (EL)",
          itemLabel: (p) => p.value ?? "",
        }),
        distanceLabelEn: fields.array(tf("Place Name (EN)"), {
          label: "Distance Labels (EN)",
          itemLabel: (p) => p.value ?? "",
        }),
        distanceLabelEl: fields.array(tf("Place Name (EL)"), {
          label: "Distance Labels (EL)",
          itemLabel: (p) => p.value ?? "",
        }),
        distanceValue: fields.array(tf("Distance (e.g. 5 min walk)"), {
          label: "Distance Values",
          itemLabel: (p) => p.value ?? "",
        }),
        featured: fields.checkbox({ label: "Featured on Home Page", defaultValue: true }),
        order: fields.integer({ label: "Display Order", defaultValue: 0 }),
      },
    }),

    rooms: collection({
      label: "Rooms",
      path: "content/rooms/*",
      slugField: "nameEn",
      format: { data: "json" },
      schema: {
        nameEn: req("Name (EN)"),
        nameEl: req("Name (EL)"),
        propertySlug: req("Property Slug"),
        descriptionEn: ml("Description (EN)"),
        descriptionEl: ml("Description (EL)"),
        size: fields.integer({ label: "Size (m²)" }),
        capacity: fields.integer({ label: "Max Guests" }),
        beds: tf("Beds (e.g. 1 King bed)"),
        floor: tf("Floor (e.g. Ground floor)"),
        priceFrom: fields.integer({ label: "Price From (€/night)" }),
        viewEn: tf("View (EN)"),
        viewEl: tf("View (EL)"),
        heroImagePath: tf("Hero Image Path"),
        imagePaths: fields.array(tf("Image Path"), {
          label: "Gallery Images",
          itemLabel: () => "Image",
        }),
        videoPath: tf("Video Path (optional mp4)"),
        videoPosterPath: tf("Video Poster Path"),
        amenityKeys: fields.array(tf("Amenity Key"), {
          label: "Amenities",
          itemLabel: (p) => p.value ?? "",
        }),
        houseRulesEn: ml("House Rules (EN)"),
        houseRulesEl: ml("House Rules (EL)"),
        breakfastNoteEn: tf("Breakfast Note (EN)"),
        breakfastNoteEl: tf("Breakfast Note (EL)"),
        featured: fields.checkbox({ label: "Featured on Home Page", defaultValue: false }),
        order: fields.integer({ label: "Display Order", defaultValue: 0 }),
      },
    }),

    pages: collection({
      label: "Pages",
      path: "content/pages/*",
      slugField: "titleEn",
      format: { data: "json" },
      schema: {
        titleEn: req("Title (EN)"),
        titleEl: req("Title (EL)"),
        heroImagePath: tf("Hero Image Path"),
        seoTitleEn: tf("SEO Title (EN)"),
        seoTitleEl: tf("SEO Title (EL)"),
        seoDescriptionEn: tf("SEO Description (EN)"),
        seoDescriptionEl: tf("SEO Description (EL)"),
        sectionHeadingsEn: fields.array(tf("Heading (EN)"), {
          label: "Section Headings (EN)",
          itemLabel: (p) => p.value ?? "",
        }),
        sectionBodiesEn: fields.array(ml("Body (EN)"), {
          label: "Section Bodies (EN)",
          itemLabel: () => "Section",
        }),
        sectionHeadingsEl: fields.array(tf("Heading (EL)"), {
          label: "Section Headings (EL)",
          itemLabel: (p) => p.value ?? "",
        }),
        sectionBodiesEl: fields.array(ml("Body (EL)"), {
          label: "Section Bodies (EL)",
          itemLabel: () => "Section",
        }),
      },
    }),

    policies: collection({
      label: "Policies",
      path: "content/policies/*",
      slugField: "titleEn",
      format: { data: "json" },
      schema: {
        titleEn: req("Title (EN)"),
        titleEl: req("Title (EL)"),
        order: fields.integer({ label: "Display Order", defaultValue: 0 }),
        sectionHeadingsEn: fields.array(tf("Heading (EN)"), {
          label: "Section Headings (EN)",
          itemLabel: (p) => p.value ?? "",
        }),
        sectionBodiesEn: fields.array(ml("Body (EN)"), {
          label: "Section Bodies (EN)",
          itemLabel: () => "Section",
        }),
        sectionHeadingsEl: fields.array(tf("Heading (EL)"), {
          label: "Section Headings (EL)",
          itemLabel: (p) => p.value ?? "",
        }),
        sectionBodiesEl: fields.array(ml("Body (EL)"), {
          label: "Section Bodies (EL)",
          itemLabel: () => "Section",
        }),
      },
    }),
  },
});
