"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

/* Inline SVGs for brand icons not available in lucide-react v1 */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/rooms",    key: "rooms"    },
  { href: "/location", key: "location" },
  { href: "/about",    key: "about"    },
  { href: "/contact",  key: "contact"  },
] as const;

export default function Footer() {
  const t    = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={120}
                height={40}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-background/65 leading-relaxed max-w-xs">
              {t("tagline")}
            </p>

            {/* Social links */}
            <div className="flex gap-4 mt-6">
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-background/50 hover:text-background transition-colors"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              )}
              {siteConfig.social.facebook && (
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-background/50 hover:text-background transition-colors"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-5">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-background/65 hover:text-background transition-colors"
                  >
                    {tNav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-5">
              {t("contactUs")}
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-background/65">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-background/40" />
                {siteConfig.contact.address}
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="flex items-center gap-2.5 text-sm text-background/65 hover:text-background transition-colors"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-background/40" />
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-2.5 text-sm text-background/65 hover:text-background transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-background/40" />
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-5">
              {t("legal")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-background/65 hover:text-background transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-background/65 hover:text-background transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-sm text-background/65 hover:text-background transition-colors">
                  {t("cancellation")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/40">
            {t("copyright", { year, name: siteConfig.name })}
          </p>
          <p className="text-xs text-background/40">{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
