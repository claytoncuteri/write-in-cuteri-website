"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import {
  Clock,
  ShieldCheck,
  DollarSign,
  Share2,
  MessageSquare,
} from "lucide-react";
import { track, identifyByEmail } from "@/lib/analytics";
import { DONATIONS_LIVE } from "./flags";

// Anedot hosted donation page. Ends up pre-filling `amount` when linked with
// `?amount=N`. See help.anedot.com/knowledge/url-parameter.
const ANEDOT_URL = "https://secure.anedot.com/cuteri-for-americans/donate";

// Research-backed ladder: ActBlue Q1 2024 median political gift is $10-$20,
// average $42.73. $50 is pre-selected (adjusted up from research default $25)
// because Clayton's 700K-follower podcast audience sits between political
// cold traffic and creator/patron economics, warmer than ActBlue baseline.
// See the /donate plan file for full rationale.
const PRESET_AMOUNTS = [10, 25, 50, 100, 250] as const;
const PRESET_DEFAULT = 50;
const CHIP_IN_AMOUNT = 5;

function anedotLink(amount?: number): string {
  return amount ? `${ANEDOT_URL}?amount=${amount}` : ANEDOT_URL;
}

// FEC 2026 individual per-election limit. Use as a client-side sanity
// cap on the custom-amount input. Anedot enforces server-side, but
// stopping obvious-garbage (e.g. $99,999) before we hand off reduces
// confused donors bouncing on Anedot's error page.
const FEC_MAX_AMOUNT = 3500;

