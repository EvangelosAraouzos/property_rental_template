import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { ExternalLink } from "lucide-react";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tn = await getTranslations({ locale, namespace: "nav" });

  return (
    <footer className="bg-foreground text-primary-foreground/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-serif text-xl font-semibold text-white mb-2">
              {siteConfig.name}
            </p>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              {siteConfig.tagline}
            </p>
            <div className="flex gap-3 mt-4">
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {siteConfig.social.facebook && (
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              {t("explore")}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  {tn("properties")}
                </Link>
              </li>
              <li>
                <Link href="/syros" className="hover:text-white transition-colors">
                  {tn("syros")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {tn("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              {t("legal")}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/policies/cancellation" className="hover:text-white transition-colors">
                  {t("cancellation")}
                </Link>
              </li>
              <li>
                <Link href="/policies/house-rules" className="hover:text-white transition-colors">
                  {t("houseRules")}
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition-colors">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              {t("contact")}
            </p>
            <address className="not-italic text-sm space-y-2.5">
              <p className="leading-snug">{siteConfig.contact.address}</p>
              <p>
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. {t("rights")}
          </p>
          <p>{t("madein")}</p>
        </div>
      </div>
    </footer>
  );
}
