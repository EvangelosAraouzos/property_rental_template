import { defineRouting } from "next-intl/routing";
import { siteConfig } from "@/config/site";

/**
 * Locale routing config. Locales come from the single source of truth in
 * `config/site.ts`, so adding/removing a language is a config-only change.
 */
export const routing = defineRouting({
  locales: siteConfig.locales,
  defaultLocale: siteConfig.defaultLocale,
});
