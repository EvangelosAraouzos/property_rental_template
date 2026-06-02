import "server-only";

import type { NextRequest } from "next/server";

/**
 * Tiny bearer-token guard for the cron + admin endpoints. The scheduler / admin
 * sends `Authorization: Bearer <secret>`; we compare in constant time against
 * the configured secret. Vercel Cron automatically sends `CRON_SECRET` this way.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/** Extract a `Bearer` token from the Authorization header, if present. */
export function bearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/** True if the request carries the bearer token matching `process.env[envKey]`. */
export function isAuthorized(request: NextRequest, envKey: "CRON_SECRET" | "ADMIN_TOKEN"): boolean {
  const expected = process.env[envKey];
  if (!expected) return false; // unset secret = locked, never open
  const provided = bearerToken(request);
  return provided !== null && timingSafeEqual(provided, expected);
}
