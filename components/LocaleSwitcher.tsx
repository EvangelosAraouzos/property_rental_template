"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className={cn("flex items-center gap-1 text-sm font-medium", className)}>
      <Link
        href={pathname}
        locale="en"
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors",
          locale === "en"
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </Link>
      <span className="text-border select-none">|</span>
      <Link
        href={pathname}
        locale="el"
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors",
          locale === "el"
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        ΕΛ
      </Link>
    </div>
  );
}
