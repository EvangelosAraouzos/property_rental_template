import { NextResponse, type NextRequest } from "next/server";

import { isAuthorized } from "@/lib/auth";
import { runICalImport } from "@/lib/ical/import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/ical-import   (on-demand)
 *
 * Same import as the cron, triggered manually from the admin ("Sync now").
 * Guarded by `Authorization: Bearer <ADMIN_TOKEN>`.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request, "ADMIN_TOKEN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runICalImport();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[admin/ical-import] error:", err);
    return NextResponse.json({ error: "import_failed" }, { status: 500 });
  }
}
