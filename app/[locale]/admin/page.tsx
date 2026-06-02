import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { AdminDashboard } from "@/components/booking/AdminDashboard";

// Owner-only tooling — keep it out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Owner admin page: confirm/decline requests, run channel sync on demand, and
 * grab the per-room iCal export URLs. Access is gated client-side by the
 * ADMIN_TOKEN (the data routes enforce it server-side regardless).
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-6 font-serif text-2xl text-foreground">Admin</h1>
      <AdminDashboard siteUrl={siteUrl} />
    </main>
  );
}
