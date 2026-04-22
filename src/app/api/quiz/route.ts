// POST /api/quiz
//
// Persists a quiz session to Replit DB. Called in two phases:
//   1. When the user hits the email gate (core 8 complete)  -  records answers
//      + email + scoreCore; completedExtended=false.
//   2. When the user finishes extended  -  same record rewritten with updated
//      scoreExtended + completedExtended=true.
//
// Body:
//   { answers: { q1..q13: "yes"|"no"|"unsure" },
//     email?: string,
//     scoreCore: number,
//     scoreExtended?: number,
//     completedExtended: boolean,
//     sourcePage?: string }

import { NextRequest, NextResponse } from "next/server";
import { putQuizRecord } from "@/lib/db";
import { subscribeToConvertKit } from "@/lib/convertkit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ANSWER = new Set(["yes", "no", "unsure"]);

export async function POST(req: NextRequest) {
  try {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const rawAnswers = body.answers;
  const answers: Record<string, string> = {};
  if (rawAnswers && typeof rawAnswers === "object" && !Array.isArray(rawAnswers)) {
    for (const [k, v] of Object.entries(rawAnswers as Record<string, unknown>)) {
      if (typeof v === "string" && VALID_ANSWER.has(v)) {
        answers[k] = v;
      }
    }
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : undefined;
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : undefined;
  // Optional phone + TCPA opt-in captured at the email gate. Phone is not
  // required here (we have a dedicated HomeSignup form for the required
  // path); the quiz is a secondary capture surface that shouldn't add
  // friction to an already-committed voter.
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const smsOptIn = body.smsOptIn === true;
  const scoreCore = Number(body.scoreCore ?? 0);
  const scoreExtendedRaw = body.scoreExtended;
  const scoreExtended =
    typeof scoreExtendedRaw === "number" ? scoreExtendedRaw : undefined;
  const completedExtended = body.completedExtended === true;
  const sourcePage = typeof body.sourcePage === "string" ? body.sourcePage : undefined;

  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { success: false, error: "Invalid email" },
      { status: 400 },
    );
  }

  const geo = {
    ipRegion:
      req.headers.get("cf-region-code") ??
      req.headers.get("x-vercel-ip-country-region") ??
      undefined,
  };

  const record = await putQuizRecord({
    email,
    answers,
    scoreCore,
    scoreExtended,
    completedExtended,
    sourcePage,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ipRegion: geo.ipRegion,
  });

  // If the quiz taker submitted an email at the gate, sync to ConvertKit with
  // alignment-bucket custom field for later segmentation.
  if (email) {
    // Buckets match IssueMatcher.tsx: 8-question core, 6+ high, 4-5 medium, 0-3 low.
    const alignment =
      scoreCore >= 6 ? "high" : scoreCore >= 4 ? "medium" : "low";
    const ckResult = await subscribeToConvertKit({
      email,
      firstName,
      lastName,
      tag: "general",
      fields: {
        quiz_score_core: String(scoreCore),
        quiz_alignment: alignment,
        ...(completedExtended ? { quiz_extended: "yes" } : {}),
        ...(typeof scoreExtended === "number"
          ? { quiz_score_extended: String(scoreExtended) }
          : {}),
        ...(phone ? { phone } : {}),
        ...(smsOptIn
          ? { sms_opt_in: "yes", sms_opt_in_at: new Date().toISOString() }
          : {}),
      },
    });
    // Log the ConvertKit outcome so we can diagnose "email didn't arrive"
    // from Replit logs. Kit's API returns 200 even when no confirmation
    // email is sent (e.g. subscriber already exists and is confirmed),
    // so success:true here does not guarantee a new message went out.
    if (!ckResult.success) {
      console.error("[quiz] ConvertKit subscribe failed", {
        email,
        error: ckResult.error,
      });
    } else {
      console.log("[quiz] ConvertKit subscribe ok", { email, alignment, scoreCore });
    }
  }

    return NextResponse.json({ success: true, id: record.id });
  } catch (err) {
    // Catch-all so client fetch.json() never blows up on an empty body.
    // The client surfaces data.error directly, so make it human-readable.
    console.error("[quiz] unexpected error", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Something went wrong saving your quiz. Please try again.",
      },
      { status: 500 },
    );
  }
}
