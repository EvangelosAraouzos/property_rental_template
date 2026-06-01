"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/rooms",    key: "rooms"    },
  { href: "/location", key: "location" },
  { href: "/about",    key: "about"    },
  { href: "/contact",  key: "contact"  },
] as const;

export default function Header() {
  const t      = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close drawer on navigation */
  useEffect(() => { setOpen(false); }, [pathname]);

  const otherLocale = locale === "en" ? "el" : "en";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-background"
        )}
      >
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={120}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-7 text-sm font-medium">
            {NAV_LINKS.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-foreground/75 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right controls */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={pathname}
              locale={otherLocale}
              className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              {otherLocale}
            </Link>
            <Link
              href="/contact#booking"
              className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
            >
              {t("bookNow")}
            </Link>
          </div>

          {/* Mobile right controls */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/contact#booking"
              className={cn(buttonVariants({ variant: "primary", size: "sm" }), "text-xs h-9 px-4")}
            >
              {t("bookNow")}
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label={t("menu")}
              aria-expanded={open}
              className="p-2 rounded-lg text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] flex-col bg-background shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <Link href="/" onClick={() => setOpen(false)}>
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={100}
                    height={32}
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t("closeMenu")}
                  className="p-2 rounded-lg text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-6 py-4">
                <ul>
                  {NAV_LINKS.map(({ href, key }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center py-4 text-lg font-medium text-foreground border-b border-border/50 last:border-none hover:text-primary transition-colors"
                      >
                        {t(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Drawer footer */}
              <div className="border-t border-border px-6 py-6 space-y-4">
                {/* Language toggle */}
                <div className="flex items-center gap-3 text-sm font-semibold tracking-widest uppercase">
                  <span className="text-foreground">{locale}</span>
                  <div className="h-3.5 w-px bg-border" />
                  <Link
                    href={pathname}
                    locale={otherLocale}
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {otherLocale}
                  </Link>
                </div>

                {/* CTA */}
                <Link
                  href="/contact#booking"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full")}
                >
                  {t("bookNow")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
