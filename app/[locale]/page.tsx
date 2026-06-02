import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { getSettings, getAllProperties, getAllRooms } from "@/lib/content";
import { PropertyCard } from "@/components/PropertyCard";
import { RoomCard } from "@/components/RoomCard";
import { BookingBar } from "@/components/BookingBar";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tb, settings, allProperties, allRooms] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "booking" }),
    getSettings(),
    getAllProperties(),
    getAllRooms(),
  ]);

  const heroTitle = locale === "el" ? settings?.heroTitleEl : settings?.heroTitleEn;
  const heroSubtitle = locale === "el" ? settings?.heroSubtitleEl : settings?.heroSubtitleEn;
  const about = locale === "el" ? settings?.aboutEl : settings?.aboutEn;
  const syrosTeaser = locale === "el" ? settings?.syrosTeaserEl : settings?.syrosTeaserEn;

  const featuredSlugs = settings?.featuredRoomSlugs ?? [];
  const featuredRooms =
    featuredSlugs.length > 0
      ? featuredSlugs
          .map((slug) => allRooms.find((r) => r.slug === slug))
          .filter(Boolean) as typeof allRooms
      : allRooms.filter((r) => r.data.featured).slice(0, 3);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          {settings?.heroVideoPath ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={settings.heroPosterPath || undefined}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={settings.heroVideoPath} type="video/mp4" />
            </video>
          ) : settings?.heroImagePath ? (
            <Image
              src={settings.heroImagePath}
              alt={heroTitle ?? "Onar Syros"}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-foreground" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/25 to-foreground/65" />
        </div>

        {/* Copy */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55 mb-7">
            Ermoupolis · Syros · Greece
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight max-w-4xl mb-6">
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p className="text-base sm:text-lg md:text-xl text-white/75 max-w-xl mb-10 leading-relaxed">
              {heroSubtitle}
            </p>
          )}
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors text-sm shadow-lg"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Booking bar — one scroll away from fold */}
        <div className="relative px-4 sm:px-6 lg:px-8 pb-14">
          <div className="max-w-4xl mx-auto">
            <BookingBar />
          </div>
        </div>
      </section>

      {/* ─── One-line about ───────────────────────────────────────── */}
      {about && (
        <RevealOnScroll>
          <section className="bg-muted border-y border-border py-14 px-4">
            <p className="font-serif text-xl sm:text-2xl text-center text-foreground/75 max-w-3xl mx-auto leading-relaxed italic">
              &ldquo;{about}&rdquo;
            </p>
          </section>
        </RevealOnScroll>
      )}

      {/* ─── Properties ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent mb-3">
              {t("properties")}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              {t("propertiesSubtitle")}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {allProperties.map(({ slug, data }, i) => (
            <RevealOnScroll key={slug} delay={i * 100}>
              <PropertyCard
                slug={slug}
                data={data}
                locale={locale}
                typeLabel={data.type === "luxury" ? t("luxury") : t("rustic")}
                exploreLabel={t("explore")}
              />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ─── Featured Rooms ───────────────────────────────────────── */}
      {featuredRooms.length > 0 && (
        <section className="bg-muted/40 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-12">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent mb-3">
                  {t("rooms")}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                  {t("roomsSubtitle")}
                </h2>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map(({ slug, data }, i) => (
                <RevealOnScroll key={slug} delay={i * 80}>
                  <RoomCard
                    slug={slug}
                    data={data}
                    locale={locale}
                    fromLabel={tb("priceFrom")}
                    nightLabel={tb("night")}
                    viewLabel={t("viewRoom")}
                  />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Syros teaser ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0">
          {settings?.syrosTeaserImagePath ? (
            <Image
              src={settings.syrosTeaserImagePath}
              alt="Syros"
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-foreground" />
          )}
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <RevealOnScroll>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55 mb-5">
              {t("syrosTeaser")}
            </p>
            <p className="font-serif text-2xl md:text-3xl font-medium leading-relaxed mb-10">
              {syrosTeaser}
            </p>
            <Link
              href="/syros"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3 rounded-full hover:bg-white/10 transition-colors text-sm font-medium backdrop-blur-sm"
            >
              {t("syrosCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
