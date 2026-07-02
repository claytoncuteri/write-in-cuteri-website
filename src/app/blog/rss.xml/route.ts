// GET /blog/rss.xml -- RSS 2.0 feed of every published post, newest
// first. Returns application/rss+xml so feed readers (NetNewsWire,
// Feedly, Inoreader) pick it up. Re-validated every 10 minutes since
// posts trickle in, not flood.
//
// Each item carries the post title, link, GUID (same as link), publish
// date, category, excerpt as description, and the (sanitized) body
// HTML inside <content:encoded>. The xmlEscape helper covers the
// five XML-reserved characters; everything inside <![CDATA[...]]>
// passes through unchanged.

import { NextResponse } from "next/server";
import { listPublishedPosts } from "@/lib/db";
import { sanitizeBlogHtml, stripHtml } from "@/lib/blog-sanitize";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes
export const runtime = "nodejs";

const SITE = "https://writeincuteri.com";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  // Defend against an accidental "]]>" inside content closing the
  // CDATA block early.
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const { posts } = await listPublishedPosts({ page: 1, pageSize: 50 });
  const buildDate = new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${SITE}/blog/${p.slug}`;
      const pubDate = new Date(p.publishDate ?? p.createdAt).toUTCString();
      const description = stripHtml(p.excerpt || p.bodyHtml).slice(0, 600);
      const content = sanitizeBlogHtml(p.bodyHtml ?? "");
      return `
    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${p.category ? `<category>${xmlEscape(p.category)}</category>` : ""}
      <description>${cdata(description)}</description>
      <content:encoded>${cdata(content)}</content:encoded>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Clayton Cuteri for Congress -- Campaign Blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Lowcountry stories, national platform updates, and campaign news from Clayton Cuteri's write-in run for U.S. House of Representatives, District 1, South Carolina.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <copyright>Paid for by Cuteri for Americans (FEC ID C00947259)</copyright>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
