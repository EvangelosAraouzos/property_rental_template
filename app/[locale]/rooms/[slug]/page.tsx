import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { getRooms } from "@/content/rooms";
import { roomSummary, roomSummaries } from "@/lib/booking/room-view";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/config/site";
import { BookingWidget } from "@/components/booking/BookingWidget";

/** Pre-render every room in every locale. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getRooms().map((room) => ({ locale, slug: room.slug })),
  );
}

/**
 * Room detail page. The booking widget is locked to this room — guests pick
 * dates (unavailable nights disabled) and send a request without leaving the
 * page: a 1–2-click reservation straight from the room.
 */
export default async function RoomPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const room = roomSummary(slug, locale as Locale);
  if (!room) notFound();

  const t = await getTranslations("home");
  const tr = await getTranslations("booking");
  const allRooms = roomSummaries(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm text-muted-foreground underline underline-offset-2"
      >
        ← {t("backHome")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={room.image}
              alt={room.name}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </div>
          <h1 className="mt-6 font-serif text-3xl text-foreground">{room.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("priceFrom", { price: formatPrice(room.pricePerNight, locale) })} ·{" "}
            {tr("search.guestsCount", { count: room.maxGuests })}
          </p>
          <p className="mt-4 max-w-prose text-foreground">{room.description}</p>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-xl border bg-card/60 p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 font-serif text-xl text-foreground">{tr("room.bookHeading")}</h2>
            <BookingWidget rooms={allRooms} room={room} />
          </div>
        </aside>
      </div>
    </main>
  );
}
