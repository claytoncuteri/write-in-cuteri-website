// Shared helpers + components used by both the paper and BMD practice
// ballots. Kept deliberately small so bundle cost is minimal for voters who
// only interact with one mode.

"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

export type BallotMode = "bmd" | "paper";

/**
 * Fuzzy match on common misspellings of "Cuteri". We want this forgiving
 * because a voter who wrote "Cutteri" on a real ballot would still be
 * counted by a human tabulator, so the simulator should celebrate them.
 */
export function matchesCuteri(input: string): boolean {
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

interface SuccessStateProps {
  writeInValue: string;
  onReset: () => void;
  mode: BallotMode;
}

/**
 * Shared success screen. Same message regardless of mode; the only
 * difference is the button says "Practice Again" and resets the parent.
 */
export function SuccessState({ writeInValue, onReset, mode }: SuccessStateProps) {
  const nameMatch = matchesCuteri(writeInValue);
  const modeCopy =
    mode === "bmd"
      ? "On November 3, 2026, do exactly this on the ExpressVote touchscreen at your polling place and your vote for Clayton Cuteri will count."
      : "On November 3, 2026, do exactly this on your real SC-01 absentee ballot and your vote for Clayton Cuteri will count.";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
        <div className="bg-yellow-100 border-b-2 border-yellow-400 px-6 py-2">
          <p className="text-[11px] text-yellow-900 font-bold uppercase tracking-wider text-center">
            Practice Ballot - Simulated for Training Only. No Vote Will Be Cast.
          </p>
        </div>
        <div className="p-8 text-center">
          {nameMatch ? (
            <>
              <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
              <p className="text-xs uppercase tracking-wider text-charcoal/50 font-semibold">
                Practice only - this is not a real vote
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
                . <strong>{modeCopy}</strong>
              </p>
              <p className="mt-3 text-sm text-charcoal/60 max-w-md mx-auto">
                This practice tool did not submit anything. No vote was cast.
              </p>
            </>
          ) : (
            <>
              <AlertCircle size={48} className="text-yellow-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-yellow-800 font-serif">
                Close - check the spelling
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
            onClick={onReset}
            className="mt-6 px-6 py-2.5 text-navy border-2 border-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}
