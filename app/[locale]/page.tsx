import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { siteConfig, type Locale } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { roomSummaries } from "@/lib/booking/room-view";
import { formatPrice } from "@/lib/format";
import { BookingWidget } from "@/components/booking/BookingWidget";

/**
 * Home page. Leads straight into the booking flow (dates + guests → available
 * rooms → request) so reserving is 1–2 clicks from the landing page, and lists
 * the rooms as entry points to their own booking widgets.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const rooms = roomSummaries(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-16">
      <section className="text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {siteConfig.tagline}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium text-foreground sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-muted-foreground">{t("intro")}</p>
      </section>

      {/* Booking entry point — the whole point of the page. */}
      <section className="mx-auto mt-10 max-w-2xl">
        <div className="rounded-xl border bg-card/60 p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 font-serif text-xl text-foreground">{t("bookingHeading")}</h2>
          <BookingWidget rooms={rooms} />
        </div>
      </section>

      {/* Rooms grid → each links to its own detail + booking widget. */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl text-foreground">{t("roomsHeading")}</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <li key={room.slug}>
              <Link
                href={`/rooms/${room.slug}`}
                className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-muted">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg text-foreground">{room.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {room.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {t("priceFrom", { price: formatPrice(room.pricePerNight, locale) })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
