"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CalendarDays, Users, Info } from "lucide-react";

interface BookingWidgetProps {
  roomSlug: string;
  roomName: string;
  priceFrom: number;
  capacity: number;
}

export function BookingWidget({ roomSlug, roomName, priceFrom, capacity }: BookingWidgetProps) {
  const t = useTranslations("booking");
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const today = new Date().toISOString().split("T")[0];

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
          )
        )
      : 0;

  const total = nights > 0 ? nights * priceFrom : null;

  const handleBook = () => {
    const params = new URLSearchParams({ room: roomSlug });
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/contact?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
      {/* Price header */}
      <div className="mb-5 pb-4 border-b border-border">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-foreground">€{priceFrom}</span>
          <span className="text-sm text-muted-foreground">/ {t("night")}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{t("priceFrom")}</p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {t("checkIn")}
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {t("checkOut")}
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
          <Users className="h-3 w-3" />
          {t("guests")}
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {Array.from({ length: capacity }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? t("guest") : t("guestsPlural")}
            </option>
          ))}
        </select>
      </div>

      {/* Total */}
      {total !== null && (
        <div className="mb-4 p-3 rounded-lg bg-muted flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            €{priceFrom} × {nights} {nights === 1 ? t("night") : t("nights")}
          </span>
          <span className="font-semibold text-foreground">€{total}</span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleBook}
        className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        {t("checkAvailability")}
      </button>

      <p className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
        <Info className="h-3 w-3" />
        {t("noChargeYet")}
      </p>
    </div>
  );
}
