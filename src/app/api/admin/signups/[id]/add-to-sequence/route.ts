// POST /api/admin/signups/[id]/add-to-sequence
// Body: { sequenceId: number, sequenceName?: string }
//
// Adds the signup's email to a Kit sequence and appends the attempt
// to the signup row's convertkitSequenceHistory log. sequenceName is
// stored redundantly so the admin log stays readable even if the
// sequence is later renamed or deleted in Kit.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getSignup, appendSignupSequenceHistory } from "@/lib/db";
import { addSubscriberToKitSequence } from "@/lib/convertkit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  const { id } = await params;
  const decoded = decodeURIComponent(id);

  let body: { sequenceId?: number; sequenceName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const sequenceId = Number(body.sequenceId);
  if (!sequenceId || Number.isNaN(sequenceId)) {
    return NextResponse.json(
      { success: false, error: "sequenceId required" },
      { status: 400 },
    );
  }

  const existing = await getSignup(decoded);
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Signup not found" },
      { status: 404 },
    );
  }

  const result = await addSubscriberToKitSequence({
    email: existing.email,
    sequenceId,
  });

  await appendSignupSequenceHistory(decoded, {
    sequenceId,
    sequenceName: body.sequenceName ?? String(sequenceId),
    status: result.success ? "ok" : "error",
    error: result.error,
  });

  const refreshed = await getSignup(decoded);
  return NextResponse.json({
    success: result.success,
    error: result.error,
    record: refreshed,
  });
}
