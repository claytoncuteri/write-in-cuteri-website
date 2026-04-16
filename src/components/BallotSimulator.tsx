"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, AlertCircle, ArrowDown } from "lucide-react";
import { track } from "@/lib/analytics";

/**
 * Single-page practice ballot for SC-01 write-in voters.
 *
 * UX principles:
 *  - Whole ballot visible at full opacity (no dimming).
 *  - Progressive hint bar hand-holds through 4 stages:
 *      1. find  -> "Find U.S. House of Representatives, District 1"
 *      2. oval  -> "Fill in the Write-in oval"
 *      3. write -> "Write Clayton Cuteri on the line"
 *      4. ready -> "Cast your practice vote"
 *  - Clicking a decoy race does NOT advance; it fires a gentle rate-limited nudge.
 *  - Clicking anywhere in the U.S. House D1 block advances find -> oval.
 *  - Clicking the Write-in oval fills it, focuses the input, advances oval -> write.
 *  - Typing a name that fuzzy-matches Cuteri advances write -> ready.
 *  - Submitting the practice vote transitions to the success screen.
 */

type Stage = "find" | "oval" | "write" | "ready";

const HINT_COOLDOWN_MS = 8_000;
const NUDGE_DISMISS_MS = 4_000;

function matchesCuteri(input: string): boolean {
  const s = input.toLowerCase().replace(/[^a-z]/g, "");
  if (!s) return false;
  return (
    s.includes("cuteri") ||
    s.includes("cutteri") ||
    s.includes("cuturi") ||
    s.includes("cuterri") ||
    s.includes("cutari")
  );
}

