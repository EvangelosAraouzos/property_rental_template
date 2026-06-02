import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 16 renamed Middleware to Proxy (same functionality, new file name).
 * next-intl's request handler runs here to detect the locale and rewrite/
 * redirect to the matching `/[locale]` path.
 */
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API routes, Keystatic admin, Next internals and static files.
  matcher: "/((?!api|keystatic|_next|_vercel|.*\\..*).*)",
};
