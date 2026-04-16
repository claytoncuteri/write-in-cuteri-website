// BMD (Ballot-Marking Device) practice simulator.
//
// 96% of SC-01 voters cast ballots on the ES&S ExpressVote touchscreen at
// their polling place, so this is the DEFAULT mode in the practice tool.
// The remaining ~4% vote absentee by mail on paper  -  that lives in
// BallotSimulatorPaper.tsx behind a toggle.
//
// Flow:
//   1. "select"    - contest screen with candidates + Write-In button
//   2. "keyboard"  - on-screen QWERTY keyboard to type the name
//   3. "review"    - review your selections, then Print Card
//   4. SuccessState - rendered by the parent wrapper
//
// UX notes:
//   - Whole "touchscreen" is enclosed in a dark bezel so it reads as a
//     standalone device, not a form on the page.
//   - Tap targets are >=48px per WCAG 2.2 AAA.
//   - On-screen keyboard uses QWERTY because the real ExpressVote does.
//   - Tapping a decoy candidate fires a rate-limited nudge, same pattern
//     as the paper simulator.

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Printer, Check } from "lucide-react";
import { track } from "@/lib/analytics";
import { matchesCuteri, SuccessState } from "./BallotSimulatorShared";

type Stage = "select" | "keyboard" | "review";

const HINT_COOLDOWN_MS = 8_000;
const NUDGE_DISMISS_MS = 4_000;

