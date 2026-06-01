@AGENTS.md

# Boutique Property-Rental Template

A reusable template for small, boutique / family-run property-rental websites.
The first client built on it is **Onar Syros** — a family accommodation business
with two buildings in Ermoupolis, Syros, Greece.

> **Stack note:** This is Next.js **16** (App Router), React 19, Tailwind CSS
> **v4**, TypeScript. See `AGENTS.md` — several conventions differ from older
> Next.js (e.g. Middleware is now **Proxy** → `proxy.ts`). Check
> `node_modules/next/dist/docs/` before assuming an API.

---

## Template philosophy

**Content and branding are _data_. Code is _generic_ and reused across clients.**

- The components, layouts, i18n wiring and utilities are written once and reused
  unchanged for every client site.
- Everything that makes a site belong to a specific business — name, tagline,
  colors, fonts, contact details, social links, currency, locales, map, and (in
  future) page copy & listings — lives in **data**: `config/site.ts`,
  `messages/*.json`, and `content/` (Keystatic, added later).
- **Hard rule:** _Nothing client-specific is ever hardcoded in a component._ No
  literal business names, phone numbers, colors, or copy in `.tsx`. If a value
  changes between clients, it comes from config, messages, or content.

Launching a new client should be: edit `config/site.ts`, swap the brand token
values, translate `messages/*.json`, drop in logo + images, add content. No
component edits.

---

## Folder structure

```
app/
  [locale]/          # All routes live under the locale segment (en | el)
    layout.tsx       # Root layout: <html>, fonts, brand CSS vars, i18n provider
    page.tsx         # Placeholder home (real pages added later)
  fonts.ts           # next/font loaders, bound to --font-sans / --font-serif
  globals.css        # Tailwind v4 import + theme-token → brand-var mapping
components/          # Generic, reusable app components
  ui/                # shadcn/ui primitives (added via `shadcn add`)
config/
  site.ts            # ⭐ SINGLE SOURCE OF TRUTH for all client-specific config
content/             # Keystatic content collections (added later)
i18n/
  routing.ts         # Locales (read from config/site.ts) + default locale
  navigation.ts      # Locale-aware Link / redirect / router helpers
  request.ts         # Per-request locale + message loading
lib/
  utils.ts           # cn() class-name helper
  brand.ts           # Builds --brand-* CSS vars from config/site.ts
messages/
  en.json            # English UI strings (default locale)
  el.json            # Greek UI strings
proxy.ts             # Next 16 "Proxy" (ex-middleware): next-intl locale routing
components.json      # shadcn/ui config
next.config.ts       # Wraps config with the next-intl plugin
```

---

## Where theme tokens live (and how rebranding works)

There is one chain, and it flows from `config/site.ts` outward:

1. **`config/site.ts` → `brand.colors`** — the authoritative color values
   (camelCase keys: `primary`, `accent`, `background`, …).
2. **`lib/brand.ts` → `brandCssVars()`** — converts those into `--brand-*` CSS
   custom properties.
3. **`app/[locale]/layout.tsx`** — injects them onto `<html style={…}>`, so they
   are server-rendered (no flash) and override the fallbacks.
4. **`app/globals.css` → `@theme inline`** — maps Tailwind/shadcn tokens
   (`--color-primary`, `--color-background`, the radius scale, fonts) onto the
   `--brand-*` variables. `:root` holds fallback values only.
5. **Components** — use ordinary utility classes (`bg-primary`,
   `text-foreground`, `border`, `font-serif`). They read colors **only** through
   CSS variables; they never reference a hex value.

**To rebrand a client:** edit the `brand.colors` / `brand.fonts` / `brand.radius`
values in `config/site.ts` (and the matching `:root` fallbacks in `globals.css`
if you want them to match). Do not touch components.

Fonts: chosen in `app/fonts.ts` (next/font needs static calls) and bound to
`--font-sans` / `--font-serif`; `config/site.ts → brand.fonts` documents the
binding. Both default faces include the Greek subset for the `el` locale.

---

## How content is loaded

- **UI strings / labels** → `messages/<locale>.json`, read via next-intl:
  - Server: `getTranslations()` / `setRequestLocale()` from `next-intl/server`.
  - Client: `useTranslations()` from `next-intl`.
- **Structural client config** (brand, contact, social, currency, map, locales)
  → `config/site.ts`, imported directly (`import { siteConfig } from
  "@/config/site"`).
- **Long-form / editable content** (listings, descriptions, galleries) →
  `content/` via Keystatic. _Not wired yet_ — placeholder directory for now.

Locale routing: `proxy.ts` detects the locale and rewrites to `/[locale]/…`.
Always use the helpers from `i18n/navigation.ts` for links/redirects so the
locale prefix is preserved.

---

## Naming conventions

- **Files:** components `PascalCase.tsx`; non-component modules (config, lib,
  i18n, hooks) `kebab-case.ts` / `camelCase.ts` as in this scaffold.
- **Components:** `PascalCase`. Generic components in `components/`; shadcn
  primitives in `components/ui/`.
- **CSS variables:** brand source vars are `--brand-*`; Tailwind theme tokens are
  `--color-*` / `--font-*` / `--radius-*` and are what components consume.
- **Message keys:** namespaced by feature/section (`home.cta`, `nav.contact`),
  camelCase leaf keys; keep `en.json` and `el.json` structurally identical.
- **Imports:** use the `@/` path alias (e.g. `@/config/site`, `@/lib/utils`).

---

## Adding things

- **A shadcn component:** `npx shadcn@latest add button` → lands in
  `components/ui/`. (The shadcn registry must be reachable from your machine.)
- **A new locale:** add it to `LOCALES` in `config/site.ts` and create the
  matching `messages/<locale>.json`. Routing/proxy pick it up automatically.
- **A new client site:** copy the template, then edit only `config/site.ts`,
  `messages/*.json`, `content/`, and the brand assets in `public/brand/`.

---

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` / `npm run start` — production build / serve.
- `npm run lint` — ESLint.
