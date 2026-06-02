"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { DateRange } from "react-day-picker";
import { useLocale, useTranslations } from "next-intl";

import { DateRangeField } from "./DateRangeField";
import { GuestsField } from "./GuestsField";
import { RequestForm } from "./RequestForm";
import { countNights, toISODate } from "@/lib/booking/dates";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import type { RoomSummary } from "@/lib/booking/room-view";

type SearchState = "idle" | "searching" | "done" | "error";

/**
 * The whole booking flow, in one low-friction widget — 1–2 clicks from a room or
 * the home page (the brief's core requirement):
 *
 *   • Detail mode (`room` set): pick dates for THIS room (its busy nights are
 *     disabled, pulled from /api/availability) → request form.
 *   • Search mode (`rooms` set): pick dates + guests → matching available rooms
 *     (from /api/rooms/search) → pick one → request form.
 *
 * Everything is client handlers + JSON route handlers — never a <form> reload.
 */
export function BookingWidget({
  rooms,
  room,
}: {
  /** All rooms (localised) — used to render search results / names. */
  rooms: RoomSummary[];
  /** When set, the widget is locked to this single room (detail page). */
  room?: RoomSummary;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();

  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);

  // Detail mode: busy nights for the locked room (to disable in the calendar).
  const [busyDates, setBusyDates] = useState<string[]>([]);
  useEffect(() => {
    if (!room) return;
    let active = true;
    fetch(`/api/availability?room=${encodeURIComponent(room.slug)}`)
      .then((r) => (r.ok ? r.json() : { busyDates: [] }))
      .then((d: { busyDates?: string[] }) => {
        if (active) setBusyDates(d.busyDates ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [room]);

  // Search mode: results + the room chosen for the request form.
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [results, setResults] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const checkIn = range?.from ? toISODate(range.from) : null;
  const checkOut = range?.to ? toISODate(range.to) : null;
  const nights = checkIn && checkOut ? countNights(checkIn, checkOut) : 0;
  const validRange = nights >= siteConfig.booking.minNights;

  const summaryBySlug = new Map(rooms.map((r) => [r.slug, r]));

  function resetSelection() {
    setSelectedSlug(null);
    setSearchState("idle");
    setResults([]);
    setRange(undefined);
  }

  async function handleSearch() {
    if (!checkIn || !checkOut || !validRange) return;
    setSearchState("searching");
    setSelectedSlug(null);
    try {
      const res = await fetch(
        `/api/rooms/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`,
      );
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as { rooms: { slug: string }[] };
      setResults(data.rooms.map((r) => r.slug));
      setSearchState("done");
    } catch {
      setSearchState("error");
    }
  }

  const dateBar = (
    <div className="rounded-lg border bg-card p-2 sm:p-3">
      <DateRangeField
        range={range}
        onRangeChange={(r) => {
          setRange(r);
          // Changing dates invalidates a prior search.
          if (!room) {
            setSearchState("idle");
            setSelectedSlug(null);
          }
        }}
        busyDates={room ? busyDates : undefined}
        numberOfMonths={1}
      />
    </div>
  );

  const nightsLabel = validRange ? (
    <p className="text-sm text-muted-foreground">
      {t("search.selectedRange", { checkIn: checkIn!, checkOut: checkOut!, nights })}
    </p>
  ) : (
    <p className="text-sm text-muted-foreground">{t("search.selectDates")}</p>
  );

  // ── DETAIL MODE ────────────────────────────────────────────────────────────
  if (room) {
    const showForm = validRange;
    return (
      <div className="space-y-4">
        {dateBar}
        <GuestsField value={guests} onChange={setGuests} max={room.maxGuests} />
        {nightsLabel}
        {showForm ? (
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h3 className="mb-4 font-serif text-lg text-foreground">{t("form.title")}</h3>
            <RequestForm
              roomSlug={room.slug}
              checkIn={checkIn!}
              checkOut={checkOut!}
              guests={guests}
              onReset={() => setRange(undefined)}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // ── SEARCH MODE ────────────────────────────────────────────────────────────
  const selectedRoom = selectedSlug ? summaryBySlug.get(selectedSlug) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <GuestsField value={guests} onChange={setGuests} />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!validRange || searchState === "searching"}
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {searchState === "searching" ? t("search.searching") : t("search.searchButton")}
        </button>
      </div>
      {dateBar}
      {nightsLabel}

      {searchState === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {t("search.error")}
        </p>
      )}

      {searchState === "done" && !selectedRoom && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="rounded-md border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              {t("search.noResults")}
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                {t("search.resultsTitle", { count: results.length })}
              </p>
              <ul className="space-y-3">
                {results.map((slug) => {
                  const r = summaryBySlug.get(slug);
                  if (!r) return null;
                  return (
                    <li
                      key={slug}
                      className="flex items-center gap-4 rounded-lg border bg-card p-3"
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={r.image}
                          alt={r.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-base text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("room.priceFrom", { price: formatPrice(r.pricePerNight, locale) })} ·{" "}
                          {t("search.guestsCount", { count: r.maxGuests })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSlug(slug)}
                        className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                      >
                        {t("room.requestButton")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      {selectedRoom && checkIn && checkOut && (
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg text-foreground">
              {t("form.titleFor", { room: selectedRoom.name })}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedSlug(null)}
              className="text-sm text-muted-foreground underline underline-offset-2"
            >
              {t("search.back")}
            </button>
          </div>
          <RequestForm
            roomSlug={selectedRoom.slug}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onReset={resetSelection}
          />
        </div>
      )}
    </div>
  );
}
