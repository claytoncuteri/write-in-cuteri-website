// Ballot practice simulator  -  wrapper that lets voters switch between the
// BMD (ExpressVote touchscreen) and paper (absentee-by-mail) flows.
//
// BMD is the default because ~96% of SC-01 voters cast their ballot on an
// ES&S ExpressVote machine at their polling place. The paper ballot is
// what absentee-by-mail voters see, kept accessible behind a toggle.

"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { BMDSimulator } from "./BallotSimulatorBMD";
import { PaperBallot } from "./BallotSimulatorPaper";
import type { BallotMode } from "./BallotSimulatorShared";

export function BallotSimulator() {
  const [mode, setMode] = useState<BallotMode>("bmd");

  function switchMode(next: BallotMode) {
    if (next === mode) return;
    track("ballot_sim_mode_switched", { from: mode, to: next });
    setMode(next);
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="max-w-3xl mx-auto mb-6">
        <div
          role="tablist"
          aria-label="Ballot practice mode"
          className="bg-navy/5 border border-navy/20 rounded-lg p-1 flex text-sm"
        >
          <ModeTab
            active={mode === "bmd"}
            onClick={() => switchMode("bmd")}
            label="In Person"
            sublabel="ExpressVote touchscreen"
          />
          <ModeTab
            active={mode === "paper"}
            onClick={() => switchMode("paper")}
            label="Absentee by Mail"
            sublabel="Paper ballot"
          />
        </div>
        <p className="text-center text-charcoal/60 text-xs mt-2">
          Not sure which one you&rsquo;ll use? Most SC-01 voters vote in person -
          start with that.
        </p>
      </div>

      {/* Remount on mode switch so stage state and analytics restart cleanly */}
      {mode === "bmd" ? <BMDSimulator key="bmd" /> : <PaperBallot key="paper" />}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 px-3 sm:px-4 py-2.5 rounded-md font-semibold transition-colors min-h-[48px] ${
        active
          ? "bg-navy text-white shadow"
          : "text-navy/80 hover:text-navy hover:bg-navy/10"
      }`}
    >
      <span className="block text-sm sm:text-base">{label}</span>
      <span
        className={`block text-[10px] sm:text-xs font-normal ${
          active ? "text-white/80" : "text-navy/60"
        }`}
      >
        {sublabel}
      </span>
    </button>
  );
}