const KEYBOARD_ROWS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function BMDSimulator() {
  const [stage, setStage] = useState<Stage>("select");
  const [writeInValue, setWriteInValue] = useState("");
  const [keyboardDraft, setKeyboardDraft] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const lastNudgeAt = useRef(0);
  const startedAt = useRef<number>(Date.now());
  const stagesReached = useRef<Set<Stage>>(new Set(["select"]));

  useEffect(() => {
    track("ballot_sim_started", { mode: "bmd" });
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!stagesReached.current.has(stage)) {
      stagesReached.current.add(stage);
      track("ballot_sim_step_reached", {
        mode: "bmd",
        stage,
        seconds_since_start: Math.round((Date.now() - startedAt.current) / 1000),
      });
    }
  }, [stage]);

  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(() => setNudge(null), NUDGE_DISMISS_MS);
    return () => clearTimeout(t);
  }, [nudge]);

  function triggerNudge(msg: string) {
    const now = Date.now();
    if (now - lastNudgeAt.current < HINT_COOLDOWN_MS) return;
    lastNudgeAt.current = now;
    setNudge(msg);
  }

  function onDecoyCandidate(name: string) {
    triggerNudge(
      `${name} is a listed candidate. To vote for Clayton Cuteri, tap "Write-In" below.`
    );
    track("ballot_sim_decoy_click", {
      mode: "bmd",
      race: "U.S. House District 1",
      choice: name,
      stage,
    });
  }

  function onWriteInTap() {
    setStage("keyboard");
    setKeyboardDraft(writeInValue); // preserve across edits
    track("ballot_sim_write_in_keyboard_opened", { mode: "bmd" });
  }

  function onKey(letter: string) {
    setKeyboardDraft((d) => (d.length >= 40 ? d : d + letter));
  }

  function onSpace() {
    setKeyboardDraft((d) => (d.length >= 40 ? d : d + " "));
  }

  function onBackspace() {
    setKeyboardDraft((d) => d.slice(0, -1));
  }

  function onKeyboardAccept() {
    const trimmed = keyboardDraft.trim();
    if (trimmed.length === 0) {
      triggerNudge("Type a candidate name before tapping Accept.");
      return;
    }
    setWriteInValue(trimmed);
    setStage("review");
  }

  function onKeyboardCancel() {
    // User backed out. Don't save the draft.
    setKeyboardDraft("");
    setStage("select");
  }

  function onReviewPrint() {
    if (!writeInValue) {
      triggerNudge("You haven't selected a candidate yet.");
      track("ballot_sim_submit_blocked", {
        mode: "bmd",
        reason: "no_selection",
      });
      return;
    }
    const match = matchesCuteri(writeInValue);
    track("ballot_sim_completed", {
      mode: "bmd",
      name_match: match,
      total_seconds: Math.round((Date.now() - startedAt.current) / 1000),
    });
    setSubmitted(true);
  }

  function onReviewBack() {
    setStage("select");
  }

  function reset() {
    setStage("select");
    setSubmitted(false);
    setWriteInValue("");
    setKeyboardDraft("");
    setNudge(null);
    lastNudgeAt.current = 0;
    stagesReached.current = new Set(["select"]);
    startedAt.current = Date.now();
  }

  if (submitted) {
    return <SuccessState writeInValue={writeInValue} onReset={reset} mode="bmd" />;
  }

  const hintStage: Stage = stage;

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressiveHint stage={hintStage} nudge={nudge} hasName={!!writeInValue} />

      {/* Touchscreen bezel */}
      <div className="bg-gray-800 rounded-[2rem] p-3 sm:p-4 shadow-2xl">
        <div className="bg-white rounded-2xl overflow-hidden border-4 border-gray-900">
          {/* PRACTICE banner */}
          <div className="bg-yellow-100 border-b-2 border-yellow-400 px-6 py-2">
            <p className="text-[11px] text-yellow-900 font-bold uppercase tracking-wider text-center">
              Practice Mode - ExpressVote Simulation. No Vote Will Be Cast.
            </p>
          </div>

          {/* Device header */}
          <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-300 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">
                ExpressVote
              </p>
              <p className="text-xs text-gray-700 font-mono">
                General Election - November 3, 2026
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                Contest
              </p>
              <p className="text-sm font-bold text-gray-900">1 of 1</p>
            </div>
          </div>

          {/* Screen body */}
          {stage === "select" && (
            <ContestScreen
              writeInValue={writeInValue}
              onDecoyCandidate={onDecoyCandidate}
              onWriteInTap={onWriteInTap}
              onNext={() => {
                if (writeInValue) {
                  setStage("review");
                } else {
                  triggerNudge('Tap "Write-In" to vote for Clayton Cuteri.');
                }
              }}
            />
          )}

          {stage === "keyboard" && (
            <KeyboardScreen
              draft={keyboardDraft}
              onKey={onKey}
              onSpace={onSpace}
              onBackspace={onBackspace}
              onAccept={onKeyboardAccept}
              onCancel={onKeyboardCancel}
            />
          )}

          {stage === "review" && (
            <ReviewScreen
              writeInValue={writeInValue}
              onBack={onReviewBack}
              onPrint={onReviewPrint}
              onEdit={onWriteInTap}
            />
          )}
        </div>
      </div>

      {/* Absentee callout */}
      <div className="mt-6 bg-white/10 border border-white/20 rounded-lg p-4 text-white/80 text-sm">
        <p className="font-semibold text-white mb-1">
          Voting absentee by mail?
        </p>
        <p className="leading-relaxed">
          Switch the toggle above to see the paper-ballot version. Same idea:
          fill in the Write-in oval and write <strong>Clayton Cuteri</strong>{" "}
          (C-U-T-E-R-I) on the line.
        </p>
      </div>
    </div>
  );
}

