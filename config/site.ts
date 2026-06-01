/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIG — THE SINGLE SOURCE OF TRUTH FOR EVERYTHING CLIENT-SPECIFIC
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This template is generic: the *code* (components, layouts, i18n wiring) is
 * reused unchanged across every client. Everything that makes a site belong to
 * a particular business — its name, voice, colors, fonts, contact details,
 * social links, currency, locales and map — lives HERE.
 *
 * To launch a new boutique property-rental site you should only need to:
 *   1. Edit the values in this file.
 *   2. Adjust the brand token VALUES (the `brand.colors` below feed the CSS
 *      variables consumed by Tailwind — see `app/globals.css` + `lib/brand.ts`).
 *   3. Drop in the client's logo + images and translate `messages/*.json`.
 *
 * RULE: never hardcode a client-specific string, color, phone number, etc. in a
 * component. Read it from here (or from `/content`, added later) instead.
 */

export const LOCALES = ["en", "el"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Brand color tokens.
 *
 * Keys are camelCase here for ergonomic editing; `lib/brand.ts` converts them
 * to kebab-case CSS custom properties (`--brand-primary`, …) and injects them
 * on the <html> element. `app/globals.css` maps Tailwind theme tokens
 * (`--color-primary`, …) onto these, so components style themselves with normal
 * utility classes (`bg-primary`, `text-foreground`) and never reference a raw
 * color value. Rebrand = change these values.
 *
 * The default palette below is "Onar Syros": a Cycladic / Aegean scheme of
 * whitewashed warm white, deep sea blue and a sun-baked terracotta accent.
 */
export interface BrandColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface BrandFonts {
  /** CSS variable that the loaded body font is bound to (see app/layout fonts). */
  sans: string;
  /** CSS variable that the loaded display/heading font is bound to. */
  serif: string;
}

export interface SiteContact {
  phone: string;
  email: string;
  address: string;
}

export interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
}

export interface SiteConfig {
  /** Business / brand name. */
  name: string;
  /** Short tagline shown under the name. */
  tagline: string;
  /** Public path to the primary logo asset. */
  logo: string;
  /** Optional alternate (e.g. light-on-dark) logo. */
  logoAlt?: string;

  brand: {
    colors: BrandColors;
    fonts: BrandFonts;
    /** Base corner radius for UI surfaces. */
    radius: string;
  };

  /** Primary point of contact. */
  contact: SiteContact;
  /** Optional secondary point of contact (e.g. a second building/manager). */
  contactSecondary?: SiteContact;

  social: {
    instagram?: string;
    facebook?: string;
    airbnb?: string;
    bookingCom?: string;
    whatsapp?: string;
  };

  /** ISO 4217 currency code used for pricing. */
  currency: string;
  /** Supported UI locales and the default. */
  locales: readonly Locale[];
  defaultLocale: Locale;

  /** Default map viewport (used by location sections / contact map). */
  map: MapCenter;
}

export const siteConfig: SiteConfig = {
  name: "Onar Syros",
  tagline: "Family-run boutique stays in Ermoupolis, Syros",
  logo: "/brand/logo.svg",
  logoAlt: "/brand/logo-light.svg",

  brand: {
    colors: {
      background: "#fbfaf7",
      foreground: "#1c2a33",
      card: "#ffffff",
      cardForeground: "#1c2a33",
      popover: "#ffffff",
      popoverForeground: "#1c2a33",
      primary: "#1f6f8b",
      primaryForeground: "#fbfaf7",
      secondary: "#e9e2d0",
      secondaryForeground: "#3a3326",
      muted: "#efede7",
      mutedForeground: "#6b6b63",
      accent: "#c9714b",
      accentForeground: "#fbfaf7",
      destructive: "#b3261e",
      destructiveForeground: "#fbfaf7",
      border: "#e2ded4",
      input: "#e2ded4",
      ring: "#1f6f8b",
    },
    fonts: {
      sans: "var(--font-sans)",
      serif: "var(--font-serif)",
    },
    radius: "0.625rem",
  },

  contact: {
    phone: "+30 22810 00000",
    email: "stay@onarsyros.com",
    address: "Ermoupolis, Syros 84100, Greece",
  },
  contactSecondary: {
    phone: "+30 22810 11111",
    email: "reservations@onarsyros.com",
    address: "Ano Syros, Syros 84100, Greece",
  },

  social: {
    instagram: "https://instagram.com/onarsyros",
    facebook: "https://facebook.com/onarsyros",
    airbnb: "",
    bookingCom: "",
    whatsapp: "",
  },

  currency: "EUR",
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,

  // Ermoupolis, Syros, Greece
  map: {
    lat: 37.4445,
    lng: 24.9419,
    zoom: 14,
  },
};

export default siteConfig;
