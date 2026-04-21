import type { MetadataRoute } from "next";

// Dynamic sitemap. Next.js App Router serves this at /sitemap.xml at
// build time. Prefer this over a static public/sitemap.xml so lastmod
// updates on every deploy and new routes don't get forgotten.
//
// Priority guide:
//   1.0  homepage
//   0.9  write-in (the core conversion page for a write-in campaign)
//   0.8  problems, policies (primary content pillars)
//   0.7  about, get-involved, endorsements, events, press
//   0.6  donate (high-intent but transactional, gated by FEC status)
//   0.3  privacy, accessibility (required but not marketing)

const BASE_URL = "https://writeincuteri.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // All route paths are kept here in a single list so adding a new page
  // is a one-line edit. The lastModified default (now) is fine for a
  // site that rebuilds on every deploy; per-route overrides go below.
  const now = new Date();

  const routes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/write-in", changeFrequency: "monthly", priority: 0.9 },
    { path: "/problems", changeFrequency: "monthly", priority: 0.8 },
    { path: "/policies", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/get-involved", changeFrequency: "monthly", priority: 0.7 },
    { path: "/endorsements", changeFrequency: "monthly", priority: 0.7 },
    { path: "/events", changeFrequency: "weekly", priority: 0.7 },
    { path: "/press", changeFrequency: "weekly", priority: 0.7 },
    { path: "/donate", changeFrequency: "monthly", priority: 0.6 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
