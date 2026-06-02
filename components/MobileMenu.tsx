"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  items: NavItem[];
  bookLabel: string;
}

export function MobileMenu({ items, bookLabel }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="p-2 rounded-md text-foreground hover:bg-muted transition-colors md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-background shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-serif text-lg font-semibold text-foreground">Menu</span>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-5 py-6 flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-3 rounded-lg text-foreground hover:bg-muted font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="block w-full text-center bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors"
          >
            {bookLabel}
          </Link>
          <div className="mt-4 flex justify-center">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
