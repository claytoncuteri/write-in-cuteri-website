import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 requires explicit quality allowlist. 75 is the default; 85 is
    // used for photos of Clayton where crispness matters for trust.
    qualities: [75, 85],
  },
  trailingSlash: true,
  allowedDevOrigins: [
    "*.replit.dev",
    "*.kirk.replit.dev",
    "*.repl.co",
  ],
  // Reverse-proxy PostHog through our own domain so ad-blockers (uBlock,
  // Brave Shields, Firefox strict) do not kill analytics. This is the
  // officially supported approach documented by PostHog. The "skipTrailingSlashRedirect"
  // dance on /ingest/* prevents Next from 308-redirecting the PostHog XHR.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  // 301-redirect old /images/* download paths to the new /downloads/*
  // home. Reason: printed wallet cards, social posts, and any cached
  // crawler links from before the April folder reorg still point at
  // the old paths; without these redirects those URLs would 404.
  // permanent: true emits a 308 (Next's choice for permanent
  // redirects), which preserves the request method and is correct for
  // a static-asset move.
  async redirects() {
    return [
      {
        source: "/images/cuteri-wallet-card.pdf",
        destination: "/downloads/cuteri-wallet-card.pdf",
        permanent: true,
      },
      {
        source: "/images/cuteri-one-pager.pdf",
        destination: "/downloads/cuteri-one-pager.pdf",
        permanent: true,
      },
      {
        source: "/images/cuteri-volunteer-kit.zip",
        destination: "/downloads/cuteri-volunteer-kit.zip",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