export function BallotSimulator() {
  const [stage, setStage] = useState<Stage>("find");
  const [bubbleFilled, setBubbleFilled] = useState(false);
  const [writeInValue, setWriteInValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const lastNudgeAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const houseBlockRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number>(Date.now());
  const stagesReached = useRef<Set<Stage>>(new Set(["find"]));

  // One-time "ballot_sim_started" event on mount.
  useEffect(() => {
    track("ballot_sim_started");
    startedAt.current = Date.now();
  }, []);

  // Fire a step_reached event the first time we land on each stage.
  useEffect(() => {
    if (!stagesReached.current.has(stage)) {
      stagesReached.current.add(stage);
      track("ballot_sim_step_reached", {
        stage,
        seconds_since_start: Math.round((Date.now() - startedAt.current) / 1000),
      });
    }
  }, [stage]);

  // Dismiss nudge after a short window
  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(() => setNudge(null), NUDGE_DISMISS_MS);
    return () => clearTimeout(t);
  }, [nudge]);

  // Advance write -> ready when the name fuzzy-matches
  useEffect(() => {
    if (stage === "write" && matchesCuteri(writeInValue)) setStage("ready");
  }, [writeInValue, stage]);

  function triggerNudge(msg: string) {
    const now = Date.now();
    if (now - lastNudgeAt.current < HINT_COOLDOWN_MS) return;
    lastNudgeAt.current = now;
    setNudge(msg);
  }

  // Clicking a decoy race: rate-limited nudge, no stage advance
  function onDecoyClick(raceName: string) {
    triggerNudge(
      `That's the ${raceName} race. Look for "U.S. House of Representatives, District 1" below.`
    );
    track("ballot_sim_decoy_click", { race: raceName, stage });
  }

  // Clicking anywhere in the U.S. House D1 block (but NOT the oval/input)
  // advances stage from find -> oval.
  function onHouseBlockClick(e: React.MouseEvent<HTMLDivElement>) {
    // If they clicked the oval button or typed in the input, those have their
    // own handlers; stopPropagation is used on those to prevent double-firing.
    if (stage === "find") setStage("oval");
  }

  // Oval click: fill bubble + sync-focus input + advance stage
  // (synchronous focus is required for iOS Safari to open the virtual keyboard)
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
        bubble_filled: bubbleFilled,
        has_name: writeInValue.trim().length > 0,
      });
      return;
    }
    const match = matchesCuteri(writeInValue);
    track("ballot_sim_completed", {
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
  }

  const nameMatch = matchesCuteri(writeInValue);

  // -------- SUCCESS STATE --------
  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
          <div className="bg-yellow-100 border-b-2 border-yellow-400 px-6 py-2">
            <p className="text-[11px] text-yellow-900 font-bold uppercase tracking-wider text-center">
              Practice Ballot &mdash; Simulated for Training Only. No Vote Will Be Cast.
            </p>
          </div>
          <div className="p-8 text-center">
            {nameMatch ? (
              <>
                <CheckCircle
                  size={48}
                  className="text-green-600 mx-auto mb-3"
                />
                <p className="text-xs uppercase tracking-wider text-charcoal/50 font-semibold">
                  Practice only &mdash; this is not a real vote
                </p>
                <h3 className="mt-2 text-2xl font-bold text-green-800 font-serif">
                  Nice! You&rsquo;ve got the steps down.
                </h3>
                <p className="mt-3 text-charcoal/80 max-w-md mx-auto">
                  You filled in the oval and wrote{" "}
                  <span
                    className="text-charcoal font-semibold"
                    style={{ fontFamily: "var(--font-caveat), cursive" }}
                  >
                    &ldquo;{writeInValue}&rdquo;
                  </span>
                  . On <strong>November 3, 2026</strong>, do exactly this on
                  your real SC-01 ballot and your vote for Clayton Cuteri will
                  count.
                </p>
                <p className="mt-3 text-sm text-charcoal/60 max-w-md mx-auto">
                  This practice tool did not submit anything. No vote was
                  cast.
                </p>
              </>
            ) : (
              <>
                <AlertCircle
                  size={48}
                  className="text-yellow-600 mx-auto mb-3"
                />
                <h3 className="text-2xl font-bold text-yellow-800 font-serif">
                  Close &mdash; check the spelling
                </h3>
                <p className="mt-3 text-charcoal/80 max-w-md mx-auto">
                  You wrote &ldquo;{writeInValue}&rdquo;. To vote for Clayton,
                  write <strong>Clayton Cuteri</strong>{" "}
                  <span className="text-charcoal/60">(C-U-T-E-R-I)</span>. Try
                  the practice ballot again.
                </p>
              </>
            )}
            <button
              onClick={reset}
              className="mt-6 px-6 py-2.5 text-navy border-2 border-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------- INTERACTIVE BALLOT STATE --------
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progressive hint bar  -  hand-holds through each step */}
      <ProgressiveHint stage={stage} nudge={nudge} />

      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
        {/* PRACTICE banner */}
        <div className="bg-yellow-100 border-b-2 border-yellow-400 px-6 py-2">
          <p className="text-[11px] text-yellow-900 font-bold uppercase tracking-wider text-center">
            Practice Ballot &mdash; Simulated for Training Only. No Vote Will Be Cast.
          </p>
        </div>

        {/* Ballot header (modeled on SC sample ballot) */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-300 text-center">
          <p className="text-[11px] text-gray-600 uppercase tracking-[0.18em] font-mono">
            Sample Official Ballot
          </p>
          <p className="text-xs text-gray-500 font-mono">
            General Election &mdash; November 3, 2026
          </p>
          <p className="text-xs text-gray-500 font-mono">
            Congressional District 1 &mdash; State of South Carolina
          </p>
        </div>

        {/* Voter instructions */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white">
          <p className="text-[11px] text-gray-700 leading-relaxed">
            <strong>Instructions:</strong> Completely fill in the oval{" "}
            <span className="inline-block w-3 h-3 rounded-full border border-gray-700 align-middle" />{" "}
            to the left of your choice. To vote for a person not listed, fill
            in the oval on the &ldquo;Write-in&rdquo; line and write the
            candidate&rsquo;s name on that line.
          </p>
        </div>

        {/* Races */}
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

          {/* ACTIVE: U.S. House, District 1 */}
          <div
            ref={houseBlockRef}
            onClick={onHouseBlockClick}
            className={`px-6 py-4 bg-navy/5 border-l-4 border-navy cursor-pointer transition-shadow ${
              stage === "find"
                ? "ring-2 ring-gold ring-offset-2 ring-offset-white animate-pulse"
                : ""
            }`}
            role="group"
            aria-label="U.S. House of Representatives District 1  -  your race"
          >
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-navy font-serif">
                United States House of Representatives, District 1
              </h4>
              <span className="text-[10px] text-navy/70 uppercase tracking-wider font-semibold">
                Vote for One
              </span>
            </div>
            <div className="space-y-1.5">
              <ReadOnlyCandidate name="[Republican Candidate]" party="Republican" />
              <ReadOnlyCandidate name="[Democratic Candidate]" party="Democratic" />

              {/* Write-in row: the only interactive oval + input */}
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
                      stage === "write"
                        ? "border-gold"
                        : "border-navy/40"
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
                      ? "Looks good \u2014 we can read Clayton Cuteri"
                      : "Keep going \u2014 spell Clayton Cuteri (C-U-T-E-R-I)"}
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

        {/* Submit */}
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

      {/* BMD callout: in-person voters will see a touchscreen, not paper */}
      <div className="mt-6 bg-white/10 border border-white/20 rounded-lg p-4 text-white/80 text-sm max-w-3xl mx-auto">
        <p className="font-semibold text-white mb-1">
          Voting in person on November 3?
        </p>
        <p className="leading-relaxed">
          SC uses a touchscreen machine (ES&amp;S ExpressVote XL) at the polls.
          The steps are the same: find the U.S. House District 1 race, tap the
          <strong> Write-in </strong>box, and type{" "}
          <strong>Clayton Cuteri</strong> on the on-screen keyboard. The
          machine fills in the oval for you and prints a paper record you feed
          into the scanner. No pen needed. If you&rsquo;re voting absentee by
          mail, the above paper-ballot version is what you&rsquo;ll see.
        </p>
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
    { key: "find", label: "Find U.S. House, District 1" },
    { key: "oval", label: "Fill in the Write-in oval" },
    { key: "write", label: "Write Clayton Cuteri" },
    { key: "ready", label: "Cast your practice vote" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === stage);

  return (
    <div className="mb-4">
      {/* Step pills */}
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

      {/* Current instruction, big and friendly */}
      <div className="text-center">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold">
          Step {activeIndex + 1} of {steps.length}
        </p>
        <p className="mt-1 text-white text-xl sm:text-2xl font-serif flex items-center justify-center gap-2">
          {steps[activeIndex].label}
          {stage === "find" && (
            <ArrowDown size={22} className="text-gold animate-bounce" />
          )}
        </p>
      </div>

      {/* Nudge (when user clicks a decoy) */}
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

// --- Read-only candidate row (inside the active race) ---
function ReadOnlyCandidate({ name, party }: { name: string; party: string }) {
  return (
    <div
      className="flex items-center gap-3 py-1.5"
      aria-hidden="true"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-700 font-mono">{name}</span>
      <span className="text-[10px] text-gray-500 uppercase ml-auto">
        {party}
      </span>
    </div>
  );
}

// --- Decoy race (read-only, full opacity, nudges on click) ---
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
