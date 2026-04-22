"use client";

// Homepage email + phone signup block. Placed between "Meet Clayton" and
// the CTA Cards so visitors who scroll past the hero but aren't yet ready
// for the write-in CTA still have a low-friction path to hand us their
// contact info. Before this block existed, the only email-capture paths
// on the site were (a) the mid-quiz email gate and (b) the /get-involved
// volunteer form -- both required multiple clicks or quiz completion, so
// a large share of engaged visitors bounced without giving us a way to
// reach them.
//
// Fields: first name, last name, email (all required), phone (required
// with TCPA opt-in). Phone is required here (not optional, unlike the
// existing /get-involved form) because the primary reason to ship this
// block is to start building the SMS list for ballot-day GOTV reminders.
// An email-only signup would defeat the purpose.
//
// TCPA note: FCC rules for political SMS require express opt-in with
// clear disclosure of sender, frequency, and opt-out. The checkbox copy
// below is the minimum compliant text for GoodParty.org / 10DLC.

import { useState, type FormEvent } from "react";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { CheckCircle2, Mail } from "lucide-react";
import { track, identifyByEmail } from "@/lib/analytics";

export function HomeSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const smsOptIn = data.get("smsOptIn") === "on";

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: String(data.get("firstName") || ""),
          lastName: String(data.get("lastName") || ""),
          tag: "general",
          sourcePage: "/",
          fields: {
            phone,
            sms_opt_in: smsOptIn ? "yes" : "no",
            sms_opt_in_at: smsOptIn ? new Date().toISOString() : "",
          },
        }),
      });
      if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
      await identifyByEmail(email, {
        form_type: "home_signup",
        sms_opt_in: smsOptIn,
      });
      track("signup_form_submitted", {
        form_type: "home_signup",
        source_page: "/",
        sms_opt_in: smsOptIn,
      });
      setSubmitted(true);
    } catch {
      track("signup_form_error", { form_type: "home_signup" });
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section bgColor="cream">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <Mail size={28} className="text-navy mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif">
            Get campaign updates from Clayton
          </h2>
          <p className="mt-3 text-charcoal/70">
            Event invites, fundraiser notices, volunteer opportunities,
            and a ballot-day reminder when it counts. Unsubscribe anytime.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle2
              size={24}
              className="text-green-700 mx-auto mb-2"
              aria-hidden
            />
            <h3 className="text-lg font-bold text-green-800">
              Thanks for signing up.
            </h3>
            <p className="mt-2 text-green-700">
              Check your inbox for a confirmation email. You&rsquo;ll need
              to confirm your email address to join the list. Text
              messages are launching in the next month or two once
              carrier approval clears  -  we&rsquo;ll send a welcome
              text the moment we&rsquo;re live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="home-firstName"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  First name *
                </label>
                <input
                  type="text"
                  id="home-firstName"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                />
              </div>
              <div>
                <label
                  htmlFor="home-lastName"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  Last name *
                </label>
                <input
                  type="text"
                  id="home-lastName"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="home-email"
                className="block text-sm font-medium text-charcoal mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="home-email"
                name="email"
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
              />
            </div>
            <div>
              <label
                htmlFor="home-phone"
                className="block text-sm font-medium text-charcoal mb-1"
              >
                Mobile phone *
              </label>
              <input
                type="tel"
                id="home-phone"
                name="phone"
                required
                autoComplete="tel"
                placeholder="(843) 555-0100"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
              />
            </div>

            {/* TCPA opt-in. Required checkbox: FCC rules for political
                SMS demand express written consent with clear sender, use
                case, frequency, and opt-out language. Pre-checked is
                forbidden. Keep this inline so consent is unambiguous. */}
            <div className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg p-3">
              <input
                type="checkbox"
                id="home-smsOptIn"
                name="smsOptIn"
                required
                className="mt-1 h-4 w-4 text-navy border-gray-300 rounded focus:ring-navy"
              />
              <label
                htmlFor="home-smsOptIn"
                className="text-xs text-charcoal/80 leading-relaxed"
              >
                Text me about events, fundraisers, volunteer shifts,
                ballot-day reminders, campaign updates, or anything
                else related to the Cuteri for Americans campaign.
                Texting is launching in the next month
                or two once carrier approval clears  -  you&rsquo;ll
                get a welcome text then. Message frequency varies.
                Message and data rates may apply. Reply STOP to
                unsubscribe, HELP for help.
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-accent" role="alert">
                {error}
              </p>
            )}

            <CTAButton variant="primary" type="submit" className="w-full">
              {submitting ? "Signing up..." : "Sign Up"}
            </CTAButton>

            <p className="text-[11px] text-charcoal/50 text-center leading-relaxed">
              Paid for by Cuteri for Americans. See our{" "}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-charcoal"
              >
                privacy policy
              </a>{" "}
              for how we handle your phone number and email.
            </p>
          </form>
        )}
      </div>
    </Section>
  );
}
