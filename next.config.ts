import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
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
};

export default nextConfig;
