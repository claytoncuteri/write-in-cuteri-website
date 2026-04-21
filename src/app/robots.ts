import type { MetadataRoute } from "next";

// Dynamic robots.txt. Kept in App Router (not public/robots.txt) so
// the Sitemap URL stays in sync with the sitemap route and any future
// environment-aware rules (staging disallow-all, etc.) can be added
// without touching a static file.
//
// Explicit allow-list for AI crawlers is intentional: small campaign,
// maximum discovery beats gatekeeping. If we ever decide to disallow
// a specific AI scraper, add it to disallowedUserAgents below.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // AI / LLM crawlers. Called out by name so owners see an explicit
      // allow rather than relying on the wildcard above.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
    ],
    sitemap: "https://writeincuteri.com/sitemap.xml",
    host: "https://writeincuteri.com",
  };
}
