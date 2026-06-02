import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Bed, Users, Maximize2, ArrowRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoomData } from "@/lib/content";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  slug: string;
  data: RoomData;
  locale: string;
  fromLabel: string;
  nightLabel: string;
  viewLabel: string;
}

export function RoomCard({ slug, data, locale, fromLabel, nightLabel, viewLabel }: RoomCardProps) {
  const name = locale === "el" ? data.nameEl : data.nameEn;
  const view = locale === "el" ? data.viewEl : data.viewEn;

  return (
    <Link
      href={`/rooms/${slug}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {data.heroImagePath ? (
          <Image
            src={data.heroImagePath}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
        {view && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="muted" className="text-xs gap-1 bg-black/40 text-white border-0">
              <Eye className="h-3 w-3" />
              {view}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">{name}</h3>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            {data.beds}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {data.capacity}
          </span>
          {data.size && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {data.size} m²
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">{fromLabel} </span>
            <span className="text-lg font-semibold text-foreground">€{data.priceFrom}</span>
            <span className="text-xs text-muted-foreground"> /{nightLabel}</span>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            {viewLabel}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
