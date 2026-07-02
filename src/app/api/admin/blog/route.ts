// GET  /api/admin/blog       list ALL posts (drafts + published)
// POST /api/admin/blog       create a new post
//
// Both gated by the existing /admin session cookie. Writes flow
// through the same sanitization (blog-sanitize.ts) and reading-time
// (reading-time.ts) helpers that PATCH uses, so a created post is
// indistinguishable from one created then updated.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  listAllPostsAdmin,
  putBlogPost,
  type BlogPostInput,
  type BlogStatus,
} from "@/lib/db";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { calculateReadingTime } from "@/lib/reading-time";
import { isBlogCategory } from "@/lib/blog-categories";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const posts = await listAllPostsAdmin();
    return NextResponse.json({ success: true, posts });
  } catch (err) {
    console.error("[admin-blog list] failed", err);
    return NextResponse.json(
      { success: false, error: "Failed to load posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json(
      { success: false, error: "Title is required" },
      { status: 400 },
    );
  }

  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug.trim())
      : slugify(title);
  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Could not compute a valid slug" },
      { status: 400 },
    );
  }

  const rawBody = typeof body.bodyHtml === "string" ? body.bodyHtml : "";
  const bodyHtml = sanitizeBlogHtml(rawBody);
  const excerpt =
    typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 300) : "";

  const status: BlogStatus =
    body.status === "published" || body.status === "scheduled"
      ? body.status
      : "draft";

  const categoryRaw = body.category;
  const category = isBlogCategory(categoryRaw) ? categoryRaw : undefined;

  const tags = Array.isArray(body.tags)
    ? (body.tags as unknown[])
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;

  const input: BlogPostInput = {
    slug,
    title,
    subtitle:
      typeof body.subtitle === "string" && body.subtitle.trim()
        ? body.subtitle.trim()
        : undefined,
    excerpt,
    bodyHtml,
    author:
      typeof body.author === "string" && body.author.trim()
        ? body.author.trim()
        : undefined,
    category,
    tags,
    featuredImage:
      typeof body.featuredImage === "string" && body.featuredImage
        ? body.featuredImage
        : undefined,
    featuredImageAlt:
      typeof body.featuredImageAlt === "string" && body.featuredImageAlt
        ? body.featuredImageAlt
        : undefined,
    status,
    publishDate:
      status === "published"
        ? new Date().toISOString()
        : typeof body.publishDate === "string"
          ? body.publishDate
          : undefined,
    readingTimeMinutes: calculateReadingTime(bodyHtml),
    seoKeywords:
      typeof body.seoKeywords === "string" && body.seoKeywords.trim()
        ? body.seoKeywords.trim()
        : undefined,
  };

  try {
    const post = await putBlogPost(input);
    return NextResponse.json({ success: true, post });
  } catch (err) {
    console.error("[admin-blog create] failed", err);
    const msg = err instanceof Error ? err.message : "Failed to create post";
    // Most likely failure: unique violation on slug. Surface 409 so
    // the UI can prompt for a different slug.
    if (msg.includes("blog_posts_slug_uniq") || msg.includes("duplicate key")) {
      return NextResponse.json(
        { success: false, error: "A post with that slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    );
  }
}
