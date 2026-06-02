"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { label: t("properties"), href: "/properties" },
    { label: t("syros"), href: "/syros" },
    { label: t("contact"), href: "/contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative h-8 w-8">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            <span
              className={cn(
                "font-serif font-semibold text-lg leading-none transition-colors",
                scrolled ? "text-foreground" : "text-white"
              )}
            >
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  scrolled ? "text-foreground" : "text-white/90"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher
              className={cn(
                "hidden md:flex transition-colors",
                scrolled ? "" : "[&_a]:text-white/80 [&_a]:hover:text-white [&_span]:text-white/40"
              )}
            />
            <Link
              href="/contact"
              className={cn(
                "hidden md:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                scrolled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white/15 border border-white/30 text-white hover:bg-white/25 backdrop-blur-sm"
              )}
            >
              {t("book")}
            </Link>
            <MobileMenu items={navItems} bookLabel={t("book")} />
          </div>
        </div>
      </div>
    </header>
  );
}