// --- Contest screen ---
function ContestScreen({
  writeInValue,
  onDecoyCandidate,
  onWriteInTap,
  onNext,
}: {
  writeInValue: string;
  onDecoyCandidate: (name: string) => void;
  onWriteInTap: () => void;
  onNext: () => void;
}) {
  const hasSelection = !!writeInValue;

  return (
    <>
      <div className="px-6 py-5 border-b border-gray-200">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          United States House of Representatives
        </p>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-serif mt-0.5">
          Congressional District 1
        </h3>
        <p className="text-xs text-gray-600 mt-1">(Vote for One)</p>
      </div>

      <div className="p-4 sm:p-6 space-y-3">
        <CandidateButton
          name="[Republican Candidate]"
          party="Republican"
          selected={false}
          onClick={() => onDecoyCandidate("Republican Candidate")}
        />
        <CandidateButton
          name="[Democratic Candidate]"
          party="Democratic"
          selected={false}
          onClick={() => onDecoyCandidate("Democratic Candidate")}
        />

        {/* Write-in button - highlighted */}
        <button
          type="button"
          onClick={onWriteInTap}
          className={`w-full min-h-[72px] p-4 rounded-lg border-2 flex items-center gap-4 text-left transition-all ${
            hasSelection
              ? "bg-navy/5 border-navy"
              : "border-gold bg-gold/10 animate-pulse hover:bg-gold/20"
          }`}
          aria-label={
            hasSelection
              ? `Write-In selected: ${writeInValue}. Tap to edit.`
              : "Write-In. Tap to type a name."
          }
        >
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              hasSelection ? "bg-navy border-navy" : "border-navy"
            }`}
          >
            {hasSelection && <Check size={18} className="text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Write-In
            </p>
            {hasSelection ? (
              <p
                className="text-lg sm:text-xl text-charcoal truncate"
                style={{ fontFamily: "var(--font-caveat), cursive" }}
              >
                {writeInValue}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Tap to type a candidate name on the keyboard
              </p>
            )}
          </div>
        </button>
      </div>

      {/* Nav buttons */}
      <div className="px-4 sm:px-6 py-4 bg-gray-100 border-t border-gray-300 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled
          className="px-5 py-3 text-sm font-semibold rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed min-h-[48px] flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`px-5 py-3 text-sm font-semibold rounded-lg min-h-[48px] flex items-center gap-2 transition-colors ${
            hasSelection
              ? "bg-navy text-white hover:bg-navy-dark"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}

// --- Candidate button (for decoys) ---
function CandidateButton({
  name,
  party,
  selected,
  onClick,
}: {
  name: string;
  party: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[72px] p-4 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 flex items-center gap-4 text-left transition-colors"
    >
      <div
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selected ? "bg-navy border-navy" : "border-gray-400"
        }`}
      >
        {selected && <Check size={18} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
          {name}
        </p>
        <p className="text-xs text-gray-600 uppercase tracking-wider">
          {party}
        </p>
      </div>
    </button>
  );
}

// --- On-screen keyboard ---
function KeyboardScreen({
  draft,
  onKey,
  onSpace,
  onBackspace,
  onAccept,
  onCancel,
}: {
  draft: string;
  onKey: (letter: string) => void;
  onSpace: () => void;
  onBackspace: () => void;
  onAccept: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          Write-in for U.S. House, District 1
        </p>
        <p className="text-xs text-gray-700 mt-1">
          Type the candidate&rsquo;s name, then tap Accept.
        </p>
      </div>

      {/* Text display */}
      <div className="px-4 sm:px-6 pt-5 pb-3">
        <div className="min-h-[64px] px-4 py-3 bg-white border-2 border-navy rounded-lg flex items-center">
          <p
            className="text-2xl sm:text-3xl text-charcoal w-full break-words"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
            aria-live="polite"
            role="textbox"
          >
            {draft || (
              <span
                className="text-gray-400 text-base"
                style={{ fontFamily: "inherit" }}
              >
                type here
              </span>
            )}
            {draft && <span className="inline-block w-0.5 h-6 bg-navy ml-0.5 animate-pulse" />}
          </p>
        </div>
      </div>

      {/* Keyboard */}
      <div className="px-2 sm:px-4 pb-3 space-y-1.5">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => onKey(letter)}
                className="flex-1 min-h-[44px] sm:min-h-[48px] max-w-[44px] sm:max-w-[52px] bg-white border-2 border-gray-300 rounded-md text-sm sm:text-base font-bold text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        {/* Space + backspace row */}
        <div className="flex justify-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={onBackspace}
            className="min-h-[44px] px-4 sm:px-6 bg-white border-2 border-gray-300 rounded-md text-xs sm:text-sm font-bold text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Backspace"
          >
            Backspace
          </button>
          <button
            type="button"
            onClick={onSpace}
            className="flex-1 max-w-[260px] min-h-[44px] bg-white border-2 border-gray-300 rounded-md text-xs sm:text-sm font-bold text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            Space
          </button>
        </div>
      </div>

      {/* Action row */}
      <div className="px-4 sm:px-6 py-4 bg-gray-100 border-t border-gray-300 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 text-sm font-semibold rounded-lg bg-white border-2 border-gray-400 text-gray-700 hover:bg-gray-50 min-h-[48px]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="px-6 py-3 text-sm font-semibold rounded-lg bg-navy text-white hover:bg-navy-dark min-h-[48px] flex items-center gap-2"
        >
          <Check size={16} />
          Accept
        </button>
      </div>
    </>
  );
}

// --- Review screen ---
function ReviewScreen({
  writeInValue,
  onBack,
  onPrint,
  onEdit,
}: {
  writeInValue: string;
  onBack: () => void;
  onPrint: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          Review Your Selections
        </p>
        <p className="text-xs text-gray-700 mt-1">
          Confirm your choice below, then print your ballot card.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-cream border-l-4 border-navy rounded-r-lg p-4 sm:p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            U.S. House of Representatives, District 1
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600 uppercase tracking-wider">
                Write-In
              </p>
              <p
                className="text-2xl sm:text-3xl text-charcoal mt-0.5 break-words"
                style={{ fontFamily: "var(--font-caveat), cursive" }}
              >
                {writeInValue}
              </p>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="text-xs font-semibold text-navy underline hover:text-navy-dark flex-shrink-0 min-h-[44px] flex items-center px-2"
            >
              Edit
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-600">
          The machine will print a paper ballot card with your selections. You
          then feed that card into the tabulator to cast your vote.
        </p>
      </div>

      <div className="px-4 sm:px-6 py-4 bg-gray-100 border-t border-gray-300 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 text-sm font-semibold rounded-lg bg-white border-2 border-gray-400 text-gray-700 hover:bg-gray-50 min-h-[48px] flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="px-6 py-3 text-sm font-semibold rounded-lg bg-red-accent text-white hover:bg-red-accent-dark min-h-[48px] flex items-center gap-2"
        >
          <Printer size={16} />
          Print Ballot Card
        </button>
      </div>
    </>
  );
}

// --- Progressive hint bar ---
function ProgressiveHint({
  stage,
  nudge,
  hasName,
}: {
  stage: Stage;
  nudge: string | null;
  hasName: boolean;
}) {
  const steps: { key: Stage; label: string }[] = [
    { key: "select", label: hasName ? "Write-in selected" : "Tap Write-In" },
    { key: "keyboard", label: "Type Clayton Cuteri" },
    { key: "review", label: "Print your ballot" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === stage);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 flex-wrap">
        {steps.map((s, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          return (
            <div key={s.key} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-gold text-navy"
                    : "bg-white/20 text-white/60"
                }`}
              >
                {isDone ? "\u2713" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-4 sm:w-6 ${
                    isDone ? "bg-green-500" : "bg-white/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold">
          Step {activeIndex + 1} of {steps.length}
        </p>
        <p className="mt-1 text-white text-xl sm:text-2xl font-serif">
          {steps[activeIndex]?.label}
        </p>
      </div>

      <div className="h-8 mt-2 text-center" aria-live="polite" role="status">
        {nudge && (
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm px-4 py-1.5 rounded">
            <span>{nudge}</span>
          </div>
        )}
      </div>
    </div>
  );
}
