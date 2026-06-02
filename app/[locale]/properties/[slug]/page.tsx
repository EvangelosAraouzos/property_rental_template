import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Clock } from "lucide-react";

import { getAllProperties, getProperty, getAllRooms, zipDistances } from "@/lib/content";
import { RoomCard } from "@/components/RoomCard";
import { AmenitiesList } from "@/components/AmenitiesList";
import { Gallery } from "@/components/Gallery";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { routing } from "@/i18n/routing";
import { BookingBar } from "@/components/BookingBar";

export async function generateStaticParams() {
  const properties = await getAllProperties();
  return routing.locales.flatMap((locale) =>
    properties.map(({ slug }) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getProperty(slug);
  if (!data) return {};
  return {
    title: locale === "el" ? data.nameEl : data.nameEn,
    description: locale === "el" ? data.taglineEl : data.taglineEn,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [data, rooms, t, tb] = await Promise.all([
    getProperty(slug),
    getAllRooms(slug),
    getTranslations({ locale, namespace: "property" }),
    getTranslations({ locale, namespace: "booking" }),
  ]);

  if (!data) notFound();

  const name = locale === "el" ? data.nameEl : data.nameEn;
  const description = locale === "el" ? data.descriptionEl : data.descriptionEn;
  const highlights = locale === "el" ? data.highlightsEl : data.highlightsEn;
  const distances = zipDistances(data.distanceLabelEn, data.distanceLabelEl, data.distanceValue);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <div className="relative h-[55vh] md:h-[65vh] min-h-[380px] overflow-hidden">
        {data.heroImagePath ? (
          <Image
            src={data.heroImagePath}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-foreground" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-2">
            {data.type === "luxury" ? "Luxury" : "Rustic"} · Syros
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white mb-2">{name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-white/70">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {data.address}
          </p>
        </div>
      </div>

      {/* ─── Booking bar ──────────────────────────────────────────── */}
      <div className="bg-muted/60 border-b border-border px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-4xl mx-auto">
          <BookingBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* ─── Main column ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <RevealOnScroll>
              <div>
                <p className="text-foreground/80 leading-relaxed text-base md:text-lg">
                  {description}
                </p>
              </div>
            </RevealOnScroll>

            {/* Highlights */}
            {highlights.length > 0 && (
              <RevealOnScroll>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    {t("highlights")}
                  </h2>
                  <ul className="space-y-3">
                    {highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            )}

            {/* Gallery */}
            {data.imagePaths.length > 0 && (
              <RevealOnScroll>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    {t("gallery")}
                  </h2>
                  <Gallery images={data.imagePaths} alt={name} />
                </div>
              </RevealOnScroll>
            )}

            {/* Amenities */}
            {data.amenityKeys.length > 0 && (
              <RevealOnScroll>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    {t("highlights")}
                  </h2>
                  <AmenitiesList keys={data.amenityKeys} />
                </div>
              </RevealOnScroll>
            )}
          </div>

          {/* ─── Sidebar ────────────────────────────────────────────── */}
          <aside className="space-y-6">
            {/* Location */}
            <RevealOnScroll>
              <div className="rounded-2xl border border-border p-5 bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t("location")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{data.address}</p>

                {/* Distances */}
                {distances.length > 0 && (
                  <>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      {t("distances")}
                    </h4>
                    <ul className="space-y-2">
                      {distances.map((d, i) => (
                        <li key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground/80">
                            {locale === "el" ? d.labelEl : d.labelEn}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            {d.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </RevealOnScroll>
          </aside>
        </div>

        {/* ─── Rooms grid ───────────────────────────────────────────── */}
        {rooms.length > 0 && (
          <div className="mt-16 md:mt-24">
            <RevealOnScroll>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-8">
                {t("rooms")}
              </h2>
            </RevealOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(({ slug: rSlug, data: rData }, i) => (
                <RevealOnScroll key={rSlug} delay={i * 80}>
                  <RoomCard
                    slug={rSlug}
                    data={rData}
                    locale={locale}
                    fromLabel={tb("priceFrom")}
                    nightLabel={tb("night")}
                    viewLabel={t("viewRoom")}
                  />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
