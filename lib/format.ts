import { siteConfig } from "@/config/site";

/** Format an amount in the site currency for the given locale (no card payment;
 *  prices are indicative/display only in this version). */
export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
