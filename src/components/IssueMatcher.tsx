"use client";

// Slanted issue-alignment quiz. Shows eight core questions, captures email,
// unlocks five extended questions (thirteen total, 1:1 mapped to Clayton's
// thirteen priorities), finishes on a score + share state. Every
// state transition fires a PostHog event so we can measure completion funnels
// and drop-off by question ID.
//
// Design notes:
// - Single-question view, big buttons for thumb-sized YES / NO / UNSURE.
// - Progress pill strip at top (1 of 8, etc.) lets us communicate that the
//   "email gate" is a mid-quiz milestone, not a wall.
// - On mobile we lock the answer row to the bottom so the voter can tap
//   without scrolling  -  critical because quizzes drop 30%+ when people have
//   to scroll to see the choice buttons.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Lock,
  Share2,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import {
  CORE_QUESTIONS,
  EXTENDED_QUESTIONS,
  scoreAnswers,
  type QuizAnswer,
  type QuizQuestion,
} from "@/data/quiz";
import { identifyByEmail, track } from "@/lib/analytics";

type Phase = "intro" | "core" | "email" | "extended" | "done";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function IssueMatcher({ sourcePage = "/" }: { sourcePage?: string }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [index, setIndex] = useState(0); // question index within the active list
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  // Positive reinforcement: when the voter's answer matches Clayton's stance,
  // flash a "Clayton agrees" confirmation. Builds alignment perception as
  // the quiz progresses (per Cialdini social-proof / commitment research).
  // Toast is tied to the question-transition window: appears on aligned
  // answer, disappears when the next question renders. ~700ms feels snappy
  // but noticeable.
  const AGREE_DURATION_MS = 800;
  const [agreePulse, setAgreePulse] = useState(0);
  const agreeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (agreeTimer.current) clearTimeout(agreeTimer.current);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);
  const triggerAgreePulse = useCallback(() => {
    setAgreePulse((n) => n + 1);
    if (agreeTimer.current) clearTimeout(agreeTimer.current);
    agreeTimer.current = setTimeout(() => setAgreePulse(0), AGREE_DURATION_MS);
  }, []);

  const activeQuestions: QuizQuestion[] =
    phase === "extended" ? EXTENDED_QUESTIONS : CORE_QUESTIONS;
  const current = activeQuestions[index];

  const scoreCore = useMemo(
    () => scoreAnswers(answers, CORE_QUESTIONS),
    [answers],
  );
  const scoreExtended = useMemo(
    () => scoreAnswers(answers, EXTENDED_QUESTIONS),
    [answers],
  );

  // --- phase transitions ----------------------------------------------------

  const beginCore = useCallback(() => {
    track("quiz_started", { source_page: sourcePage });
    setPhase("core");
    setIndex(0);
  }, [sourcePage]);

  const persistGateSubmit = useCallback(
    async (emailValue: string) => {
      setEmailSubmitting(true);
      setEmailError("");
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            email: emailValue,
            scoreCore,
            completedExtended: false,
            sourcePage,
          }),
        });
        // Read as text first so a catastrophic empty 500 body doesn't throw
        // an opaque "Unexpected end of JSON input" at the user.
        const raw = await res.text();
        const data = raw ? (JSON.parse(raw) as { success?: boolean; error?: string; id?: string }) : {};
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Save failed (HTTP ${res.status})`);
        }
        setRecordId(data.id ?? null);
        await identifyByEmail(emailValue, {
          quiz_alignment:
            scoreCore >= 6 ? "high" : scoreCore >= 4 ? "medium" : "low",
          quiz_score_core: scoreCore,
        });
        track("quiz_email_submitted", {
          score_core: scoreCore,
          source_page: sourcePage,
        });
        // Auto-advance into the extended block the moment the save succeeds.
        // Voters told us the intermediate "Saved. Start 5 bonus questions"
        // step felt like an unnecessary extra click  -  they hit Unlock
        // expecting the next question.
        track("quiz_extended_started", { source_page: sourcePage });
        setIndex(0);
        setPhase("extended");
      } catch (err) {
        setEmailError(
          err instanceof Error ? err.message : "Something went wrong",
        );
        throw err;
      } finally {
        setEmailSubmitting(false);
      }
    },
    [answers, scoreCore, sourcePage],
  );

  const persistFinal = useCallback(async () => {
    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          email: email || undefined,
          scoreCore,
          scoreExtended,
          completedExtended: true,
          sourcePage,
        }),
      });
    } catch {
      // Best-effort. The email-gate submission already has the core score.
    }
  }, [answers, email, scoreCore, scoreExtended, sourcePage]);

  const answerAndAdvance = useCallback(
    (answer: QuizAnswer) => {
      const q = current;
      if (!q) return;
      setAnswers((prev) => ({ ...prev, [q.id]: answer }));
      const aligned = answer === q.aligned;
      if (aligned) triggerAgreePulse();
      track("quiz_question_answered", {
        question_id: q.id,
        question_index: index + 1,
        answer,
        aligned_with_clayton: aligned,
        is_extended: phase === "extended",
        source_page: sourcePage,
      });

      const isLast = index === activeQuestions.length - 1;
      // When aligned, delay the advance by the agree-banner duration so the
      // "Clayton agrees" flash lands before the next question renders. When
      // not aligned, advance immediately (no banner, no reason to pause).
      const delay = aligned ? AGREE_DURATION_MS : 0;

      const advance = () => {
        if (!isLast) {
          setIndex((i) => i + 1);
          return;
        }
        // Last question in the current block.
        if (phase === "core") {
          track("quiz_core_completed", { score_core: scoreCore });
          setPhase("email");
        } else if (phase === "extended") {
          track("quiz_extended_completed", {
            score_core: scoreCore,
            score_extended: scoreExtended,
            total_score: scoreCore + scoreExtended,
          });
          persistFinal();
          setPhase("done");
        }
      };

      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (delay === 0) {
        advance();
      } else {
        advanceTimer.current = setTimeout(advance, delay);
      }
    },
    [current, index, phase, activeQuestions.length, scoreCore, scoreExtended, sourcePage, persistFinal, triggerAgreePulse],
  );

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError("Please enter a valid email");
      return;
    }
    try {
      await persistGateSubmit(trimmed);
    } catch {
      return;
    }
  }

  function startExtended() {
    track("quiz_extended_started", { source_page: sourcePage });
    setIndex(0);
    setPhase("extended");
  }

  function skipExtended() {
    track("quiz_extended_skipped", { source_page: sourcePage });
    persistFinal();
    setPhase("done");
  }

  useEffect(() => {
    if (phase === "email") {
      track("quiz_email_gate_shown", { score_core: scoreCore });
    }
  }, [phase, scoreCore]);

  // --- rendering ------------------------------------------------------------

  // Full-card green takeover between the "Yes" tap and the next question
  // rendering. Covers the whole quiz card so the voter's eyes (already on
  // the card) catch it without looking elsewhere. Per NN/g microinteraction
  // research, 600-800ms is the sweet spot for celebratory confirmations:
  // long enough to register, short enough to feel snappy.
  const agreeOverlay = (
    <div
      aria-live="polite"
      role="status"
      className={`absolute inset-0 flex items-center justify-center rounded-xl bg-green-600 z-20 pointer-events-none transition-opacity duration-150 ${
        agreePulse > 0 ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        key={agreePulse}
        className="flex flex-col items-center gap-3 text-white animate-[agreePop_200ms_ease-out]"
      >
        <ThumbsUp size={56} strokeWidth={2.5} />
        <p className="text-2xl sm:text-3xl font-bold font-serif">
          Clayton agrees!
        </p>
      </div>
    </div>
  );

  if (phase === "intro") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-gold" />
          <p className="text-xs font-semibold text-navy uppercase tracking-wider">
            Issue Matcher
          </p>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif leading-tight">
          See how much you agree with Clayton.
        </h3>
        <p className="mt-3 text-charcoal/70 text-base">
          Thirteen questions on Clayton&rsquo;s thirteen priorities. Eight to
          start, five more after you unlock them. No fluff, no political mush.
          Slanted the way most voters actually feel but the parties won&rsquo;t say.
        </p>
        <button
          onClick={beginCore}
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-dark transition-colors"
        >
          Start the 13-question quiz <ArrowRight size={16} />
        </button>
        <p className="mt-3 text-[11px] text-charcoal/40">
          Takes under two minutes. You can see your score before giving an email.
        </p>
      </div>
    );
  }

  if (phase === "email") {
    const alignment =
      scoreCore >= 6 ? "high" : scoreCore >= 4 ? "medium" : "low";
    const alignmentCopy = {
      high: "You and Clayton agree on nearly everything that matters.",
      medium: "You agree with Clayton on the issues both parties ignore.",
      low: "You disagree often  -  but Clayton wants to hear why.",
    }[alignment];
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Award size={18} className="text-gold" />
          <p className="text-xs font-semibold text-navy uppercase tracking-wider">
            Your score so far
          </p>
        </div>
        <div className="flex items-baseline gap-3 mt-1">
          <p className="text-5xl sm:text-6xl font-bold text-navy font-serif">
            {scoreCore}/8
          </p>
          <span className="text-sm font-semibold text-charcoal/60">
            core issues
          </span>
        </div>
        <p className="mt-3 text-charcoal/80 text-base">{alignmentCopy}</p>

        <form onSubmit={onEmailSubmit} className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal/60 uppercase tracking-wider mb-1">
              Email (required to unlock 5 more questions)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
              autoFocus
              data-ph-mask
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-accent">{emailError}</p>
            )}
            <p className="mt-2 text-[11px] text-charcoal/50 leading-snug">
              We email you your results + a short explanation of where Clayton
              stands on each issue. No spam. Unsubscribe in one click.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={emailSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-dark transition-colors disabled:opacity-60"
            >
              {emailSubmitting ? (
                "Saving..."
              ) : (
                <>
                  Unlock 5 more questions <Lock size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {recordId && (
          <div className="mt-4 flex items-center gap-2 text-sm text-charcoal/70">
            <CheckCircle2 size={16} className="text-green-600" />
            Saved. Check your inbox to confirm your subscription.
            <button
              onClick={startExtended}
              className="ml-auto inline-flex items-center gap-1 text-navy font-semibold hover:underline"
            >
              Start 5 bonus questions <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === "done") {
    const total = scoreCore + scoreExtended;
    const totalPct = Math.round((total / 13) * 100);
    // X gets the @ClaytonCuteri handle so the post tags Clayton and shows up
    // in his mentions. SMS keeps the plain name because an @ in a text
    // message reads as broken rather than as a tag.
    // #quiz hash drops the voter straight onto the quiz section  -  tweet
    // promises "Take the quiz", so landing on the quiz (not the hero) is
    // the promise-match that keeps bounce low.
    const shareTextX = encodeURIComponent(
      `I agree with @ClaytonCuteri on ${total}/13 issues. Take the quiz: https://writeincuteri.com/#quiz`,
    );
    const shareTextSms = encodeURIComponent(
      `I agree with Clayton Cuteri on ${total}/13 issues. Take the quiz: https://writeincuteri.com/#quiz`,
    );
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl mx-auto text-center">
        <Award size={40} className="text-gold mx-auto mb-3" />
        <p className="text-xs font-semibold text-navy uppercase tracking-wider">
          Final result
        </p>
        <p className="mt-2 text-5xl sm:text-6xl font-bold text-navy font-serif">
          {total}/13
        </p>
        <p className="mt-2 text-charcoal/70">
          {totalPct}% alignment with Clayton on {total === 13 ? "every" : total} issue{total === 1 ? "" : "s"}.
        </p>
        <p className="mt-4 text-charcoal/80">
          Share your result. Most voters have never taken a quiz where the
          questions aren&rsquo;t rigged by a consultant.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTextX}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share_button_clicked", { platform: "x", content_type: "quiz_result" })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
          >
            <Share2 size={14} /> Share on X
          </a>
          <a
            href={`sms:?&body=${shareTextSms}`}
            onClick={() => track("share_button_clicked", { platform: "sms", content_type: "quiz_result" })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cream text-charcoal border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            <Share2 size={14} /> Text a friend
          </a>
        </div>
        <p className="mt-6 text-[11px] text-charcoal/40">
          Want to dig deeper on any of these? Every answer links to the full
          policy on /policies.
        </p>
      </div>
    );
  }

  // core or extended  -  render the current question.
  if (!current) return null;
  const blockLabel = phase === "extended" ? "Bonus" : "Core";
  const blockTotal = activeQuestions.length;

  return (
    // min-h keeps the card a consistent size across questions so the answer
    // buttons don't jump up/down as prompt length varies. Tuned to fit the
    // longest ~3-line prompt without overflow on mobile.
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl mx-auto flex flex-col min-h-[26rem] sm:min-h-[24rem]">
      {/* Progress strip */}
      <div className="flex items-center gap-2 mb-5">
        <p className="text-xs font-semibold text-navy uppercase tracking-wider">
          {blockLabel} {index + 1} / {blockTotal}
        </p>
        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy transition-all"
            style={{ width: `${((index + 1) / blockTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* Prompt area reserves a fixed min-height so short and long prompts
          both anchor the button row at the same position. */}
      <h3 className="text-xl sm:text-2xl font-bold text-charcoal font-serif leading-snug min-h-[6.5rem] sm:min-h-[5.5rem]">
        {current.prompt}
      </h3>

      <div className="mt-6 grid gap-2">
        <button
          onClick={() => answerAndAdvance("yes")}
          className="w-full px-4 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-dark transition-colors text-left"
        >
          Yes
        </button>
        <button
          onClick={() => answerAndAdvance("no")}
          className="w-full px-4 py-3 bg-white text-charcoal border-2 border-gray-300 font-semibold rounded-lg hover:border-navy transition-colors text-left"
        >
          No
        </button>
        <button
          onClick={() => answerAndAdvance("unsure")}
          className="w-full px-4 py-3 bg-cream text-charcoal/70 font-medium rounded-lg hover:bg-gray-100 transition-colors text-left text-sm"
        >
          I&rsquo;m not sure
        </button>
      </div>

      {phase === "extended" && (
        <button
          onClick={skipExtended}
          className="mt-4 text-xs text-charcoal/50 hover:text-charcoal underline"
        >
          Skip the rest and see my score
        </button>
      )}
      {agreeOverlay}
    </div>
  );
}
