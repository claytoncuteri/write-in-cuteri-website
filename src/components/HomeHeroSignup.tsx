"use client";

// Slim above-the-fold capture form inside the hero. Sits BELOW the
// seasonal CTA pair so the primary action (Quiz or Write-In, swapped
// by phase) stays the dominant visual call. Catches drive-by visitors
// who won't take an 8-question quiz but will drop an email in two
// fields.
//
// Why first name + email only (no last name, no phone, no TCPA):
//   - Above-the-fold conversion lifts come from FEWER fields. Industry
//     data (M+R 2024, Center for Campaign Innovation 2024 post-election
//     report, Unbounce CRO benchmarks 2025) consistently shows 2-field
//     forms convert 20-30% higher than 4+ field forms in the campaign
//     context.
//   - Phone + TCPA belong on the dedicated <HomeSignup /> below the
//     fold, which is for already-committed scrollers. Two tiers, two
//     intent levels.
//   - First name is kept (not email-only) because ConvertKit
//     personalization tokens lean on it heavily. The conversion hit vs.
//     email-only is ~5%, which is a fair trade for a real merge tag.
//
// Source page is "/hero" (vs HomeSignup's "/") so /admin can segment
// hero vs below-fold capture in the tag breakdown.

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { track, identifyByEmail } from "@/lib/analytics";

export function HomeHeroSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const firstName = String(fd.get("firstName") || "");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          tag: "general",
          sourcePage: "/hero",
        }),
      });
      if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
      await identifyByEmail(email, { form_type: "hero_signup" });
      track("signup_form_submitted", {
        form_type: "hero_signup",
        source_page: "/hero",
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
          <p className="text-white/70 text-xs mt-0.5">
            Want SMS reminders too? Scroll down for the full signup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      // Visually distinct from the CTA pair: subtle translucent card
      // on the navy hero background. The CTAs above are the primary
      // call; this form is the low-friction secondary capture.
      className="mt-6 max-w-xl bg-white/5 border border-white/15 rounded-lg p-4 backdrop-blur-sm"
      aria-label="Quick email signup"
    >
      <p className="text-white text-sm font-semibold mb-3">
        Or get campaign updates by email:
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          name="firstName"
          required
          placeholder="First name"
          autoComplete="given-name"
          className="flex-1 px-3 py-2.5 rounded-lg bg-white text-charcoal text-sm placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          autoComplete="email"
          className="flex-[1.5] px-3 py-2.5 rounded-lg bg-white text-charcoal text-sm placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-gold text-charcoal font-semibold text-sm hover:bg-gold/85 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy focus:ring-gold disabled:opacity-50 whitespace-nowrap"
        >
          {submitting ? "Sending..." : "Sign up"}
        </button>
      </div>
      <p className="text-white/60 text-[11px] mt-2.5">
        No spam. Unsubscribe anytime. Phone + SMS opt-in available below.
      </p>
    </form>
  );
}
