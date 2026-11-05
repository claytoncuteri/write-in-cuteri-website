// Per-page Open Graph + Twitter Card metadata.
//
// Why a helper: Next merges metadata shallowly, so a page that sets
// `openGraph` replaces the root layout's whole openGraph object
// (siteName, locale and type included). Every page goes through
// pageMetadata() so each one gets the full tag set, its own canonical
// URL and its own share image.
//
// Share images are static 1200x630 PNGs in public/og/, built from
// scripts/og/ with `npm run make:og`. Keep og:title <= 60 chars and
// og:description 70-155 chars, and only promise what the page delivers.

import type { Metadata } from "next";

export const SITE_URL = "https://writeincuteri.com";
export const SITE_NAME =
  "Clayton Cuteri for U.S. House of Representatives, District 1 (SC)";
export const X_HANDLE = "@ClaytonCuteri";

export type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt: string;
  type?: string;
};

// The Write-In Cuteri wordmark on navy, from the logo pack. Used by
// pages without their own card (legal pages, /card, admin, 404).
export const DEFAULT_OG_IMAGE: OgImage = {
  url: "/logo_a_star_divider/digital_og_image/navy.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Write In Cuteri: Clayton Cuteri for U.S. House of Representatives, District 1, South Carolina",
};

/** A card from public/og/<slug>.png (all 1200x630 PNG). */
export function ogCard(slug: string, alt: string): OgImage {
  return {
    url: `/og/${slug}.png`,
    width: 1200,
    height: 630,
    type: "image/png",
    alt,
  };
}

/** Section card for /blog, category pages, and posts without an image. */
export const BLOG_OG_IMAGE: OgImage = ogCard(
  "blog",
  "The ACP eagle with the headline The Campaign Blog",
);

/** Absolute canonical URL. The site runs with trailingSlash: true. */
export function canonicalUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `${SITE_URL}${withSlash.startsWith("/") ? "" : "/"}${withSlash}`;
}

export function pageMetadata(opts: {
  /** Route path, e.g. "/about". Becomes og:url and the canonical link. */
  path: string;
  /** The <title> (passed through the root title template). */
  title: Metadata["title"];
  /** <meta name="description">. Defaults to ogDescription. */
  description?: string;
  ogTitle: string;
  ogDescription: string;
  image?: OgImage;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: Metadata["keywords"];
}): Metadata {
  const url = canonicalUrl(opts.path);
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const og = {
    siteName: SITE_NAME,
    locale: "en_US",
    url,
    title: opts.ogTitle,
    description: opts.ogDescription,
    images: [image],
  };
  return {
    title: opts.title,
    description: opts.description ?? opts.ogDescription,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    alternates: { canonical: url },
    openGraph:
      opts.type === "article"
        ? {
            ...og,
            type: "article",
            publishedTime: opts.publishedTime,
            modifiedTime: opts.modifiedTime,
            authors: opts.authors,
          }
        : { ...og, type: "website" },
    twitter: {
      card: "summary_large_image",
      site: X_HANDLE,
      creator: X_HANDLE,
      title: opts.ogTitle,
      description: opts.ogDescription,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
