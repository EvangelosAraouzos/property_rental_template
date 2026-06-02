import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Boutique sites run on free hosting; skip the image optimizer so room
    // photos (and the SVG placeholders shipped with the template) are served
    // directly. Drop this once you want optimization + a configured loader.
    unoptimized: true,
  },
};

// Wires next-intl into the build and points it at the request config.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
