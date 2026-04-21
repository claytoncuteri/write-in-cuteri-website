"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import {
  Clock,
  ShieldCheck,
  DollarSign,
  Share2,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { track, identifyByEmail } from "@/lib/analytics";
import { DONATIONS_LIVE } from "./flags";

// Anedot hosted donation page. Ends up pre-filling `amount` when linked with
// `?amount=N`. See help.anedot.com/knowledge/url-parameter.
const ANEDOT_URL = "https://secure.anedot.com/cuteri-for-americans/donate";

// Research-backed ladder: ActBlue Q1 2024 median political gift is $10-$20,
// average $42.73. $50 is pre-selected (adjusted up from research default $25)
// because Clayton's 700K-follower podcast audience sits between political
// cold traffic and creator/patron economics — warmer than ActBlue baseline.
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
  const showLive = DONATIONS_LIVE;

  async function handleEmailSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailSubmitting(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tag: "donor",
          sourcePage: "/donate",
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

  function handlePresetClick(amount: number) {
    track("donate_amount_click", { amount, source_page: "/donate" });
  }

  function handleCustomSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Floor to integer dollars: Anedot's ?amount= param accepts dollars,
    // and donors rarely mean to give $37.42. Rounding down avoids an
    // unexpected upsell feel.
    const raw = Number(customAmount);
    if (!Number.isFinite(raw) || raw < 1) return;
    const amount = Math.min(Math.floor(raw), FEC_MAX_AMOUNT);
    track("donate_amount_click", {
      amount,
      source_page: "/donate",
      variant: "custom",
    });
    window.open(
      `${ANEDOT_URL}?amount=${amount}`,
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
              events, and campaign outreach across SC-01.
            </p>

            {/* Primary CTA → Anedot hosted page */}
            <div className="mt-8">
              <a
                href={ANEDOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handlePresetClick(0)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white bg-navy hover:bg-navy-dark font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy text-lg"
              >
                <ShieldCheck size={20} />
                Donate Securely via Anedot
              </a>
              <p className="text-xs text-charcoal/60 mt-3">
                Apple Pay, Google Pay, PayPal, card, and ACH accepted. Secure
                processing by Anedot.
              </p>
            </div>

            {/* Preset amount grid. 6 slots: 5 preset amounts + 1 custom-
                amount input-as-a-button. Grid is 2 cols on mobile
                (3 rows × 2) and 3 cols on desktop (2 rows × 3) so the
                custom input has enough width for the number + arrow. */}
            <div className="mt-10">
              <p className="text-sm font-semibold text-charcoal mb-4 uppercase tracking-wider">
                Or pick an amount
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                {PRESET_AMOUNTS.map((amount) => {
                  const isDefault = amount === PRESET_DEFAULT;
                  return (
                    <a
                      key={amount}
                      href={anedotLink(amount)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handlePresetClick(amount)}
                      className={
                        "relative inline-flex h-12 items-center justify-center px-4 font-semibold rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy " +
                        (isDefault
                          ? "bg-navy text-white hover:bg-navy-dark"
                          : "border-2 border-navy text-navy hover:bg-navy hover:text-white")
                      }
                    >
                      ${amount}
                      {isDefault && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap">
                          Most Common
                        </span>
                      )}
                    </a>
                  );
                })}

                {/* Custom amount input styled to match the preset buttons.
                    The wrapping form lets "Enter" inside the input submit,
                    identical behavior to clicking the arrow. */}
                <form
                  onSubmit={handleCustomSubmit}
                  className="relative flex h-12 items-center rounded-lg border-2 border-navy text-navy overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-navy"
                  aria-label="Donate a custom amount"
                >
                  <span
                    className="pl-3 pr-1 text-lg font-semibold select-none"
                    aria-hidden
                  >
                    $
                  </span>
                  {/* type="text" (not "number") is intentional: `type="number"`
                      changes the value when the user scrolls the mouse wheel
                      over a focused input, which accidentally mutates
                      donation amounts for any donor who wheel-scrolls the
                      page while the field has focus. It also renders spin
                      buttons we do not want. Stripe, GitHub, and most
                      modern donation forms use `type="text"` +
                      `inputMode="numeric"` so mobile still gets a numeric
                      keyboard and desktop gets a clean, wheel-proof field.
                      Non-digit input is stripped in onChange, and the
                      final amount is clamped to the FEC cap in the submit
                      handler. */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={customAmount}
                    onChange={(e) =>
                      setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="Other"
                    aria-label="Custom donation amount in US dollars"
                    className="w-full min-w-0 bg-transparent text-lg font-semibold placeholder:text-navy/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!customAmount || Number(customAmount) < 1}
                    aria-label="Donate custom amount"
                    className="h-full px-3 bg-navy text-white hover:bg-navy-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>

              {/* Chip in $5 — lowest-commitment entry point, below grid
                  as a text link so it doesn't anchor expectations down. */}
              <div className="mt-5 text-center text-sm">
                <a
                  href={anedotLink(CHIP_IN_AMOUNT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handlePresetClick(CHIP_IN_AMOUNT)}
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
                <form onSubmit={handleEmailSignup} className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                  <CTAButton
                    variant="primary"
                    type="submit"
                    className="text-sm px-4 py-2.5"
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
