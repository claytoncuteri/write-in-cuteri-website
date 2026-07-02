// GET    /api/admin/blog/[id]   load a single post for editing
// PATCH  /api/admin/blog/[id]   update fields on an existing post
// DELETE /api/admin/blog/[id]   remove a post permanently
//
// PATCH only writes the fields present in the request body. Anything
// omitted is left as-is. bodyHtml is always re-sanitized + reading
// time is always recomputed when bodyHtml is in the payload.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
  type BlogPostInput,
  type BlogStatus,
} from "@/lib/db";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { calculateReadingTime } from "@/lib/reading-time";
import { isBlogCategory } from "@/lib/blog-categories";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, post });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const patch: Partial<BlogPostInput> = {};

  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.slug === "string" && body.slug.trim()) {
    patch.slug = slugify(body.slug.trim());
  }
  if (typeof body.subtitle === "string") {
    patch.subtitle = body.subtitle.trim() || undefined;
  }
  if (typeof body.excerpt === "string") {
    patch.excerpt = body.excerpt.trim().slice(0, 300);
  }
  if (typeof body.bodyHtml === "string") {
    patch.bodyHtml = sanitizeBlogHtml(body.bodyHtml);
    patch.readingTimeMinutes = calculateReadingTime(patch.bodyHtml);
  }
  if (typeof body.author === "string") {
    patch.author = body.author.trim() || undefined;
  }
  if (typeof body.featuredImage === "string") {
    patch.featuredImage = body.featuredImage || undefined;
  }
  if (typeof body.featuredImageAlt === "string") {
    patch.featuredImageAlt = body.featuredImageAlt || undefined;
  }
  if (typeof body.seoKeywords === "string") {
    patch.seoKeywords = body.seoKeywords.trim() || undefined;
  }
  if (isBlogCategory(body.category)) {
    patch.category = body.category;
  } else if (body.category === null || body.category === "") {
    patch.category = undefined;
  }
  if (Array.isArray(body.tags)) {
    patch.tags = (body.tags as unknown[])
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (
    body.status === "draft" ||
    body.status === "published" ||
    body.status === "scheduled"
  ) {
    const newStatus = body.status as BlogStatus;
    patch.status = newStatus;
    // If we're transitioning into 'published' here AND no explicit
    // publishDate was sent, stamp now() so the post sorts correctly
    // on the public index. Re-publish keeps the existing date.
    if (newStatus === "published" && typeof body.publishDate !== "string") {
      const existing = await getBlogPostById(id);
      if (!existing?.publishDate) {
        patch.publishDate = new Date().toISOString();
      }
    }
  }
  if (typeof body.publishDate === "string") {
    patch.publishDate = body.publishDate;
  }

  try {
    const updated = await updateBlogPost(id, patch);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, post: updated });
  } catch (err) {
    console.error("[admin-blog patch] failed", err);
    const msg = err instanceof Error ? err.message : "Failed to update post";
    if (msg.includes("blog_posts_slug_uniq") || msg.includes("duplicate key")) {
      return NextResponse.json(
        { success: false, error: "Another post already uses that slug" },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const { id } = await params;
  const removed = await deleteBlogPost(id);
  if (!removed) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true });
}
