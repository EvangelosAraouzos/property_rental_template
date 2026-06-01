import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";

/**
 * Low-level Keystatic reader factory. Prefer the typed helpers in
 * `@/lib/content` for page-level data fetching.
 *
 * Use this directly when you need raw access to collection/singleton APIs
 * not wrapped by content.ts.
 */
export function getReader() {
  return createReader(process.cwd(), keystaticConfig);
}
