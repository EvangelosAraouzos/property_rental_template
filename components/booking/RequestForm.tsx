"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

import { countNights } from "@/lib/booking/dates";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * The request-to-reserve form (step 3-4 of the flow). Collects guest contact
 * details and POSTs JSON to `/api/reservations` — NO native <form> page reload.
 * Renders explicit loading / success / error states, and surfaces the special
 * "dates just got taken" (409) case so the guest can pick new dates.
 */
export function RequestForm({
  roomSlug,
  checkIn,
  checkOut,
  guests,
  onReset,
}: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  /** Called when the guest wants to start over (e.g. after an unavailable error). */
  onReset?: () => void;
}) {
  const t = useTranslations("booking.form");
  const locale = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<"generic" | "unavailable" | "validation">("generic");

  const nights = countNights(checkIn, checkOut);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    // Lightweight client-side validation for UX; the server is authoritative.
    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setStatus("error");
      setErrorKey("validation");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug,
          checkIn,
          checkOut,
          guests,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          locale,
        }),
      });

      if (res.ok) {
        setStatus("success");
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      if (data.error === "dates_unavailable") setErrorKey("unavailable");
      else if (data.error === "validation_failed") setErrorKey("validation");
      else setErrorKey("generic");
    } catch {
      setStatus("error");
      setErrorKey("generic");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center"
      >
        <h3 className="font-serif text-xl text-foreground">{t("success.title")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("success.body")}</p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "mb-1 block text-sm font-medium text-foreground";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("summary", { nights, guests })}
      </p>

      <div>
        <label htmlFor="rf-name" className={labelClass}>
          {t("name")}
        </label>
        <input
          id="rf-name"
          className={fieldClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rf-email" className={labelClass}>
            {t("email")}
          </label>
          <input
            id="rf-email"
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="rf-phone" className={labelClass}>
            {t("phone")}
          </label>
          <input
            id="rf-phone"
            type="tel"
            className={fieldClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label htmlFor="rf-message" className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id="rf-message"
          className={`${fieldClass} min-h-24 resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
        />
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {t(`errors.${errorKey}`)}
          {errorKey === "unavailable" && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="ml-2 underline underline-offset-2"
            >
              {t("errors.pickNewDates")}
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>

      <p className="text-center text-xs text-muted-foreground">{t("notInstant")}</p>
    </form>
  );
}
