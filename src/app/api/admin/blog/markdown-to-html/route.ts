// POST /api/admin/blog/markdown-to-html
//
// Server-side Markdown -> HTML conversion for the admin's "Import
// from Markdown" button. Runs on the server so the marked dependency
// doesn't bloat the client bundle. Output is NOT sanitized here;
// the save path (POST /api/admin/blog or PATCH .../[id]) runs the
// final HTML through DOMPurify before persisting.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { markdownToHtml } from "@/lib/markdown-import";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  let body: { markdown?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  if (typeof body.markdown !== "string") {
    return NextResponse.json(
      { success: false, error: "markdown field required" },
      { status: 400 },
    );
  }
  try {
    const html = markdownToHtml(body.markdown);
    return NextResponse.json({ success: true, html });
  } catch (err) {
    console.error("[markdown-to-html] failed", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Conversion failed",
      },
      { status: 500 },
    );
  }
}
