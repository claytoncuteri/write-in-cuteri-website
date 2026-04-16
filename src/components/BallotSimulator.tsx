"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

type Step = "find" | "select" | "write" | "bubble" | "done";

export function BallotSimulator() {
  const [step, setStep] = useState<Step>("find");
  const [writeInValue, setWriteInValue] = useState("");
  const [bubbleFilled, setBubbleFilled] = useState(false);
  const [showError, setShowError] = useState(false);

  function handleSubmit() {
    if (!bubbleFilled) {
      setShowError(true);
      return;
    }
    if (writeInValue.trim().length === 0) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setStep("done");
  }

  function reset() {
    setStep("find");
    setWriteInValue("");
    setBubbleFilled(false);
    setShowError(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        {(["find", "select", "write", "bubble", "done"] as Step[]).map(
          (s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                (["find", "select", "write", "bubble", "done"] as Step[]).indexOf(step) >= i
                  ? "bg-navy"
                  : "bg-gray-200"
              }`}
            />
          )
        )}
      </div>

      {/* Simulated ballot */}
      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
        {/* Ballot header */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">
            Official General Election Ballot
          </p>
          <p className="text-xs text-gray-400 font-mono">
            November 3, 2026 &mdash; South Carolina
          </p>
        </div>

        <div className="p-6">
          {step === "find" && (
            <div>
              <p className="text-sm text-charcoal/70 mb-4">
                Your ballot has multiple races. Find the U.S. House race for
                your district.
              </p>
              <div className="space-y-3">
                {/* Fake ballot races */}
                <div className="border border-gray-200 rounded p-3 opacity-50">
                  <p className="text-xs text-gray-400 uppercase font-mono">
                    U.S. Senate
                  </p>
                  <p className="text-sm text-gray-400">
                    Tim Scott (R) / [Democratic Candidate]
                  </p>
                </div>
                <button
                  onClick={() => setStep("select")}
                  className="w-full border-2 border-navy rounded p-3 text-left hover:bg-navy/5 transition-colors cursor-pointer"
                >
                  <p className="text-xs text-navy uppercase font-mono font-bold">
                    U.S. House of Representatives, District 1
                  </p>
                  <p className="text-sm text-charcoal/70">
                    Click here to vote in this race
                  </p>
                </button>
                <div className="border border-gray-200 rounded p-3 opacity-50">
                  <p className="text-xs text-gray-400 uppercase font-mono">
                    Governor
                  </p>
                  <p className="text-sm text-gray-400">
                    [Candidate] (R) / [Candidate] (D)
                  </p>
                </div>
                <div className="border border-gray-200 rounded p-3 opacity-50">
                  <p className="text-xs text-gray-400 uppercase font-mono">
                    State Senate
                  </p>
                  <p className="text-sm text-gray-400">
                    [Local candidates]
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "select" && (
            <div>
              <p className="text-xs text-navy uppercase font-mono font-bold mb-3">
                U.S. House of Representatives, District 1
              </p>
              <p className="text-sm text-charcoal/70 mb-4">
                You will see the listed candidates. Look for the write-in
                option at the bottom.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 border border-gray-200 rounded p-3 opacity-50">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm text-gray-400">
                    [Republican Candidate] (R)
                  </span>
                </div>
                <div className="flex items-center gap-3 border border-gray-200 rounded p-3 opacity-50">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm text-gray-400">
                    [Democratic Candidate] (D)
                  </span>
                </div>
                <button
                  onClick={() => setStep("write")}
                  className="w-full flex items-center gap-3 border-2 border-navy rounded p-3 hover:bg-navy/5 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-navy" />
                  <span className="text-sm text-navy font-semibold">
                    Write-in: _______________
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === "write" && (
            <div>
              <p className="text-xs text-navy uppercase font-mono font-bold mb-1">
                U.S. House of Representatives, District 1
              </p>
              <p className="text-sm text-charcoal/70 mb-4">
                Type the name in the write-in field, then fill in the bubble.
              </p>

              <div className="border-2 border-navy rounded p-4 bg-navy/5">
                <p className="text-xs text-navy font-mono mb-2">Write-in:</p>
                <input
                  type="text"
                  value={writeInValue}
                  onChange={(e) => setWriteInValue(e.target.value)}
                  placeholder="Type the candidate name here..."
                  className="w-full px-3 py-2 border-b-2 border-navy bg-transparent text-charcoal font-mono text-lg focus:outline-none"
                  autoFocus
                  style={{ fontFamily: "var(--font-caveat), cursive" }}
                />

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setBubbleFilled(!bubbleFilled);
                      if (!bubbleFilled) setStep("bubble");
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center ${
                      bubbleFilled
                        ? "bg-navy border-navy"
                        : "border-navy hover:bg-navy/10"
                    }`}
                  >
                    {bubbleFilled && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </button>
                  <span className="text-sm text-charcoal/70">
                    Fill in the bubble to confirm your write-in vote
                  </span>
                </div>
              </div>

              {showError && !bubbleFilled && (
                <div className="mt-3 flex items-center gap-2 text-red-accent text-sm">
                  <AlertCircle size={16} />
                  <span>
                    You must fill in the bubble for your write-in vote to count.
                    This is the most common mistake.
                  </span>
                </div>
              )}

              {showError && writeInValue.trim().length === 0 && (
                <div className="mt-3 flex items-center gap-2 text-red-accent text-sm">
                  <AlertCircle size={16} />
                  <span>Write a name in the field above.</span>
                </div>
              )}
            </div>
          )}

          {step === "bubble" && (
            <div>
              <p className="text-xs text-navy uppercase font-mono font-bold mb-1">
                U.S. House of Representatives, District 1
              </p>
              <p className="text-sm text-charcoal/70 mb-4">
                Review your write-in vote and submit.
              </p>

              <div className="border-2 border-navy rounded p-4 bg-navy/5">
                <p className="text-xs text-navy font-mono mb-2">Write-in:</p>
                <p
                  className="text-2xl text-charcoal"
                  style={{ fontFamily: "var(--font-caveat), cursive" }}
                >
                  {writeInValue || "(empty)"}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 bg-navy border-navy flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <span className="text-sm text-green-700 font-medium">
                    Bubble filled
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="mt-4 w-full px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-dark transition-colors"
              >
                Cast Your Vote
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              {writeInValue.toLowerCase().includes("cuteri") ? (
                <>
                  <CheckCircle
                    size={48}
                    className="text-green-600 mx-auto mb-3"
                  />
                  <h3 className="text-xl font-bold text-green-800 font-serif">
                    Your vote would count!
                  </h3>
                  <p className="mt-2 text-charcoal/70 text-sm max-w-sm mx-auto">
                    You wrote &ldquo;{writeInValue}&rdquo; and filled in the
                    bubble. On November 3, do exactly this and your vote for
                    Clayton Cuteri will be counted.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle
                    size={48}
                    className="text-yellow-600 mx-auto mb-3"
                  />
                  <h3 className="text-xl font-bold text-yellow-800 font-serif">
                    Close, but check the name
                  </h3>
                  <p className="mt-2 text-charcoal/70 text-sm max-w-sm mx-auto">
                    You wrote &ldquo;{writeInValue}&rdquo;. To vote for Clayton,
                    write <strong>Clayton Cuteri</strong> (C-U-T-E-R-I). Try
                    again to practice.
                  </p>
                </>
              )}
              <button
                onClick={reset}
                className="mt-4 px-6 py-2 text-navy border-2 border-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors"
              >
                Practice Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step instruction */}
      <p className="text-center text-xs text-charcoal/50 mt-4">
        {step === "find" && "Step 1 of 4: Find the U.S. House District 1 race"}
        {step === "select" && "Step 2 of 4: Select the write-in option"}
        {step === "write" && "Step 3 of 4: Write the name and fill the bubble"}
        {step === "bubble" && "Step 4 of 4: Review and submit"}
        {step === "done" && "Practice complete! Try again if you want."}
      </p>
    </div>
  );
}
