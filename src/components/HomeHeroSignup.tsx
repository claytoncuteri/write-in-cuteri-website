"use client";

// Above-the-fold capture form inside the hero. This is the hero's
// single primary CTA (the quiz and write-in buttons live below the
// fold).
//
// Fields: first name, email, zip (required) + phone (optional, per
// Clayton's July 2026 request). Zip is cheap friction (5 digits) and
// drives the SC01-Resident tag in Kit via looksLikeSC01(). Phone
// stays optional because required-phone forms cost 5-15%+ of
// conversions; the TCPA checkbox only renders once a number is typed,
// same pattern as the quiz and volunteer forms.
//
// Layout note: the submit button is full-width BELOW the input grid
// (not inline with the inputs). An inline row overflowed the card at
// desktop widths because inputs won't shrink past their intrinsic
// min-width; a stacked button can't overflow at any viewport.
//
// Source page is "/hero" (vs HomeSignup's "/") so /admin can segment
// hero vs below-fold capture in the tag breakdown.

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { track, identifyByEmail } from "@/lib/analytics";

export function HomeHeroSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Controlled so the TCPA checkbox appears only when a number exists.
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const firstName = String(fd.get("firstName") || "");
    const zip = String(fd.get("zipCode") || "").trim();
    const smsOptIn =
      phone.trim().length > 0 && fd.get("smsOptIn") === "on";
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          tag: "general",
          sourcePage: "/hero",
          fields: {
            ...(zip ? { zip_code: zip } : {}),
            ...(phone.trim() ? { phone: phone.trim() } : {}),
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
      await identifyByEmail(email, { form_type: "hero_signup" });
      track("signup_form_submitted", {
        form_type: "hero_signup",
        source_page: "/hero",
        has_zip: zip.length > 0,
        sms_opt_in: smsOptIn,
      });
      setSubmitted(true);
    } catch {
      track("signup_form_error", { form_type: "hero_signup" });
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-6 max-w-xl bg-white/10 border border-white/20 rounded-lg p-4 flex items-start gap-3">
        <Check
          size={20}
          className="text-gold shrink-0 mt-0.5"
          aria-hidden
        />
        <div>
          <p className="text-white font-semibold text-sm">
            You&rsquo;re in. Check your inbox to confirm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 max-w-xl bg-white/5 border border-white/15 rounded-lg p-4 backdrop-blur-sm"
      aria-label="Quick email signup"
    >
      <p className="text-white text-sm font-semibold mb-3">
        Get campaign updates by email:
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          name="firstName"
          required
          placeholder="First name"
          autoComplete="given-name"
          aria-label="First name"
          className="w-full min-w-0 px-3 py-2.5 rounded-lg bg-white text-charcoal text-sm placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          autoComplete="email"
          aria-label="Email"
          className="w-full min-w-0 px-3 py-2.5 rounded-lg bg-white text-charcoal text-sm placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <input
          type="text"
          name="zipCode"
          required
          inputMode="numeric"
          pattern="[0-9]{5}"
          maxLength={5}
          placeholder="Zip code"
          autoComplete="postal-code"
          aria-label="Zip code"
          className="w-full min-w-0 px-3 py-2.5 rounded-lg bg-white text-charcoal text-sm placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <input
          type="tel"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          autoComplete="tel"
          aria-label="Mobile phone (optional)"
          className="w-full min-w-0 px-3 py-2.5 rounded-lg bg-white text-charcoal text-sm placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* TCPA opt-in, only once a phone number is typed. Same required
          disclosure copy as the other forms, styled for the navy card. */}
      {phone.trim().length > 0 && (
        <label className="mt-2 flex items-start gap-2 bg-white/10 border border-white/20 rounded-lg p-2.5 text-[10px] text-white/80 leading-snug">
          <input
            type="checkbox"
            name="smsOptIn"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-navy focus:ring-gold"
          />
          <span>
            Text me about events, fundraisers, volunteer shifts,
            ballot-day reminders, campaign updates, or anything else
            related to the Cuteri for Americans campaign. Texting
            launches in the next month or two once carrier approval
            clears. We&rsquo;ll send a welcome text then. Message
            frequency varies. Msg &amp; data rates may apply. Reply
            STOP to unsubscribe, HELP for help.
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full px-5 py-2.5 rounded-lg bg-gold text-charcoal font-semibold text-sm hover:bg-gold/85 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy focus:ring-gold disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Sign up"}
      </button>
      <p className="text-white/60 text-[11px] mt-2.5">
        No spam. Unsubscribe anytime. Paid for by Cuteri for Americans
        (FEC ID C00947259).
      </p>
    </form>
  );
}
