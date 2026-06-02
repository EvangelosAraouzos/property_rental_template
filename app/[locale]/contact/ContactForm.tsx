"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle } from "lucide-react";

export function ContactForm({ locale: _locale }: { locale: string }) {
  const t = useTranslations("contact");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Booking-wired in next prompt — placeholder submission
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle className="h-12 w-12 text-primary" />
        <p className="font-serif text-xl font-semibold text-foreground">{t("sent")}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            {t("nameLabel")}
          </label>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            {t("emailLabel")}
          </label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {t("phoneLabel")}
        </label>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {t("subjectLabel")}
        </label>
        <input
          type="text"
          name="subject"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {t("messageLabel")}
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {t("sendLabel")}
      </button>
    </form>
  );
}
