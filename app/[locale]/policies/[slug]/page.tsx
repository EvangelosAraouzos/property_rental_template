import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

import { getAllPolicies, getPolicy, zipSections } from "@/lib/content";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  const policies = await getAllPolicies();
  return routing.locales.flatMap((locale) =>
    policies.map(({ slug }) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getPolicy(slug);
  if (!data) return {};
  return { title: locale === "el" ? data.titleEl : data.titleEn };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [data, t, allPolicies] = await Promise.all([
    getPolicy(slug),
    getTranslations({ locale, namespace: "policies" }),
    getAllPolicies(),
  ]);

  if (!data) notFound();

  const title = locale === "el" ? data.titleEl : data.titleEn;
  const sections = zipSections(
    locale === "el" ? data.sectionHeadingsEl : data.sectionHeadingsEn,
    locale === "el" ? data.sectionBodiesEl : data.sectionBodiesEn
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pb-24">
      {/* Back breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <span>{t("backLink")}</span>
        <span>/</span>
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* Sibling policy links */}
      {allPolicies.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {allPolicies.map(({ slug: pSlug, data: pData }) => {
            const pTitle = locale === "el" ? pData.titleEl : pData.titleEn;
            const isActive = pSlug === slug;
            return (
              <Link
                key={pSlug}
                href={`/policies/${pSlug}`}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {pTitle}
              </Link>
            );
          })}
        </div>
      )}

      {/* Title */}
      <RevealOnScroll>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-3">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          {t("lastUpdated")}: {new Date().getFullYear()}
        </p>
      </RevealOnScroll>

      {/* Table of contents */}
      {sections.length > 2 && (
        <RevealOnScroll>
          <nav className="mb-12 p-5 rounded-2xl bg-muted border border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Contents
            </p>
            <ol className="space-y-1.5">
              {sections.map((s, i) => (
                <li key={i}>
                  <a
                    href={`#section-${i}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </RevealOnScroll>
      )}

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section, i) => (
          <RevealOnScroll key={i} delay={i * 50}>
            <article id={`section-${i}`}>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                {section.heading}
              </h2>
              <p className="text-foreground/80 leading-relaxed text-base whitespace-pre-line">
                {section.body}
              </p>
            </article>
          </RevealOnScroll>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-14 pt-8 border-t border-border">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
