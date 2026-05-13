// POST /api/admin/blog/[id]/publish
//
// Convenience endpoint that transitions a post to status='published'
// and stamps publish_date = now() if not already set. Exists in
// addition to PATCH because the publish action has a specific UI
// affordance (the "Publish" button) and centralizing the publish-
// time semantics in one place avoids the client having to know about
// the publishDate-stamping rule.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { publishBlogPost } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const { id } = await params;
  const post = await publishBlogPost(id);
  if (!post) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, post });
}
