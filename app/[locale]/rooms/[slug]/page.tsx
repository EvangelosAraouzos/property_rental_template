import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Bed, Users, Maximize2, Eye, AlertCircle, Coffee } from "lucide-react";

import { getAllRooms, getRoom, getProperty } from "@/lib/content";
import { AmenitiesList } from "@/components/AmenitiesList";
import { Gallery } from "@/components/Gallery";
import { BookingWidget } from "@/components/BookingWidget";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  const rooms = await getAllRooms();
  return routing.locales.flatMap((locale) =>
    rooms.map(({ slug }) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getRoom(slug);
  if (!data) return {};
  return {
    title: locale === "el" ? data.nameEl : data.nameEn,
    description: locale === "el" ? data.descriptionEl.slice(0, 160) : data.descriptionEn.slice(0, 160),
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [data, t, tb] = await Promise.all([
    getRoom(slug),
    getTranslations({ locale, namespace: "room" }),
    getTranslations({ locale, namespace: "booking" }),
  ]);

  if (!data) notFound();

  const property = await getProperty(data.propertySlug);
  const name = locale === "el" ? data.nameEl : data.nameEn;
  const description = locale === "el" ? data.descriptionEl : data.descriptionEn;
  const view = locale === "el" ? data.viewEl : data.viewEn;
  const houseRules = locale === "el" ? data.houseRulesEl : data.houseRulesEn;
  const breakfastNote = locale === "el" ? data.breakfastNoteEl : data.breakfastNoteEn;
  const propertyName = property
    ? locale === "el" ? property.nameEl : property.nameEn
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pb-24">
      {/* Back link */}
      {property && (
        <div className="mb-6">
          <Link
            href={`/properties/${data.propertySlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {propertyName}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
        {/* ─── Content column (2/3) ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
            {data.heroImagePath ? (
              <Image
                src={data.heroImagePath}
                alt={name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary" />
            )}
          </div>

          {/* Title + key stats */}
          <RevealOnScroll>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-primary" />
                  {data.beds}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  {data.capacity} {t("capacity")}
                </span>
                {data.size && (
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="h-4 w-4 text-primary" />
                    {data.size} m²
                  </span>
                )}
                {view && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-primary" />
                    {view}
                  </span>
                )}
                {data.floor && (
                  <span className="text-muted-foreground">
                    {t("floor")}: {data.floor}
                  </span>
                )}
              </div>
            </div>
          </RevealOnScroll>

          {/* Description */}
          <RevealOnScroll>
            <p className="text-foreground/80 leading-relaxed text-base md:text-lg">
              {description}
            </p>
          </RevealOnScroll>

          {/* Optional video */}
          {data.videoPath && (
            <RevealOnScroll>
              <div className="rounded-2xl overflow-hidden aspect-video bg-muted">
                <video
                  controls
                  poster={data.videoPosterPath || undefined}
                  className="w-full h-full object-cover"
                  preload="none"
                >
                  <source src={data.videoPath} type="video/mp4" />
                </video>
              </div>
            </RevealOnScroll>
          )}

          {/* Gallery */}
          {data.imagePaths.length > 0 && (
            <RevealOnScroll>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-5">
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
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-5">
                  {t("amenities")}
                </h2>
                <AmenitiesList keys={data.amenityKeys} />
              </div>
            </RevealOnScroll>
          )}

          {/* Breakfast note */}
          {breakfastNote && (
            <RevealOnScroll>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <Coffee className="h-4 w-4 text-primary" />
                  {t("breakfast")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{breakfastNote}</p>
              </div>
            </RevealOnScroll>
          )}

          {/* House rules */}
          {houseRules && (
            <RevealOnScroll>
              <div className="rounded-2xl border border-border bg-muted/40 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  {t("houseRules")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {houseRules}
                </p>
              </div>
            </RevealOnScroll>
          )}
        </div>

        {/* ─── Booking sidebar (1/3) ────────────────────────────── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingWidget
              roomSlug={slug}
              roomName={name}
              priceFrom={data.priceFrom}
              capacity={data.capacity}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
