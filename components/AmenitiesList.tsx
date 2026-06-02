import {
  Wifi,
  Wind,
  Coffee,
  Waves,
  Sun,
  Car,
  Tv,
  Shield,
  BathIcon,
  Utensils,
  Package,
  BookOpen,
  Headphones,
  Eye,
  Droplets,
} from "lucide-react";
import { useTranslations } from "next-intl";

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  wifi: Wifi,
  ac: Wind,
  breakfast: Coffee,
  pool: Waves,
  terrace: Sun,
  parking: Car,
  tv: Tv,
  safe: Shield,
  bathtub: BathIcon,
  shower: Droplets,
  kitchenette: Utensils,
  minibar: Package,
  library: BookOpen,
  concierge: Headphones,
  "sea-view": Eye,
  hairdryer: Wind,
  balcony: Sun,
};

interface AmenitiesListProps {
  keys: string[];
  columns?: 2 | 3 | 4;
}

export function AmenitiesList({ keys, columns = 3 }: AmenitiesListProps) {
  const t = useTranslations("amenities");
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <ul className={`grid ${colClass} gap-3`}>
      {keys.map((key) => {
        const Icon = ICONS[key] ?? Sun;
        return (
          <li key={key} className="flex items-center gap-3 text-sm text-foreground">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span>{t(key as Parameters<typeof t>[0])}</span>
          </li>
        );
      })}
    </ul>
  );
}
