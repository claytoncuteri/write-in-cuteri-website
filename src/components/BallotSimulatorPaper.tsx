// Paper practice ballot. Used by voters who vote absentee by mail (~4%
// of SC-01 voters). The BMD touchscreen simulation is the default view;
// this one sits behind a toggle.
//
// Behavior is identical to the original single-mode simulator: progressive
// hint bar, clickable write-in oval, fuzzy name matching.

"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowDown } from "lucide-react";
import { track } from "@/lib/analytics";
import { matchesCuteri, SuccessState } from "./BallotSimulatorShared";

type Stage = "find" | "oval" | "write" | "ready";

const HINT_COOLDOWN_MS = 8_000;
const NUDGE_DISMISS_MS = 4_000;

export function PaperBallot() {
  const [stage, setStage] = useState<Stage>("find");
  const [bubbleFilled, setBubbleFilled] = useState(false);
  const [writeInValue, setWriteInValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const lastNudgeAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startedAt = useRef<number>(Date.now());
  const stagesReached = useRef<Set<Stage>>(new Set(["find"]));

  useEffect(() => {
    track("ballot_sim_started", { mode: "paper" });
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!stagesReached.current.has(stage)) {
      stagesReached.current.add(stage);
      track("ballot_sim_step_reached", {
        mode: "paper",
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

  useEffect(() => {
    if (stage === "write" && matchesCuteri(writeInValue)) setStage("ready");
  }, [writeInValue, stage]);

  function triggerNudge(msg: string) {
    const now = Date.now();
    if (now - lastNudgeAt.current < HINT_COOLDOWN_MS) return;
    lastNudgeAt.current = now;
    setNudge(msg);
  }

  function onDecoyClick(raceName: string) {
    triggerNudge(
      `That's the ${raceName} race. Look for "U.S. House of Representatives, District 1" below.`
    );
    track("ballot_sim_decoy_click", { mode: "paper", race: raceName, stage });
  }

  function onHouseBlockClick() {
    if (stage === "find") setStage("oval");
  }

  function onOvalClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setBubbleFilled(true);
    inputRef.current?.focus({ preventScroll: false });
    if (stage === "find" || stage === "oval") setStage("write");
  }

  function onInputFocus() {
    if (!bubbleFilled) setBubbleFilled(true);
    if (stage === "find" || stage === "oval") setStage("write");
  }

  function onSubmit() {
    if (!bubbleFilled || writeInValue.trim().length === 0) {
      triggerNudge(
        "Fill in the oval and write the candidate name to finish your practice vote."
      );
      track("ballot_sim_submit_blocked", {
        mode: "paper",
        bubble_filled: bubbleFilled,
        has_name: writeInValue.trim().length > 0,
      });
      return;
    }
    const match = matchesCuteri(writeInValue);
    track("ballot_sim_completed", {
      mode: "paper",
      name_match: match,
      total_seconds: Math.round((Date.now() - startedAt.current) / 1000),
    });
    setSubmitted(true);
  }

  function reset() {
    setStage("find");
    setSubmitted(false);
    setBubbleFilled(false);
    setWriteInValue("");
    setNudge(null);
    lastNudgeAt.current = 0;
    stagesReached.current = new Set(["find"]);
    startedAt.current = Date.now();
  }

  const nameMatch = matchesCuteri(writeInValue);

  if (submitted) {
    return <SuccessState writeInValue={writeInValue} onReset={reset} mode="paper" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressiveHint stage={stage} nudge={nudge} />

      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
        <div className="bg-yellow-100 border-b-2 border-yellow-400 px-6 py-2">
          <p className="text-[11px] text-yellow-900 font-bold uppercase tracking-wider text-center">
            Practice Ballot - Simulated for Training Only. No Vote Will Be Cast.
          </p>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-b border-gray-300 text-center">
          <p className="text-[11px] text-gray-600 uppercase tracking-[0.18em] font-mono">
            Sample Absentee Ballot
          </p>
          <p className="text-xs text-gray-500 font-mono">
            General Election - November 3, 2026
          </p>
          <p className="text-xs text-gray-500 font-mono">
            U.S. House of Representatives, District 1 - State of South Carolina
          </p>
        </div>

        <div className="px-6 py-3 border-b border-gray-200 bg-white">
          <p className="text-[11px] text-gray-700 leading-relaxed">
            <strong>Instructions:</strong> Completely fill in the oval{" "}
            <span className="inline-block w-3 h-3 rounded-full border border-gray-700 align-middle" />{" "}
            to the left of your choice. To vote for a person not listed, fill
            in the oval on the &ldquo;Write-in&rdquo; line and write the
            candidate&rsquo;s name on that line.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          <DecoyRace
            title="United States Senator"
            instruction="Vote for One"
            candidates={[
              { name: "[Republican Candidate]", party: "REP" },
              { name: "[Democratic Candidate]", party: "DEM" },
            ]}
            onDecoyClick={() => onDecoyClick("U.S. Senator")}
          />

          <div
            onClick={onHouseBlockClick}
            className={`px-6 py-4 bg-navy/5 border-l-4 border-navy cursor-pointer transition-shadow ${
              stage === "find"
                ? "ring-2 ring-gold ring-offset-2 ring-offset-white animate-pulse"
                : ""
            }`}
            role="group"
            aria-label="U.S. House of Representatives, District 1 - your race"
          >
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-navy font-serif">
                U.S. House of Representatives, District 1
              </h4>
              <span className="text-[10px] text-navy/70 uppercase tracking-wider font-semibold">
                Vote for One
              </span>
            </div>
            <div className="space-y-1.5">
              <ReadOnlyCandidate name="[Republican Candidate]" party="Republican" />
              <ReadOnlyCandidate name="[Democratic Candidate]" party="Democratic" />

              <div className="pt-2 border-t border-dashed border-navy/30">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onOvalClick}
                    aria-label={
                      bubbleFilled
                        ? "Write-in oval filled. Type Clayton Cuteri."
                        : "Fill in write-in oval"
                    }
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      bubbleFilled
                        ? "bg-navy border-navy"
                        : stage === "oval"
                        ? "border-navy ring-2 ring-gold ring-offset-1 ring-offset-white animate-pulse"
                        : "border-navy hover:bg-navy/10"
                    }`}
                  >
                    {bubbleFilled && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                  <label className="text-[10px] text-navy/70 uppercase tracking-wider font-semibold">
                    Write-in
                  </label>
                  <div
                    className={`flex-1 border-b-2 pb-0.5 transition-colors ${
                      stage === "write" ? "border-gold" : "border-navy/40"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={writeInValue}
                      onChange={(e) => setWriteInValue(e.target.value)}
                      onFocus={onInputFocus}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="write name here"
                      inputMode="text"
                      autoCapitalize="words"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full bg-transparent text-charcoal text-xl sm:text-2xl focus:outline-none placeholder:text-gray-400 placeholder:text-base"
                      style={{ fontFamily: "var(--font-caveat), cursive" }}
                    />
                  </div>
                </div>
                {writeInValue.length > 0 && (
                  <p
                    className={`mt-1 text-[11px] font-medium pl-9 ${
                      nameMatch ? "text-green-700" : "text-charcoal/50"
                    }`}
                    aria-live="polite"
                  >
                    {nameMatch
                      ? "Looks good - we can read Clayton Cuteri"
                      : "Keep going - spell Clayton Cuteri (C-U-T-E-R-I)"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DecoyRace
            title="Governor"
            instruction="Vote for One"
            candidates={[
              { name: "[Candidate]", party: "REP" },
              { name: "[Candidate]", party: "DEM" },
            ]}
            onDecoyClick={() => onDecoyClick("Governor")}
          />

          <DecoyRace
            title="State Senate"
            instruction="Vote for One"
            candidates={[{ name: "[Local Candidate]", party: "" }]}
            onDecoyClick={() => onDecoyClick("State Senate")}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onSubmit}
            disabled={stage !== "ready"}
            className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors ${
              stage === "ready"
                ? "bg-navy text-white hover:bg-navy-dark"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Cast Practice Vote
          </button>
          <p className="text-center text-[10px] text-charcoal/50 mt-2 uppercase tracking-wider">
            Practice only &middot; nothing is submitted
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Progressive hint bar ---
function ProgressiveHint({
  stage,
  nudge,
}: {
  stage: Stage;
  nudge: string | null;
}) {
  const steps: { key: Stage; label: string }[] = [
    { key: "find", label: "Find U.S. House of Representatives, District 1" },
    { key: "oval", label: "Fill in the Write-in oval" },
    { key: "write", label: "Write Clayton Cuteri" },
    { key: "ready", label: "Cast your practice vote" },
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
                    ? "bg-green-600 text-white"
                    : isActive
                    ? "bg-navy text-white"
                    : "bg-navy/15 text-navy/60"
                }`}
              >
                {isDone ? "\u2713" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-4 sm:w-6 ${
                    isDone ? "bg-green-600" : "bg-navy/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-navy/70">
          Step {activeIndex + 1} of {steps.length}
        </p>
        <p className="mt-1 text-charcoal text-xl sm:text-2xl font-serif flex items-center justify-center gap-2">
          {steps[activeIndex].label}
          {stage === "find" && (
            <ArrowDown size={22} className="text-navy animate-bounce" />
          )}
        </p>
      </div>

      <div className="h-8 mt-2 text-center" aria-live="polite" role="status">
        {nudge && (
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm px-4 py-1.5 rounded">
            <AlertCircle size={14} />
            <span>{nudge}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadOnlyCandidate({ name, party }: { name: string; party: string }) {
  return (
    <div
      className="flex items-center gap-3 py-1.5"
      aria-hidden="true"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-700 font-mono">{name}</span>
      <span className="text-[10px] text-gray-500 uppercase ml-auto">{party}</span>
    </div>
  );
}

function DecoyRace({
  title,
  instruction,
  candidates,
  onDecoyClick,
}: {
  title: string;
  instruction: string;
  candidates: { name: string; party: string }[];
  onDecoyClick: () => void;
}) {
  return (
    <div
      onClick={onDecoyClick}
      className="px-6 py-3 cursor-default hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-serif">
          {title}
        </h4>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
          {instruction}
        </span>
      </div>
      <div className="space-y-1">
        {candidates.map((c, i) => (
          <div key={i} className="flex items-center gap-3 py-0.5">
            <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-mono">{c.name}</span>
            {c.party && (
              <span className="text-[10px] text-gray-500 uppercase ml-auto">
                {c.party}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
