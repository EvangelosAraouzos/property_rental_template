import Image from "next/image";
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

interface PropertyCardProps {
  image: CardImage;
  title: string;
  subtitle?: string;
  description?: string;
  amenities?: string[];
  href: string;
  badge?: string;
  ctaLabel?: string;
  className?: string;
}

export default function PropertyCard({
  image,
  title,
  subtitle,
  description,
  amenities,
  href,
  badge,
  ctaLabel = "Learn More",
  className,
}: PropertyCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={image.blurDataURL ?? BLUR_PLACEHOLDER}
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {subtitle && (
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            {subtitle}
          </p>
        )}
        <h3 className="text-card-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
            {description}
          </p>
        )}
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
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-auto self-start"
          )}
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
