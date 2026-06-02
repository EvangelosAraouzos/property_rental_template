import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

import { getPage, zipSections } from "@/lib/content";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPage("syros");
  if (!data) return {};
  return {
    title: locale === "el" ? data.seoTitleEl || data.titleEl : data.seoTitleEn || data.titleEn,
    description: locale === "el" ? data.seoDescriptionEl : data.seoDescriptionEn,
  };
}

export default async function SyrosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [data, t] = await Promise.all([
    getPage("syros"),
    getTranslations({ locale, namespace: "syros" }),
  ]);

  if (!data) notFound();

  const title = locale === "el" ? data.titleEl : data.titleEn;
  const sections = zipSections(
    locale === "el" ? data.sectionHeadingsEl : data.sectionHeadingsEn,
    locale === "el" ? data.sectionBodiesEl : data.sectionBodiesEn
  );

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <div className="relative h-[50vh] md:h-[60vh] min-h-[320px] overflow-hidden">
        {data.heroImagePath ? (
          <Image
            src={data.heroImagePath}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-foreground" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white">{title}</h1>
        </div>
      </div>

      {/* ─── Content ──────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backLink")}
          </Link>
        </div>

        <div className="space-y-12">
          {sections.map((section, i) => (
            <RevealOnScroll key={i} delay={i * 60}>
              <article>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                  {section.heading}
                </h2>
                <div className="prose prose-neutral max-w-none text-foreground/80 leading-relaxed">
                  {section.body.split("\n\n").map((para, j) => (
                    <p key={j} className="mb-4 last:mb-0 text-base md:text-[1.0625rem]">
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </>
  );
}
