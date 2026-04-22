"use client";

// Lightweight contact capture tied to the volunteer kit download on
// /get-involved. Non-gating: the kit zip is still downloadable above
// without filling this out. This form is for supporters who want to
// leave their name/email/phone so the campaign can follow up. Every
// signup form on the site asks for the same four fields (firstName,
// lastName, email, phone) plus the broad-scope TCPA checkbox, so the
// data layer stays consistent.

import { useState, type FormEvent } from "react";
import { CTAButton } from "@/components/CTAButton";
import { track, identifyByEmail } from "@/lib/analytics";

export function KitContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    const firstName = String(data.get("firstName") || "");
    const lastName = String(data.get("lastName") || "");
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const smsOptIn = phone.trim().length > 0 && data.get("smsOptIn") === "on";

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          tag: "volunteer",
          sourcePage: "/get-involved#kit",
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
      await identifyByEmail(email, { form_type: "kit_download" });
      track("signup_form_submitted", {
        form_type: "kit_download",
        source_page: "/get-involved",
      });
      setSubmitted(true);

      // Kick off the kit download immediately so the submission feels
      // like it "did something." Opens the zip in a new tab so the
      // thank-you state remains visible.
      window.open("/images/cuteri-volunteer-kit.zip", "_blank");
    } catch {
      track("signup_form_error", { form_type: "kit_download" });
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8 max-w-lg">
      <h3 className="font-bold text-charcoal text-base font-serif">
        Want the kit and campaign updates?
      </h3>
      <p className="text-xs text-charcoal/60 mt-1 mb-4">
        Leave your info and we&apos;ll send the kit to your inbox plus keep
        you in the loop on events, fundraisers, and ballot-day reminders.
      </p>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium text-sm">
            Thanks! Your download is starting in a new tab. Check your
            inbox to confirm the email signup.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              name="firstName"
              required
              placeholder="First name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
            />
            <input
              type="text"
              name="lastName"
              required
              placeholder="Last name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
            />
          </div>
          <input
            type="email"
            name="email"
            required
            placeholder="your@email.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Mobile phone (optional)"
            autoComplete="tel"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
          />
          <label className="flex items-start gap-2 text-[11px] text-charcoal/70 leading-snug bg-cream border border-gray-200 rounded-lg p-3">
            <input
              type="checkbox"
              name="smsOptIn"
              className="mt-0.5 h-4 w-4 text-navy border-gray-300 rounded focus:ring-navy"
            />
            <span>
              Text me about events, fundraisers, volunteer shifts,
              ballot-day reminders, campaign updates, or anything else
              related to the Cuteri for Americans campaign. Texting
              launches in the next month or two once carrier approval
              clears  -  welcome text then. Message frequency varies.
              Msg &amp; data rates may apply. Reply STOP to unsubscribe,
              HELP for help.
            </span>
          </label>
          <CTAButton variant="primary" type="submit" className="w-full">
            {submitting ? "Sending..." : "Send Me the Kit"}
          </CTAButton>
        </form>
      )}
    </div>
  );
}
