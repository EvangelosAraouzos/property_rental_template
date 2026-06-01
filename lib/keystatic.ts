import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";

/**
 * Server-side Keystatic reader. Import this in Server Components and Route
 * Handlers to query CMS content from the local YAML/MDX files.
 *
 * Usage:
 *   const reader = getReader()
 *   const properties = await reader.collections.properties.all()
 *   const settings  = await reader.singletons.settings.read()
 */
export function getReader() {
  return createReader(process.cwd(), keystaticConfig);
}
