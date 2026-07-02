import type { MetadataRoute } from "next";
import { listAllPublishedSlugs } from "@/lib/db";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";

// Dynamic sitemap. Next.js App Router serves this at /sitemap.xml at
// build time. Prefer this over a static public/sitemap.xml so lastmod
// updates on every deploy and new routes don't get forgotten.
//
// Priority guide:
//   1.0  homepage
//   0.9  write-in (the core conversion page for a write-in campaign)
//   0.8  problems, policies, blog index (primary content pillars)
//   0.7  blog post, about, get-involved, endorsements, events, press
//   0.6  donate (high-intent but transactional, gated by FEC status)
//   0.5  category pages, /card (utility/secondary surfaces)
//   0.3  privacy, accessibility (required but not marketing)

const BASE_URL = "https://writeincuteri.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/write-in", changeFrequency: "monthly", priority: 0.9 },
    { path: "/problems", changeFrequency: "monthly", priority: 0.8 },
    { path: "/policies", changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", changeFrequency: "daily", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/get-involved", changeFrequency: "monthly", priority: 0.7 },
    { path: "/endorsements", changeFrequency: "monthly", priority: 0.7 },
    { path: "/events", changeFrequency: "weekly", priority: 0.7 },
    { path: "/press", changeFrequency: "weekly", priority: 0.7 },
    { path: "/donate", changeFrequency: "monthly", priority: 0.6 },
    { path: "/card", changeFrequency: "yearly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
  ];

  const staticEntries = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Category landing pages. Fixed set; one entry per canonical category.
  const categoryEntries = BLOG_CATEGORIES.map((c) => ({
    url: `${BASE_URL}/blog/category/${c}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Per-post entries. Falls back to an empty list if Postgres is
  // unreachable at build time (sitemap regenerates on the next deploy).
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const slugs = await listAllPublishedSlugs();
    postEntries = slugs.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] could not load blog slugs", err);
  }

  return [...staticEntries, ...categoryEntries, ...postEntries];
}
