"use client";

import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";

/** Guest-count selector, capped at `siteConfig.booking.maxGuests`. */
export function GuestsField({
  value,
  onChange,
  max = siteConfig.booking.maxGuests,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  const t = useTranslations("booking.search");

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{t("guests")}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {t("guestsCount", { count: n })}
          </option>
        ))}
      </select>
    </label>
  );
}