export function DonateClient() {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  // `selectedAmount` tracks which tile is active in the radiogroup. Two
  // states: one of PRESET_AMOUNTS, or the sentinel "custom" meaning the
  // donor is typing their own value in the last tile. Default $50 mirrors
  // the "Most Common" pill and reduces clicks-to-donate to one for donors
  // who accept the suggested amount.
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(
    PRESET_DEFAULT,
  );
  const customInputRef = useRef<HTMLInputElement>(null);
  const showLive = DONATIONS_LIVE;

  async function handleEmailSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailSubmitting(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const smsOptIn = phone.trim().length > 0 && data.get("smsOptIn") === "on";
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tag: "donor",
          sourcePage: "/donate",
          fields: {
            ...(phone ? { phone } : {}),
            ...(smsOptIn
              ? {
                  sms_opt_in: "yes",
                  sms_opt_in_at: new Date().toISOString(),
                }
              : {}),
          },
        }),
      });
      if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
      await identifyByEmail(email, { form_type: "donor_interest" });
      track("signup_form_submitted", {
        form_type: "donor_interest",
        source_page: "/donate",
      });
      setEmailSubmitted(true);
    } catch {
      track("signup_form_error", { form_type: "donor_interest" });
      alert("Something went wrong. Please try again.");
    } finally {
      setEmailSubmitting(false);
    }
  }

  const customAmountNum = Number(customAmount) || 0;
  const customOverLimit = customAmountNum > FEC_MAX_AMOUNT;
  const customCanSubmit = customAmountNum >= 1 && !customOverLimit;

  // Effective amount the primary submit will send to Anedot. Null when the
  // donor picked "custom" but hasn't typed a valid value. That state
  // disables the submit button.
  const effectiveAmount: number | null =
    selectedAmount === "custom"
      ? customCanSubmit
        ? Math.floor(customAmountNum)
        : null
      : selectedAmount;
  const canDonate = effectiveAmount !== null;

  function handlePresetSelect(amount: number) {
    setSelectedAmount(amount);
    track("donate_amount_click", {
      amount,
      source_page: "/donate",
      variant: "preset",
    });
  }

  function handleCustomSelect() {
    setSelectedAmount("custom");
    track("donate_amount_click", {
      amount: customAmountNum || 0,
      source_page: "/donate",
      variant: "custom",
    });
    // Pull focus into the input so typing is immediately captured on the
    // tap/click that picked the tile.
    setTimeout(() => customInputRef.current?.focus(), 0);
  }

  // Arrow-key navigation across the radio tiles. Order: PRESET_AMOUNTS
  // then "custom" as the final tile. Wraps.
  function handleTileKeyDown(
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const total = PRESET_AMOUNTS.length + 1; // +1 for custom
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % total;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (index - 1 + total) % total;
    else return;
    e.preventDefault();
    if (next < PRESET_AMOUNTS.length) {
      handlePresetSelect(PRESET_AMOUNTS[next]);
    } else {
      handleCustomSelect();
    }
  }

  function handleDonateSubmit() {
    if (!canDonate || effectiveAmount === null) return;
    track("donate_submit", {
      amount: effectiveAmount,
      source_page: "/donate",
      variant: selectedAmount === "custom" ? "custom" : "preset",
    });
    window.open(
      `${ANEDOT_URL}?amount=${effectiveAmount}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleMobileShare() {
    track("donate_share_click", { source_page: "/donate" });
    const shareData = {
      title: "Donate to Clayton Cuteri for Congress",
      text: "Support Clayton Cuteri for U.S. House SC-01.",
      url: ANEDOT_URL,
    };
    if (typeof navigator === "undefined") return;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ANEDOT_URL);
        setShareMsg("Link copied to clipboard");
        setTimeout(() => setShareMsg(null), 2500);
        return;
      }
      // Last-resort fallback: just open the Anedot page in a new tab.
      window.open(ANEDOT_URL, "_blank", "noopener,noreferrer");
    } catch {
      // User cancelled share sheet, no action needed.
    }
  }

  return (
    <>
      {showLive ? (
        /* ===== LIVE DONATION VIEW ===== */
        <Section>
          <div id="donate-now" className="max-w-2xl mx-auto text-center scroll-mt-24">
            <DollarSign size={48} className="text-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-charcoal font-serif">
              Make a Contribution
            </h2>
            <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
              Your contribution directly funds voter education, community
              events, and campaign outreach across District 1.
            </p>

            {/* Single-submit donation flow. Research (ActBlue / WinRed /
                M+R Benchmarks 2025): picking an amount and submitting in
                one action minimizes clicks from landing to Anedot checkout.
                Grid tiles are radiogroup-style selectors. The "Other" tile
                turns into a live text input when selected. The single
                primary CTA below the grid is the only thing that opens
                Anedot, so the donor always lands on checkout with an
                amount pre-filled. */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-charcoal mb-4 uppercase tracking-wider">
                Pick an amount
              </p>
              <div
                role="radiogroup"
                aria-label="Donation amount"
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto"
              >
                {PRESET_AMOUNTS.map((amount, idx) => {
                  const isDefault = amount === PRESET_DEFAULT;
                  const isSelected = selectedAmount === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => handlePresetSelect(amount)}
                      onKeyDown={(e) => handleTileKeyDown(e, idx)}
                      className={
                        "relative inline-flex h-12 items-center justify-center px-4 font-semibold rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy border-2 " +
                        (isSelected
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-navy border-navy hover:bg-navy/5")
                      }
                    >
                      ${amount}
                      {isDefault && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap">
                          Most Common
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* "Other" tile. Acts as a radio option when unselected; when
                    selected, reveals the inline text input. Clicking
                    anywhere inside the tile while unselected picks it and
                    focuses the input. */}
                {(() => {
                  const isSelected = selectedAmount === "custom";
                  const customIdx = PRESET_AMOUNTS.length;
                  return (
                    <div
                      role="radio"
                      aria-checked={isSelected}
                      aria-label="Custom donation amount"
                      aria-invalid={
                        isSelected && customOverLimit ? true : undefined
                      }
                      aria-describedby={
                        isSelected && customOverLimit
                          ? "custom-amount-error"
                          : undefined
                      }
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => {
                        if (!isSelected) handleCustomSelect();
                      }}
                      onKeyDown={(e) => {
                        // Only handle arrow keys when the tile itself has
                        // focus (not the nested input), otherwise typing
                        // digits in the input would fight with navigation.
                        if (e.target === e.currentTarget) {
                          handleTileKeyDown(
                            e as unknown as KeyboardEvent<HTMLButtonElement>,
                            customIdx,
                          );
                        }
                      }}
                      className={
                        "relative flex h-12 items-center rounded-lg border-2 overflow-hidden cursor-text focus:outline-none focus:ring-2 focus:ring-offset-2 " +
                        (isSelected
                          ? customOverLimit
                            ? "border-red-accent text-red-accent focus:ring-red-accent"
                            : "border-navy text-navy bg-navy/5 focus:ring-navy"
                          : "border-navy text-navy bg-white hover:bg-navy/5 focus:ring-navy")
                      }
                    >
                      {isSelected ? (
                        <>
                          <span
                            className="pl-3 pr-1 text-lg font-semibold select-none"
                            aria-hidden
                          >
                            $
                          </span>
                          {/* type="text" + inputMode="numeric": see rationale
                              in prior iteration: avoids wheel-mutating
                              the amount and hides spin buttons. */}
                          <input
                            ref={customInputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={customAmount}
                            onChange={(e) =>
                              setCustomAmount(
                                e.target.value.replace(/[^0-9]/g, ""),
                              )
                            }
                            placeholder="Amount"
                            aria-label="Custom donation amount in US dollars"
                            className="w-full min-w-0 bg-transparent text-lg font-semibold placeholder:text-navy/50 focus:outline-none pr-3"
                          />
                        </>
                      ) : (
                        <span className="w-full text-center text-lg font-semibold">
                          Other
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Inline validation error for the custom-amount input. Shown
                  only when the custom tile is active and the donor has typed
                  over the FEC per-election limit. Live-region so screen
                  readers announce it. */}
              {selectedAmount === "custom" && customOverLimit && (
                <p
                  id="custom-amount-error"
                  role="alert"
                  className="mt-3 text-sm text-red-accent font-medium text-center"
                >
                  Maximum contribution is $
                  {FEC_MAX_AMOUNT.toLocaleString()} per individual per
                  election (federal limit).
                </p>
              )}

              {/* Primary submit. Only entry point to Anedot from the amount
                  grid, so the donor always lands on checkout with a
                  preselected amount. */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleDonateSubmit}
                  disabled={!canDonate}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-white bg-navy hover:bg-navy-dark font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldCheck size={20} />
                  {canDonate && effectiveAmount !== null
                    ? `Donate $${effectiveAmount} Securely via Anedot`
                    : "Donate Securely via Anedot"}
                </button>
                <p className="text-xs text-charcoal/60 mt-3">
                  Apple Pay, Google Pay, PayPal, card, and ACH accepted.
                  Secure processing by Anedot.
                </p>
              </div>

              {/* Chip in $5: lowest-commitment entry point, below the
                  submit as a text link so it does not anchor the ask
                  downward. Still opens Anedot directly, since it acts as
                  its own "amount selected + submitted" shortcut. */}
              <div className="mt-5 text-center text-sm">
                <a
                  href={anedotLink(CHIP_IN_AMOUNT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("donate_submit", {
                      amount: CHIP_IN_AMOUNT,
                      source_page: "/donate",
                      variant: "chip_in",
                    })
                  }
                  className="text-navy hover:text-navy-dark underline underline-offset-4 font-medium"
                >
                  Or chip in ${CHIP_IN_AMOUNT}
                </a>
              </div>
            </div>

            {/* Text-to-give */}
            <div className="mt-10 bg-cream rounded-lg p-6 max-w-md mx-auto">
              <MessageSquare
                size={24}
                className="text-navy mx-auto mb-2"
                aria-hidden
              />
              <p className="text-charcoal font-semibold">
                Prefer to text? Text{" "}
                <span className="font-bold text-navy">CUTERI</span> to{" "}
                {/* On mobile this becomes an sms: link with body prefilled */}
                <a
                  href="sms:+18884448774?&body=CUTERI"
                  className="font-bold text-navy underline-offset-4 hover:underline"
                >
                  (888) 444-8774
                </a>
              </p>
              <p className="text-xs text-charcoal/60 mt-2">
                Message and data rates may apply.
              </p>
            </div>

            {/* QR code (desktop) + share button (mobile). Rationale: a donor
                viewing this page on mobile doesn't need to scan a QR pointing
                at the same page. Desktop donors benefit from the pivot to
                mobile for Apple/Google Pay checkout on Anedot. */}
            <div className="mt-8">
              <div className="hidden md:flex flex-col items-center">
                <Image
                  src="/images/donate-qr.png"
                  alt="QR code to open the Clayton Cuteri for Congress donation page on your phone"
                  width={180}
                  height={180}
                  className="rounded-lg border border-gray-200"
                />
                <p className="text-xs text-charcoal/60 mt-3 max-w-xs text-center">
                  Scan to donate from your phone. Apple Pay and Google Pay work
                  best on mobile.
                </p>
              </div>
              <div className="md:hidden">
                <button
                  onClick={handleMobileShare}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-colors"
                >
                  <Share2 size={16} />
                  Share the donate link
                </button>
                {shareMsg && (
                  <p className="text-xs text-green-700 mt-2">{shareMsg}</p>
                )}
              </div>
            </div>

            {/* Donor certification */}
            <div className="mt-10 bg-cream rounded-lg p-6 text-left max-w-md mx-auto">
              <h3 className="font-bold text-charcoal text-sm mb-3">
                By contributing, you certify that:
              </h3>
              <ul className="text-sm text-charcoal/70 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-navy font-bold mt-0.5">&#x2022;</span>
                  <span>You are a U.S. citizen or permanent resident</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-navy font-bold mt-0.5">&#x2022;</span>
                  <span>This contribution is from your own funds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-navy font-bold mt-0.5">&#x2022;</span>
                  <span>You are not a federal contractor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-navy font-bold mt-0.5">&#x2022;</span>
                  <span>You are at least 18 years old</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>
      ) : (
        /* ===== COMING SOON VIEW ===== */
        <Section>
          <div id="donate-now" className="max-w-2xl mx-auto text-center scroll-mt-24">
            <Clock size={48} className="text-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-charcoal font-serif">
              Donations Coming Soon
            </h2>
            <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
              We are completing FEC registration, obtaining our EIN, and
              setting up a compliant campaign bank account. Once those steps
              are finalized, online donations will open here.
            </p>
            <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
              Want to be the first to know?
            </p>

            {/* Email signup */}
            <div className="mt-6 bg-cream rounded-lg p-6 max-w-md mx-auto">
              <p className="text-sm font-medium text-charcoal mb-3">
                Get notified when donations open:
              </p>
              {emailSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium text-sm">
                    Check your inbox for a confirmation email. Once confirmed,
                    we will notify you when donations open.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailSignup} className="space-y-2 text-left">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                  {/* Phone is optional on the notify-when-open form. The
                      donate page's primary job is the donation itself;
                      this signup is secondary, so minimize friction. */}
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile phone (optional)"
                    autoComplete="tel"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                  <label className="flex items-start gap-2 text-[11px] text-charcoal/70 leading-snug">
                    <input
                      type="checkbox"
                      name="smsOptIn"
                      className="mt-0.5 h-4 w-4 text-navy border-gray-300 rounded focus:ring-navy"
                    />
                    <span>
                      Text me when donations open and for ballot-day
                      updates from Cuteri for Americans. Msg &amp; data
                      rates may apply. Max 10 msgs/month. Reply STOP to
                      unsubscribe, HELP for help.
                    </span>
                  </label>
                  <CTAButton
                    variant="primary"
                    type="submit"
                    className="text-sm px-4 py-2.5 w-full"
                  >
                    {emailSubmitting ? "..." : "Notify Me"}
                  </CTAButton>
                </form>
              )}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
