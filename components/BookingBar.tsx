"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CalendarDays, Users, Search } from "lucide-react";

export function BookingBar() {
  const t = useTranslations("booking");
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/contact?${params.toString()}`);
  };

  return (
    <div className="bg-background rounded-2xl shadow-xl border border-border p-4 md:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
        {/* Check-in */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {t("checkIn")}
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {t("checkOut")}
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {t("guests")}
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? t("guest") : t("guestsPlural")}
              </option>
            ))}
          </select>
        </div>

        {/* Button */}
        <button
          onClick={handleSearch}
          className="h-10 px-5 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Search className="h-4 w-4" />
          {t("search")}
        </button>
      </div>
    </div>
  );
}
