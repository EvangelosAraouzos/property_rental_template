import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import Section from "@/components/Section";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      {/* Hero placeholder — replace with real hero section */}
      <Section
        className="min-h-[80vh] flex items-center bg-secondary/25"
        containerClassName="flex flex-col items-center justify-center text-center"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          {siteConfig.tagline}
        </p>
        <h1 className="mb-6 max-w-2xl">{siteConfig.name}</h1>
        <p className="max-w-lg text-muted-foreground mb-10">{t("scaffoldNotice")}</p>
        <Link
          href="/contact#booking"
          className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
        >
          {t("cta")}
        </Link>
      </Section>
    </>
  );
}
