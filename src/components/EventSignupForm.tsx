"use client";

// Event-notification signup on /events. Same four-field shape as every
// other capture on the site (firstName, lastName, email, optional
// phone) so records land in /api/subscribe with a consistent schema.
// Tagged "general" because the campaign-wide list already covers
// event announcements; we distinguish in ConvertKit via the
// source_page custom field, not a separate tag.

import { useState, type FormEvent } from "react";
import { CTAButton } from "@/components/CTAButton";
import { track, identifyByEmail } from "@/lib/analytics";

export function EventSignupForm() {
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
    const zip = String(data.get("zipCode") || "");
    const smsOptIn = phone.trim().length > 0 && data.get("smsOptIn") === "on";

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          tag: "general",
          sourcePage: "/events",
          fields: {
            ...(phone ? { phone } : {}),
            ...(zip ? { zip_code: zip } : {}),
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
      await identifyByEmail(email, {
        form_type: "event_notifications",
        zip_code: zip,
      });
      track("signup_form_submitted", {
        form_type: "event_notifications",
        source_page: "/events",
      });
      setSubmitted(true);
    } catch {
      track("signup_form_error", { form_type: "event_notifications" });
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-left mt-6">
        <h3 className="text-base font-bold text-green-800">
          You&rsquo;re on the list.
        </h3>
        <p className="mt-1 text-sm text-green-700">
          Check your inbox for a confirmation email. Once confirmed,
          you&rsquo;ll hear first when Clayton schedules an event
          near you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
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
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="tel"
          name="phone"
          placeholder="Mobile phone (optional)"
          autoComplete="tel"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
        />
        <input
          type="text"
          name="zipCode"
          pattern="[0-9]{5}"
          placeholder="Zip code (optional)"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
        />
      </div>
      <label className="flex items-start gap-2 text-[11px] text-charcoal/70 leading-snug bg-white border border-gray-200 rounded-lg p-3">
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
        {submitting ? "Sending..." : "Notify Me About Events"}
      </CTAButton>
    </form>
  );
}
