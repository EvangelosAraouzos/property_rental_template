import Image from "next/image";
import { Users, Maximize2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

interface CardImage {
  src: string;
  alt: string;
  blurDataURL?: string;
}

interface RoomCardProps {
  image: CardImage;
  name: string;
  capacity: number;
  /** Floor area in m². */
  size?: number;
  amenities?: string[];
  price: number;
  /** Currency symbol, e.g. "€". */
  currency?: string;
  href: string;
  /* Translated labels — pass from a parent server component via getTranslations */
  fromLabel?: string;
  perNightLabel?: string;
  guestsLabel?: string;
  sqmLabel?: string;
  ctaLabel?: string;
  className?: string;
}

export default function RoomCard({
  image,
  name,
  capacity,
  size,
  amenities,
  price,
  currency = "€",
  href,
  fromLabel = "From",
  perNightLabel = "/ night",
  guestsLabel,
  sqmLabel,
  ctaLabel = "View Room",
  className,
}: RoomCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col sm:flex-row overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] sm:aspect-auto sm:w-60 lg:w-72 flex-shrink-0 overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 640px) 288px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={image.blurDataURL ?? BLUR_PLACEHOLDER}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-card-foreground mb-3">{name}</h3>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden="true" />
            {guestsLabel ?? `${capacity} guests`}
          </span>
          {size != null && (
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
              {sqmLabel ?? `${size} m²`}
            </span>
          )}
        </div>

        {amenities && amenities.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mb-4" aria-label="Amenities">
            {amenities.map((a) => (
              <li
                key={a}
                className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
              >
                {a}
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
          <p>
            <span className="text-xs text-muted-foreground">{fromLabel} </span>
            <span className="text-2xl font-semibold text-foreground">
              {currency}
              {price}
            </span>
            <span className="text-xs text-muted-foreground"> {perNightLabel}</span>
          </p>
          <Link
            href={href}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
