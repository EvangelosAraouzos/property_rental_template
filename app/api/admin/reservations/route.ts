import { NextResponse, type NextRequest } from "next/server";

import { isAuthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Admin reservations API (guarded by `Authorization: Bearer <ADMIN_TOKEN>`).
 * This is the ONLY way guest details are read — never by the public anon role.
 *
 *   GET   /api/admin/reservations           -> list (most recent first)
 *   PATCH /api/admin/reservations           -> { id, status: confirmed|declined }
 *
 * Confirming keeps the website hold (so it exports to the other channels).
 * Declining frees the held nights by removing this reservation's hold rows.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request, "ADMIN_TOKEN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  let query = supabaseAdmin()
    .from("reservations")
    .select(
      "id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, message, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[admin/reservations] list error:", error);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
  }
  return NextResponse.json({ reservations: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request, "ADMIN_TOKEN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { id, status } = body;
  if (!id || (status !== "confirmed" && status !== "declined")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { error: updErr } = await admin
    .from("reservations")
    .update({ status })
    .eq("id", id);
  if (updErr) {
    console.error("[admin/reservations] update error:", updErr);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  // Declined -> release the tentatively held nights for this reservation.
  if (status === "declined") {
    const { error: delErr } = await admin
      .from("availability")
      .delete()
      .eq("reservation_id", id);
    if (delErr) {
      console.error("[admin/reservations] release error:", delErr);
      return NextResponse.json({ error: "release_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, id, status });
}
