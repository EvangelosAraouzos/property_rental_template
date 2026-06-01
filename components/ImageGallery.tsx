"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export interface GalleryImage {
  src: string;
  alt: string;
  blurDataURL?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  /** Accessible labels (pass translated strings from a parent server component). */
  labels?: {
    close?: string;
    prev?: string;
    next?: string;
    open?: (alt: string) => string;
  };
  className?: string;
}

const colClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

const sizesFor: Record<number, string> = {
  2: "(min-width: 640px) 50vw, 100vw",
  3: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  4: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
};

export default function ImageGallery({
  images,
  columns = 3,
  labels,
  className,
}: ImageGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const isOpen  = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const prev  = useCallback(() => setIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)), [images.length]);
  const next  = useCallback(() => setIndex((i) => (i !== null ? (i + 1) % images.length              : null)), [images.length]);

  /* Keyboard navigation */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, prev, next]);

  /* Lock body scroll while lightbox is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Grid */}
      <div className={cn("grid gap-2", colClasses[columns], className)}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={labels?.open ? labels.open(img.alt) : `Open: ${img.alt}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={sizesFor[columns]}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={img.blurDataURL ?? BLUR_PLACEHOLDER}
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && index !== null && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduced ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/92 backdrop-blur-sm"
            onClick={close}
          >
            {/* Image */}
            <motion.div
              key={index}
              initial={reduced ? undefined : { scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? undefined : { scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[index].src}
                alt={images[index].alt}
                width={1400}
                height={933}
                className="max-h-[85vh] max-w-[88vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
                priority
                placeholder="blur"
                blurDataURL={images[index].blurDataURL ?? BLUR_PLACEHOLDER}
              />
            </motion.div>

            {/* Close */}
            <button
              onClick={close}
              aria-label={labels?.close ?? "Close gallery"}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-background/10 text-background hover:bg-background/20 transition-colors backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label={labels?.prev ?? "Previous image"}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/10 text-background hover:bg-background/20 transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label={labels?.next ?? "Next image"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/10 text-background hover:bg-background/20 transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Counter */}
            <div
              className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-background/60 tabular-nums"
              aria-live="polite"
            >
              {index + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
