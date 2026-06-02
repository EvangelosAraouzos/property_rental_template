import "server-only";

import { Resend } from "resend";

import { siteConfig } from "@/config/site";
import { countNights } from "@/lib/booking/dates";

/**
 * Transactional emails for a new reservation request, sent via Resend (free
 * tier). Two messages go out on a pending request:
 *   1. OWNER  — full context + the explicit confirm/decline decision they own.
 *   2. GUEST  — a friendly "request received, not yet confirmed" acknowledgement.
 *
 * Email is best-effort: a send failure must NOT roll back an already-created
 * reservation (the hold is the source of truth). Callers log and continue.
 */

export interface ReservationEmailData {
  reservationId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
}

function resendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  return new Resend(key);
}

function ownerEmailAddress(): string {
  return process.env.OWNER_NOTIFICATION_EMAIL || siteConfig.contact.email;
}

function fromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_FROM_EMAIL is not set.");
  return `${siteConfig.name} <${from}>`;
}

function stayLine(d: ReservationEmailData): string {
  const nights = countNights(d.checkIn, d.checkOut);
  return `${d.checkIn} → ${d.checkOut} (${nights} night${nights === 1 ? "" : "s"}, ${d.guests} guest${d.guests === 1 ? "" : "s"})`;
}

function ownerHtml(d: ReservationEmailData): string {
  return `
    <h2>New booking request · ${siteConfig.name}</h2>
    <p><strong>This is a request to reserve — it is not yet confirmed.</strong>
       Check your other channels (Booking.com, Airbnb, phone) before confirming.</p>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td><strong>Room</strong></td><td>${d.roomName}</td></tr>
      <tr><td><strong>Dates</strong></td><td>${stayLine(d)}</td></tr>
      <tr><td><strong>Guest</strong></td><td>${d.guestName}</td></tr>
      <tr><td><strong>Email</strong></td><td>${d.guestEmail}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${d.guestPhone || "—"}</td></tr>
      <tr><td><strong>Message</strong></td><td>${d.message || "—"}</td></tr>
      <tr><td><strong>Ref</strong></td><td>${d.reservationId}</td></tr>
    </table>
    <p>The dates are tentatively held on the website. Confirm or decline this
       request in your admin, then reply to the guest at
       <a href="mailto:${d.guestEmail}">${d.guestEmail}</a>.</p>
  `;
}

function guestHtml(d: ReservationEmailData): string {
  return `
    <h2>We've received your request · ${siteConfig.name}</h2>
    <p>Hi ${d.guestName}, thank you for your booking request. <strong>This is not
       a confirmation yet</strong> — we'll review availability across our booking
       channels and email you shortly to confirm.</p>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td><strong>Room</strong></td><td>${d.roomName}</td></tr>
      <tr><td><strong>Dates</strong></td><td>${stayLine(d)}</td></tr>
      <tr><td><strong>Reference</strong></td><td>${d.reservationId}</td></tr>
    </table>
    <p>If you need to reach us: ${siteConfig.contact.email} · ${siteConfig.contact.phone}</p>
  `;
}

/**
 * Send both emails. Returns whether each succeeded; never throws so the caller
 * can keep the reservation even if mail delivery is degraded.
 */
export async function sendReservationEmails(
  d: ReservationEmailData,
): Promise<{ owner: boolean; guest: boolean }> {
  const result = { owner: false, guest: false };

  let resend: Resend;
  let from: string;
  try {
    resend = resendClient();
    from = fromAddress();
  } catch (err) {
    console.error("[email] Resend not configured:", err);
    return result;
  }

  try {
    await resend.emails.send({
      from,
      to: ownerEmailAddress(),
      replyTo: d.guestEmail,
      subject: `New request: ${d.roomName} · ${d.checkIn} → ${d.checkOut}`,
      html: ownerHtml(d),
    });
    result.owner = true;
  } catch (err) {
    console.error("[email] owner notification failed:", err);
  }

  try {
    await resend.emails.send({
      from,
      to: d.guestEmail,
      replyTo: ownerEmailAddress(),
      subject: `Your request at ${siteConfig.name}`,
      html: guestHtml(d),
    });
    result.guest = true;
  } catch (err) {
    console.error("[email] guest confirmation failed:", err);
  }

  return result;
}
