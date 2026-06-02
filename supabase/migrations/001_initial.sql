-- ─────────────────────────────────────────────────────────────────────────────
--  001_initial — Booking system schema (Supabase / Postgres)
-- ─────────────────────────────────────────────────────────────────────────────
--  Initial migration provisioning the request-to-reserve booking system:
--  rooms_meta, availability, reservations, the atomic hold_reservation RPC, and
--  Row Level Security.
--
--  Apply with the Supabase CLI:   supabase db push
--  (or paste into the SQL editor). Idempotent where practical so it is safe to
--  re-run during development.
--
--  Design notes
--  ------------
--  * CONTENT (room names, photos, copy, price) lives in Keystatic. AVAILABILITY
--    and RESERVATIONS live here. `rooms_meta.slug` joins the two worlds.
--  * The business sells the same rooms on Booking.com, Airbnb, by phone AND the
--    website. Double-bookings are the #1 risk, handled for free with PERIODIC
--    iCal sync (not real-time) — which is why bookings stay request-to-reserve:
--    owner confirmation is the safety net against sync lag.
--  * A date is "busy" for a room iff an `availability` row exists for that
--    (room, date) with status in ('blocked','booked'). Absence of a row = free.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto; -- gen_random_uuid(), gen_random_bytes()

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type availability_status as enum ('available', 'blocked', 'booked');
exception when duplicate_object then null; end $$;

do $$ begin
  -- where a block/booking originated, so we know what to trust and what to purge
  -- on the next import run.
  create type availability_source as enum ('website', 'booking_com', 'airbnb', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reservation_status as enum ('pending', 'confirmed', 'declined');
exception when duplicate_object then null; end $$;

-- ── rooms_meta ───────────────────────────────────────────────────────────────
-- Links a Keystatic room slug -> a stable Supabase room id, and holds the
-- per-room channel sync config (import feed URLs + a generated export token).
create table if not exists public.rooms_meta (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique,                 -- Keystatic room slug
  ical_import_booking_url  text,                                 -- Booking.com feed
  ical_import_airbnb_url   text,                                 -- Airbnb feed
  -- Bearer token embedded in this room's public .ics export URL. Rotatable.
  ical_export_token        text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at               timestamptz not null default now()
);

-- ── reservations ─────────────────────────────────────────────────────────────
create table if not exists public.reservations (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.rooms_meta(id) on delete cascade,
  guest_name    text not null,
  guest_email   text not null,
  guest_phone   text,
  check_in      date not null,
  check_out     date not null,
  guests_count  int  not null check (guests_count > 0),
  message       text,
  status        reservation_status not null default 'pending',
  created_at    timestamptz not null default now(),
  constraint reservations_dates_ck check (check_out > check_in)
);

create index if not exists reservations_room_idx on public.reservations (room_id);
create index if not exists reservations_status_idx on public.reservations (status);

-- ── availability ─────────────────────────────────────────────────────────────
-- One row per (room, date, source). A night is busy if ANY source has a
-- blocked/booked row for it. Keeping rows per-source means an import can safely
-- purge + rewrite only its OWN channel's rows without touching manual blocks or
-- website holds.
create table if not exists public.availability (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references public.rooms_meta(id) on delete cascade,
  date            date not null,
  status          availability_status not null default 'blocked',
  source          availability_source not null,
  -- set when this row is a website hold tied to a reservation; null otherwise.
  reservation_id  uuid references public.reservations(id) on delete cascade,
  updated_at      timestamptz not null default now(),
  unique (room_id, date, source)
);

create index if not exists availability_room_date_idx on public.availability (room_id, date);

-- ─────────────────────────────────────────────────────────────────────────────
--  ATOMIC RESERVATION HOLD
-- ─────────────────────────────────────────────────────────────────────────────
--  Inserts a pending reservation AND tentatively holds every night as a
--  website-sourced 'booked' availability row, in a single transaction.
--
--  Double-booking protection:
--   1. Re-checks (inside the txn) that no night is already busy from ANY source.
--   2. The unique(room_id, date, 'website') constraint makes two concurrent
--      website holds for the same night collide — the loser's transaction aborts.
--
--  Returns the new reservation id. Raises 'dates_unavailable' if any night is
--  taken — callers map that to a friendly "just got booked, pick new dates".
create or replace function public.hold_reservation(
  p_room_id      uuid,
  p_guest_name   text,
  p_guest_email  text,
  p_guest_phone  text,
  p_check_in     date,
  p_check_out    date,
  p_guests_count int,
  p_message      text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation_id uuid;
  v_night date;
begin
  if p_check_out <= p_check_in then
    raise exception 'invalid_date_range';
  end if;

  -- 1. Bail early if any requested night is already blocked or booked.
  if exists (
    select 1 from public.availability a
    where a.room_id = p_room_id
      and a.status in ('blocked', 'booked')
      and a.date >= p_check_in
      and a.date <  p_check_out
  ) then
    raise exception 'dates_unavailable';
  end if;

  -- 2. Create the pending reservation.
  insert into public.reservations (
    room_id, guest_name, guest_email, guest_phone,
    check_in, check_out, guests_count, message, status
  ) values (
    p_room_id, p_guest_name, p_guest_email, p_guest_phone,
    p_check_in, p_check_out, p_guests_count, p_message, 'pending'
  ) returning id into v_reservation_id;

  -- 3. Hold every night (check-out morning is free). A concurrent website hold
  --    on the same night trips the unique constraint and aborts this txn.
  v_night := p_check_in;
  while v_night < p_check_out loop
    insert into public.availability (room_id, date, status, source, reservation_id)
    values (p_room_id, v_night, 'booked', 'website', v_reservation_id);
    v_night := v_night + 1;
  end loop;

  return v_reservation_id;
exception
  when unique_violation then
    raise exception 'dates_unavailable';
end;
$$;

-- Only the trusted server (service role) may call this; the route handler
-- validates input first. Anon never calls it directly.
revoke all on function public.hold_reservation(uuid, text, text, text, date, date, int, text) from public, anon, authenticated;
grant execute on function public.hold_reservation(uuid, text, text, text, date, date, int, text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.rooms_meta   enable row level security;
alter table public.reservations enable row level security;
alter table public.availability enable row level security;

-- rooms_meta: PRIVATE. It holds the import feed URLs and the export token, so
-- the public anon role gets NO access. The server resolves slug -> id with the
-- service-role key. (No anon policies = deny all for anon.)

-- availability: the public may READ busy/free dates (no guest data lives here
-- beyond an opaque reservation_id uuid). No public writes — holds are written by
-- the trusted hold_reservation() RPC under the service role.
drop policy if exists availability_public_read on public.availability;
create policy availability_public_read
  on public.availability for select
  to anon, authenticated
  using (true);

-- reservations: the public may INSERT a request, but may NOT read anyone's
-- reservations (guest PII). Reads happen only via the service role in the admin.
drop policy if exists reservations_public_insert on public.reservations;
create policy reservations_public_insert
  on public.reservations for insert
  to anon, authenticated
  with check (status = 'pending');
-- (Intentionally NO select/update/delete policy for anon -> those are denied.)
