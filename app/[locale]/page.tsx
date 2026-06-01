import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";

/**
 * Placeholder home page. Pages are intentionally NOT built yet — this only
 * confirms the scaffold (i18n + branding tokens + config) renders end to end.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Scaffold />;
}

function Scaffold() {
  const t = useTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        {siteConfig.tagline}
      </p>
      <h1 className="font-serif text-4xl font-medium text-foreground sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-prose text-muted-foreground">{t("scaffoldNotice")}</p>
      <span className="mt-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        {t("cta")}
      </span>
    </main>
  );
}
