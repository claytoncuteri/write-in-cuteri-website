// POST /api/admin/blog/upload-image
//
// Accepts a multipart form with a single `file` field (the image from
// the TipTap editor's image button). Writes the file to
// public/blog-images/<uuid>.<ext> and returns its public URL.
//
// Heads up on Replit autoscale: containers ARE ephemeral; an upload
// landed in public/blog-images/ during one request survives only as
// long as the same container instance is serving traffic. For v1
// this is acceptable because (a) committing every upload back to Git
// has implications for image-heavy posts, and (b) Replit Object
// Storage exists as a Phase 2 swap.
//
// What we do guarantee in v1: writes ARE durable across a container
// restart because Replit autoscale's deployment artifact is the Git
// repo; on next deploy public/blog-images/ ships back in. Mid-deploy
// images uploaded after the last commit will not survive a redeploy.
// Mitigation in v1: surface a "commit uploaded images to Git" tooling
// note in ADMIN_SETUP.md (Phase 2 punt).

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { isAdminAuthed } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const TARGET_DIR = join(process.cwd(), "public", "blog-images");

function safeExtension(filename: string, mime: string): string {
  const fromName = extname(filename).toLowerCase();
  if (fromName && /^\.(png|jpe?g|webp|gif)$/.test(fromName)) return fromName;
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".bin";
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid multipart body" },
      { status: 400 },
    );
  }

  const fileEntry = form.get("file");
  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Missing 'file' field" },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.has(fileEntry.type)) {
    return NextResponse.json(
      {
        success: false,
        error: `Unsupported type ${fileEntry.type}. Use PNG, JPEG, WebP, or GIF.`,
      },
      { status: 415 },
    );
  }
  if (fileEntry.size > MAX_BYTES) {
    return NextResponse.json(
      {
        success: false,
        error: `File too large (${fileEntry.size} bytes > ${MAX_BYTES}).`,
      },
      { status: 413 },
    );
  }

  if (!existsSync(TARGET_DIR)) {
    await mkdir(TARGET_DIR, { recursive: true });
  }

  const ext = safeExtension(fileEntry.name, fileEntry.type);
  const filename = `${randomUUID()}${ext}`;
  const fullPath = join(TARGET_DIR, filename);
  const buffer = Buffer.from(await fileEntry.arrayBuffer());
  await writeFile(fullPath, buffer);

  const url = `/blog-images/${filename}`;
  return NextResponse.json({ success: true, url });
}
