import { z } from "zod";

import { siteConfig } from "@/config/site";
import { countNights, isISODate, today, toISODate } from "@/lib/booking/dates";

/**
 * Server-side validation for an incoming reservation request. The client also
 * validates for UX, but this is the authoritative check — never trust the body.
 */
export const reservationSchema = z
  .object({
    roomSlug: z.string().min(1),
    checkIn: z.string().refine(isISODate, "Invalid check-in date"),
    checkOut: z.string().refine(isISODate, "Invalid check-out date"),
    guests: z.coerce.number().int().min(1).max(siteConfig.booking.maxGuests),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((v) => v.checkOut > v.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  })
  .refine((v) => v.checkIn >= toISODate(today()), {
    message: "Check-in cannot be in the past",
    path: ["checkIn"],
  })
  .refine((v) => countNights(v.checkIn, v.checkOut) >= siteConfig.booking.minNights, {
    message: `Minimum stay is ${siteConfig.booking.minNights} night(s)`,
    path: ["checkOut"],
  });

export type ReservationInput = z.infer<typeof reservationSchema>;
