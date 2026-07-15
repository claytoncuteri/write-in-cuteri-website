// POST /api/admin/signups/[id]/resend-ck
//
// Manual retry of the ConvertKit sync for a specific signup row.
// Reuses subscribeToConvertKit end to end so a retry does everything
// a fresh signup does: subscriber upsert + form add + tag apply.
//
// Idempotent from Kit's perspective (subscribers dedupe by email,
// tag apply is a no-op if already applied), so clicking Retry
// multiple times is safe.
//
// Returns the updated signup record so the admin table can refresh
// the row inline without another list fetch.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getSignup, updateSignupStatus } from "@/lib/db";
import { subscribeToConvertKit } from "@/lib/convertkit";

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
  const decoded = decodeURIComponent(id);

  const existing = await getSignup(decoded);
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Signup not found" },
      { status: 404 },
    );
  }

  // Re-invoke the sync using whatever we captured on the original
  // submission. If the row is missing fields (older schemas), we do
  // our best with what's there; Kit will still upsert the subscriber
  // and tag them appropriately.
  const result = await subscribeToConvertKit({
    email: existing.email,
    firstName: existing.firstName,
    lastName: existing.lastName,
    tag: existing.tag,
    fields: existing.fields,
    ipRegion: existing.ipRegion,
    zip: existing.fields?.zip_code,
  });

  await updateSignupStatus(
    decoded,
    result.success ? "ok" : "error",
    result.error,
    result.tagsApplied,
  );

  // Re-read so the client gets the fully updated row (status,
  // convertkitError, convertkitTagsApplied all reflect this retry).
  const refreshed = await getSignup(decoded);

  return NextResponse.json({
    success: result.success,
    error: result.error,
    record: refreshed,
  });
}
