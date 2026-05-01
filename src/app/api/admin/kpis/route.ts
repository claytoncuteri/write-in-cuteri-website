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
  ballotSimStartsSc,
  nameRecognitionProxy,
  posthogConfigured,
  returnRate7d,
  wauSplit,
} from "@/lib/posthog-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Default payload shape used when a data source throws so the dashboard
// still gets a structured response with success:true and zeros, rather
// than crashing the whole endpoint. The admin can look at server logs
// for the underlying error while the page still renders.
const EMPTY_DB_COUNTS = {
  signups: {
    total: 0,
    byTag: { volunteer: 0, donor: 0, press: 0, general: 0 } as const,
  },
  quiz: { total: 0, withEmail: 0, extendedComplete: 0 },
};

export async function GET() {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Each data source is isolated so a single throw (e.g. REPLIT_DB_URL
    // missing, PostHog 401, PostHog schema drift) doesn't nuke the whole
    // KPI response. On error we log and use zeros so the dashboard still
    // renders with best-effort data.
    const phOn = posthogConfigured();
    const [dbCounts, wau, ballotSim, ballotSimStarts, nameRec, retention] =
      await Promise.all([
        getCounts().catch((err) => {
          console.error("[kpis] getCounts failed", err);
          return EMPTY_DB_COUNTS;
        }),
        phOn
          ? wauSplit().catch((err) => {
              console.error("[kpis] wauSplit failed", err);
              return { sc: 0, total: 0 };
            })
          : Promise.resolve({ sc: 0, total: 0 }),
        phOn
          ? ballotSimCompletionsSc().catch((err) => {
              console.error("[kpis] ballotSimCompletionsSc failed", err);
              return 0;
            })
          : Promise.resolve(0),
        phOn
          ? ballotSimStartsSc().catch((err) => {
              console.error("[kpis] ballotSimStartsSc failed", err);
              return 0;
            })
          : Promise.resolve(0),
        phOn
          ? nameRecognitionProxy().catch((err) => {
              console.error("[kpis] nameRecognitionProxy failed", err);
              return 0;
            })
          : Promise.resolve(0),
        phOn
          ? returnRate7d().catch((err) => {
              console.error("[kpis] returnRate7d failed", err);
              return 0;
            })
          : Promise.resolve(0),
      ]);

    return NextResponse.json({
      success: true,
      posthogConfigured: phOn,
      signups: dbCounts.signups,
      quiz: dbCounts.quiz,
      wauSc: wau.sc,
      wauTotal: wau.total,
      ballotSimCompletionsSc: ballotSim,
      ballotSimStartsSc: ballotSimStarts,
      nameRecognitionPct: nameRec,
      returnRate7dPct: retention,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[kpis] unexpected error", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
