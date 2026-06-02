"use client";

import { useState } from "react";

/**
 * Minimal owner admin. Intentionally lightweight: the owner pastes their
 * ADMIN_TOKEN (kept only in this component's memory, sent as a Bearer header) to
 *   • run the iCal import on demand ("Sync now"),
 *   • review pending requests and confirm / decline them,
 *   • copy each room's public .ics export URL for Booking.com / Airbnb.
 *
 * This is deliberately not a full auth system — for a boutique single-owner site
 * a shared token over HTTPS is enough. Swap for real auth if requirements grow.
 */

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  guests_count: number;
  message: string | null;
  status: string;
}

interface RoomRow {
  slug: string;
  exportToken: string;
}

export function AdminDashboard({ siteUrl }: { siteUrl: string }) {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const auth = { Authorization: `Bearer ${token}` };

  async function loadAll() {
    setBusy(true);
    setNote(null);
    try {
      const [resR, roomsR] = await Promise.all([
        fetch("/api/admin/reservations", { headers: auth }),
        fetch("/api/admin/rooms", { headers: auth }),
      ]);
      if (resR.status === 401 || roomsR.status === 401) {
        setNote("Unauthorized — check the admin token.");
        setAuthed(false);
        return;
      }
      const resData = (await resR.json()) as { reservations: Reservation[] };
      const roomsData = (await roomsR.json()) as { rooms: RoomRow[] };
      setReservations(resData.reservations ?? []);
      setRooms(roomsData.rooms ?? []);
      setAuthed(true);
    } catch {
      setNote("Could not load admin data.");
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    setBusy(true);
    setNote(null);
    try {
      const r = await fetch("/api/admin/ical-import", { method: "POST", headers: auth });
      const d = await r.json();
      setNote(r.ok ? `Sync complete: ${JSON.stringify(d.results ?? d)}` : "Sync failed.");
    } catch {
      setNote("Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: "confirmed" | "declined") {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (r.ok) {
        setReservations((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      } else {
        setNote("Update failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm space-y-3">
        <p className="text-sm text-muted-foreground">Enter the admin token to continue.</p>
        <input
          type="password"
          className={fieldClass}
          value={token}
          placeholder="ADMIN_TOKEN"
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          type="button"
          onClick={loadAll}
          disabled={busy || token.length === 0}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Loading…" : "Sign in"}
        </button>
        {note && <p className="text-sm text-destructive">{note}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={syncNow}
          disabled={busy}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Working…" : "Sync channels now"}
        </button>
        <button
          type="button"
          onClick={loadAll}
          disabled={busy}
          className="rounded-md border px-4 py-2 text-sm text-foreground disabled:opacity-60"
        >
          Refresh
        </button>
        {note && <span className="text-sm text-muted-foreground">{note}</span>}
      </div>

      <section>
        <h2 className="mb-3 font-serif text-xl text-foreground">Reservations</h2>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reservations yet.</p>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="rounded-lg border bg-card p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {r.guest_name} · {r.check_in} → {r.check_out} · {r.guests_count} guest(s)
                  </span>
                  <span
                    className={
                      r.status === "confirmed"
                        ? "text-primary"
                        : r.status === "declined"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }
                  >
                    {r.status}
                  </span>
                </div>
                <div className="mt-1 text-muted-foreground">
                  {r.guest_email}
                  {r.guest_phone ? ` · ${r.guest_phone}` : ""}
                </div>
                {r.message && <p className="mt-2 text-foreground">{r.message}</p>}
                {r.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, "confirmed")}
                      disabled={busy}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, "declined")}
                      disabled={busy}
                      className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl text-foreground">iCal export URLs</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Paste each room&apos;s URL into Booking.com &amp; Airbnb so they block these dates too.
        </p>
        <ul className="space-y-2">
          {rooms.map((r) => {
            const url = `${siteUrl}/api/ical/${r.exportToken}`;
            return (
              <li key={r.slug} className="rounded-lg border bg-card p-3 text-sm">
                <div className="font-medium text-foreground">{r.slug}</div>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {url}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(url)}
                    className="shrink-0 rounded-md border px-2 py-1 text-xs text-foreground"
                  >
                    Copy
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
