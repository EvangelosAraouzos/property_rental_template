import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";

/** camelCase -> kebab-case, for turning config keys into CSS custom prop names. */
function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Build the set of `--brand-*` CSS custom properties from the brand tokens in
 * `config/site.ts`. These are applied to the <html> element in the root layout
 * so that `app/globals.css` (which maps Tailwind `--color-*` tokens onto them)
 * — and therefore every component — reads brand colors purely via CSS
 * variables. Rebranding a client never requires touching component code.
 */
export function brandCssVars(): CSSProperties {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(siteConfig.brand.colors)) {
    vars[`--brand-${toKebabCase(key)}`] = value;
  }
  vars["--brand-radius"] = siteConfig.brand.radius;

  return vars as CSSProperties;
}
