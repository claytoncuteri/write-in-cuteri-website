// GET /api/admin/kpis
//
// Merges counts from Replit DB (signups, quiz) with aggregate metrics from
// PostHog (WAU, ballot-sim completions, name-recognition proxy, 7-day return
// rate). Auth-gated.

import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getCounts } from "@/lib/db";
import {
  ballotSimCompletionsSc,
  nameRecognitionProxy,
  posthogConfigured,
  returnRate7d,
  wauSplit,
} from "@/lib/posthog-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Fire both data sources in parallel. If PostHog is not configured yet we
  // still return Replit-DB-derived numbers so the dashboard is useful on day
  // one without analytics.
  const [dbCounts, wau, ballotSim, nameRec, retention] = await Promise.all([
    getCounts(),
    posthogConfigured() ? wauSplit() : Promise.resolve({ sc: 0, total: 0 }),
    posthogConfigured() ? ballotSimCompletionsSc() : Promise.resolve(0),
    posthogConfigured() ? nameRecognitionProxy() : Promise.resolve(0),
    posthogConfigured() ? returnRate7d() : Promise.resolve(0),
  ]);

  return NextResponse.json({
    success: true,
    posthogConfigured: posthogConfigured(),
    signups: dbCounts.signups,
    quiz: dbCounts.quiz,
    wauSc: wau.sc,
    wauTotal: wau.total,
    ballotSimCompletionsSc: ballotSim,
    nameRecognitionPct: nameRec,
    returnRate7dPct: retention,
    generatedAt: new Date().toISOString(),
  });
}
