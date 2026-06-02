import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Coffee, Wifi, Wind, Sun, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PropertyData } from "@/lib/content";
import { cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  breakfast: Coffee,
  wifi: Wifi,
  ac: Wind,
  terrace: Sun,
};

interface PropertyCardProps {
  slug: string;
  data: PropertyData;
  locale: string;
  typeLabel: string;
  exploreLabel: string;
}

export function PropertyCard({ slug, data, locale, typeLabel, exploreLabel }: PropertyCardProps) {
  const name = locale === "el" ? data.nameEl : data.nameEn;
  const tagline = locale === "el" ? data.taglineEl : data.taglineEn;
  const highlights = locale === "el" ? data.highlightsEl : data.highlightsEn;

  const isLuxury = data.type === "luxury";

  return (
    <Link
      href={`/properties/${slug}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {data.heroImagePath ? (
          <Image
            src={data.heroImagePath}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0",
              isLuxury
                ? "bg-gradient-to-br from-primary/20 via-primary/10 to-secondary"
                : "bg-gradient-to-br from-accent/20 via-accent/10 to-secondary"
            )}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant={isLuxury ? "default" : "accent"} className="text-xs">
            {typeLabel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3 shrink-0" />
          {data.address}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">{tagline}</p>

        {/* Highlights */}
        <ul className="space-y-1.5 mb-5">
          {highlights.slice(0, 3).map((h, i) => {
            const key = data.amenityKeys[i];
            const Icon = key ? AMENITY_ICONS[key] : null;
            return (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                {Icon ? (
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                )}
                {h}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
          {exploreLabel}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
