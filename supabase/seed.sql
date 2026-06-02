-- ─────────────────────────────────────────────────────────────────────────────
--  SEED: rooms_meta
-- ─────────────────────────────────────────────────────────────────────────────
--  Creates one rooms_meta row per Keystatic room slug (see content/rooms.ts).
--  The export token is auto-generated; read the resulting tokens from the admin
--  page (or `select slug, ical_export_token from rooms_meta;`) and paste each
--  room's export URL into Booking.com / Airbnb.
--
--  Fill in the import URLs once you have the per-listing iCal feed URLs from each
--  channel's calendar settings. Re-running is safe (idempotent on slug).
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.rooms_meta (slug, ical_import_booking_url, ical_import_airbnb_url)
values
  ('aegean-suite',   null, null),
  ('cycladic-loft',  null, null),
  ('garden-studio',  null, null)
on conflict (slug) do nothing;
