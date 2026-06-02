import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, MapPin } from "lucide-react";

import { getAllProperties } from "@/lib/content";
import { siteConfig } from "@/config/site";
import { Map } from "@/components/Map";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ContactForm } from "./ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, properties] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getAllProperties(),
  ]);

  const markers = properties.map(({ slug, data }) => ({
    lat: data.lat,
    lng: data.lng,
    name: locale === "el" ? data.nameEl : data.nameEn,
    address: data.address,
    type: data.type,
  }));

  return (
    <div className="pt-24 pb-16">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">{t("subtitle")}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* ─── Contact details ──────────────────────────────────── */}
          <RevealOnScroll>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
                  {t("callUs")}
                </p>
                <div className="space-y-3">
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium">{siteConfig.contact.phone}</p>
                      <p className="text-xs text-muted-foreground">Onar House</p>
                    </div>
                  </a>
                  {siteConfig.contactSecondary && (
                    <a
                      href={`tel:${siteConfig.contactSecondary.phone}`}
                      className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Phone className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">{siteConfig.contactSecondary.phone}</p>
                        <p className="text-xs text-muted-foreground">Onar Studios</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
                  {t("emailUs")}
                </p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <p className="font-medium">{siteConfig.contact.email}</p>
                </a>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
                  {t("properties")}
                </p>
                <div className="space-y-3">
                  {properties.map(({ slug, data }) => (
                    <div key={slug} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {locale === "el" ? data.nameEl : data.nameEn}
                        </p>
                        <p className="text-sm text-muted-foreground">{data.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* ─── Contact form ─────────────────────────────────────── */}
          <RevealOnScroll delay={100}>
            <ContactForm locale={locale} />
          </RevealOnScroll>
        </div>

        {/* ─── Map ──────────────────────────────────────────────────── */}
        <RevealOnScroll>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-5">
              {t("findUs")}
            </h2>
            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border">
              <Map
                markers={markers}
                center={siteConfig.map}
                zoom={siteConfig.map.zoom}
              />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
