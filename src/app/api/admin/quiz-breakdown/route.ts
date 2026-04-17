// GET /api/admin/quiz-breakdown
//
// Auth-gated. Aggregates every persisted QuizRecord into per-priority
// yes/no/unsure counts plus % aligned with Clayton. Strict 1:1 mapping
// between question id and priorityId (from src/data/quiz.ts) means the
// dashboard can surface our strongest and weakest issues without any
// fuzzy matching. Output is pre-sorted descending by alignment rate so
// the dashboard can render it as-is.

import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listQuizRecords } from "@/lib/db";
import { ALL_QUESTIONS } from "@/data/quiz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PriorityRow = {
  priorityId: string;
  questionId: string;
  heading: string;
  prompt: string;
  yes: number;
  no: number;
  unsure: number;
  answered: number;
  alignedCount: number;       // count of answers matching q.aligned
  alignmentPct: number;       // alignedCount / answered * 100, 0 if answered==0
};

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const records = await listQuizRecords({ limit: 5000 });

  const rows: PriorityRow[] = ALL_QUESTIONS.map((q) => ({
    priorityId: q.priorityId,
    questionId: q.id,
    heading: q.heading,
    prompt: q.prompt,
    yes: 0,
    no: 0,
    unsure: 0,
    answered: 0,
    alignedCount: 0,
    alignmentPct: 0,
  }));

  const byId = new Map(rows.map((r) => [r.questionId, r]));
  const alignedBy = new Map(ALL_QUESTIONS.map((q) => [q.id, q.aligned]));

  for (const rec of records) {
    if (!rec?.answers) continue;
    for (const [qid, ans] of Object.entries(rec.answers)) {
      const row = byId.get(qid);
      if (!row) continue; // dropped legacy question ids
      if (ans === "yes") row.yes++;
      else if (ans === "no") row.no++;
      else if (ans === "unsure") row.unsure++;
      else continue;
      row.answered++;
      if (ans === alignedBy.get(qid)) row.alignedCount++;
    }
  }

  for (const row of rows) {
    row.alignmentPct =
      row.answered > 0
        ? Math.round((row.alignedCount / row.answered) * 100)
        : 0;
  }

  rows.sort((a, b) => b.alignmentPct - a.alignmentPct);

  return NextResponse.json({
    success: true,
    totalRecords: records.length,
    rows,
    generatedAt: new Date().toISOString(),
  });
}
