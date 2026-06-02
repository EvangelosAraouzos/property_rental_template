"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";

import { fromISODate, today } from "@/lib/booking/dates";

/**
 * Generic date-range picker for the booking flow. Disables past dates always,
 * plus any `busyDates` (YYYY-MM-DD) handed in from `availability`. Purely
 * presentational + controlled — the parent owns the selected range and decides
 * what "busy" means (per-room on a detail page, none on the home search).
 */
export function DateRangeField({
  range,
  onRangeChange,
  busyDates,
  numberOfMonths = 1,
}: {
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  busyDates?: string[];
  numberOfMonths?: number;
}) {
  const disabledDates = (busyDates ?? []).map((d) => fromISODate(d));

  return (
    <DayPicker
      mode="range"
      selected={range}
      onSelect={onRangeChange}
      numberOfMonths={numberOfMonths}
      // Past nights can never be booked; busy nights are already taken.
      disabled={[{ before: today() }, ...disabledDates]}
      // Don't let a selected range span a busy night.
      excludeDisabled
      startMonth={today()}
    />
  );
}
