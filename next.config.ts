import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to serve images from the public directory without
    // a hostname — local paths (/images/...) work out of the box.
    // Add external hostnames here if you reference remote images.
    remotePatterns: [],
    // Warn rather than error on missing placeholder images during development.
    unoptimized: false,
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
