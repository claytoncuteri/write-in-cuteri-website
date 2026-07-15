// GET /api/admin/kit/sequences
//
// Returns every sequence in the connected Kit account so the admin
// UI can render a picker for the "Follow up" action. Filtered to
// active sequences with at least one email (paused/empty sequences
// can't send anything, no reason to show them).

import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listKitSequences } from "@/lib/convertkit";

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
    const all = await listKitSequences();
    // UI-side filter: only sendable sequences.
    const usable = all
      .filter((s) => s.active && s.emailCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ success: true, sequences: usable });
  } catch (err) {
    console.error("[admin kit sequences] failed", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to list sequences",
        sequences: [],
      },
      { status: 500 },
    );
  }
}
