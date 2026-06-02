# Booking system (Supabase + Resend + iCal sync)

A reliable, low-friction, **request-to-reserve** booking system. No online card
payment — a guest sends a request, the dates are tentatively held, and the owner
confirms by email. This business also sells the same rooms on **Booking.com,
Airbnb and by phone**, so avoiding double-bookings is the priority. We handle
that for free with **periodic iCal calendar sync** (no paid channel manager).

> **Why request-to-reserve?** iCal sync is **periodic, not real-time**. Between
> syncs the website can lag the other channels, so an instant-confirm website
> would risk double-bookings. Owner confirmation is the safety net that covers
> the sync lag. This is stated in code comments throughout `lib/ical/*`.

---

## 1. Architecture

```
Keystatic (content)            Supabase (availability + reservations)
  content/rooms.ts  ── slug ──▶  rooms_meta  (id, slug, iCal import URLs, export token)
                                 availability (room_id, date, status, source)
                                 reservations (guest, dates, status=pending/confirmed/declined)
```

- **Content is data.** Room names/photos/prices live in `content/rooms.ts` (a
  Keystatic stand-in until Keystatic is wired). Availability + reservations live
  in Supabase. `rooms_meta.slug` joins the two.
- **Generic code, no hardcoding.** All copy is in `messages/*.json`; all
  structural config in `config/site.ts`; all secrets in env vars.

### Request flow (1–2 clicks)

1. Guest picks dates + guests (`components/booking/DateRangeField` disables past
   and unavailable dates from `availability`).
2. Matching available rooms are shown (`/api/rooms/search`), or, on a room page,
   just that room.
3. Guest submits a short request (`components/booking/RequestForm`, JSON POST —
   **never** a native `<form>` reload).
4. `/api/reservations` calls the atomic `hold_reservation` RPC: it creates a
   `pending` reservation **and** holds every night in one transaction. A unique
   constraint defeats concurrent double-bookings.
5. Two emails go out via Resend: owner (confirm/decline context) + guest
   (acknowledgement).

The owner confirms/declines in `/[locale]/admin` (gated by `ADMIN_TOKEN`).
Declining releases the held nights.

---

## 2. Setup

### a. Database

Run the schema, then seed one `rooms_meta` row per room slug:

```bash
# In the Supabase SQL editor (or `supabase db push`):
#   1. paste supabase/schema.sql   (tables, enums, RLS, hold_reservation RPC)
#   2. paste supabase/seed.sql     (rooms_meta rows; edit slugs/feeds to match)
```

Row Level Security (in `schema.sql`):

| Table          | anon (public)                            | service role |
| -------------- | ---------------------------------------- | ------------ |
| `availability` | **read** busy/free dates only            | full         |
| `reservations` | **insert** a `pending` request only      | full         |
| `rooms_meta`   | _no access_ (holds feeds + export token) | full         |

Guest PII in `reservations` is never readable by the public; the iCal export
exposes busy dates only.

### b. Environment variables

Copy `.env.example` → `.env.local` and fill in. Summary:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | RLS-constrained key (public reads/inserts) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — server-only, bypasses RLS |
| `RESEND_API_KEY` | Resend API key (free tier) |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `OWNER_NOTIFICATION_EMAIL` | Where owner alerts go (defaults to `siteConfig.contact.email`) |
| `CRON_SECRET` | Bearer token guarding the scheduled import |
| `ADMIN_TOKEN` | Bearer token guarding admin actions |
| `NEXT_PUBLIC_SITE_URL` | Absolute base URL (builds the export `.ics` URLs) |

### c. Channel sync (free, via iCal)

**Import** — `GET /api/cron/ical-import` fetches each room's Booking.com + Airbnb
feeds and writes blocked dates into `availability` (one `source` per channel, so
a re-import only rewrites that channel's rows). Scheduled via `vercel.json`
(every 2 h); Vercel attaches the `CRON_SECRET` bearer automatically. Also
runnable on demand: `POST /api/admin/ical-import` (admin "Sync channels now").

**Export** — `GET /api/ical/<export-token>` is a public, token-guarded `.ics`
feed per room, emitting that room's **website-confirmed bookings + manual
blocks** (never guest details). Copy each URL from the admin page and paste it
into Booking.com & Airbnb so those channels block the dates too.

Set the per-room import URLs in `rooms_meta` (or via Supabase). Get the export
URLs from the admin page (`/[locale]/admin` → "iCal export URLs").

---

## 3. Operational notes

- **Manual blocks:** insert an `availability` row with `source='manual'` (e.g.
  for maintenance). It blocks the website and is included in the export feed.
- **Confirm/decline:** `PATCH /api/admin/reservations`. Confirm keeps the hold
  (and exports it); decline frees the nights.
- **Tokens rotate:** change `rooms_meta.ical_export_token` to invalidate an old
  export URL.
- **Free-tier images:** `next.config.ts` sets `images.unoptimized` so room
  photos serve directly. Replace the SVG placeholders in `public/brand/rooms/`.
