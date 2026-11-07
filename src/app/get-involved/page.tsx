"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { Users, Share2, Mail } from "lucide-react";
import { IssueMatcher } from "@/components/IssueMatcher";
import { CampaignShare } from "@/components/CampaignShare";
import { track, identifyByEmail } from "@/lib/analytics";

export default function GetInvolvedPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "");
    const zip = String(data.get("zipCode") || "");
    const phone = String(data.get("phone") || "");
    // TCPA only matters when a phone is actually provided. Anyone who
    // leaves the phone field blank isn't receiving SMS regardless.
    const smsOptIn = phone.trim().length > 0 && data.get("smsOptIn") === "on";

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: String(data.get("firstName") || ""),
          lastName: String(data.get("lastName") || ""),
          tag: "volunteer",
          sourcePage: "/get-involved",
          fields: {
            phone,
            zip_code: zip,
            sms_opt_in: smsOptIn ? "yes" : "no",
            sms_opt_in_at: smsOptIn ? new Date().toISOString() : "",
          },
        }),
      });
      if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
      await identifyByEmail(email, { form_type: "volunteer", zip_code: zip });
      track("signup_form_submitted", {
        form_type: "volunteer",
        source_page: "/get-involved",
        has_zip: zip.length > 0,
      });
      setSubmitted(true);
    } catch {
      track("signup_form_error", { form_type: "volunteer" });
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              Stay Involved
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Thank You for Showing Up
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              The 2026 race is over. This campaign ran on people, not PAC
              money: every volunteer, every shared post, every conversation at
              the grocery store. Thank you. This is just the beginning, so
              stay close for what comes next.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to help */}
      <Section>
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-cream rounded-lg p-6 text-center">
            <Users size={32} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Raise Your Hand
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Sign up below and tell us how you want to help when the next
              chapter starts.
            </p>
          </div>
          <div className="bg-cream rounded-lg p-6 text-center">
            <Share2 size={32} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Spread the Word
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Share the story. Talk to your neighbors. The movement grows one
              conversation at a time.
            </p>
          </div>
          <div className="bg-cream rounded-lg p-6 text-center">
            <Mail size={32} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Stay Updated
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Join the email list to hear what comes next, first.
            </p>
          </div>
        </div>

        {/* Volunteer Form */}
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif mb-6">
            Stay in the Loop
          </h2>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-green-800">
                Thank you for signing up!
              </h3>
              <p className="mt-2 text-green-700">
                Check your inbox for a confirmation email. You will need to
                confirm your email address to join the mailing list.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    First name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Last name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Zip code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    pattern="[0-9]{5}"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>
              </div>
              {/* TCPA opt-in for phone. Optional checkbox  -  volunteer
                  form can be submitted without SMS consent. Only surfaces
                  meaning if they also typed a phone number above. */}
              <div className="flex items-start gap-2 bg-cream border border-gray-200 rounded-lg p-3">
                <input
                  type="checkbox"
                  id="smsOptIn"
                  name="smsOptIn"
                  className="mt-1 h-4 w-4 text-navy border-gray-300 rounded focus:ring-navy"
                />
                <label
                  htmlFor="smsOptIn"
                  className="text-xs text-charcoal/80 leading-relaxed"
                >
                  Text me about events, fundraisers, volunteer shifts,
                  campaign updates, or anything
                  else related to the Cuteri for Americans campaign.
                  Texting launches in the next month or two once
                  carrier approval clears. We&rsquo;ll send a welcome
                  text then. Message frequency varies. Msg &amp; data
                  rates may apply. Reply STOP to unsubscribe, HELP for
                  help.
                </label>
              </div>

              <div>
                <label
                  htmlFor="howCanYouHelp"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  How can you help?
                </label>
                <textarea
                  id="howCanYouHelp"
                  name="howCanYouHelp"
                  rows={3}
                  placeholder="Events, door-knocking, phone banking, social media, other..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-none"
                />
              </div>
              <CTAButton variant="primary" type="submit" className="w-full">
                {submitting ? "Sending..." : "Count Me In"}
              </CTAButton>
              <p className="text-[11px] text-charcoal/70 text-center leading-relaxed">
                Paid for by Cuteri for Americans (FEC ID C00947259).
              </p>
            </form>
          )}
        </div>
      </Section>

      {/* Post-election (Nov 2026): the "Materials for Volunteers"
          section was removed. Its wallet card, write-in wordmark and
          volunteer-kit ZIP all taught people how to write Clayton in.
          The one-pager is still linked from the home page. */}
      {/* Issue-matcher for visitors who are interested but not yet ready to
          commit to the volunteer form. Placed AFTER the volunteer form and
          materials so high-intent visitors hit the form first; the quiz is
          the soft landing for anyone who scrolled past it. */}
      <Section>
        <IssueMatcher sourcePage="/get-involved" />
      </Section>

      {/* Social share. Expanded from the original X-and-Facebook-only
          pair to four platforms with web-share intents (X, Facebook,
          LinkedIn, Threads) plus a native Web Share API button that
          opens the OS share sheet on mobile  -  the only real path
          to Instagram, TikTok, WhatsApp, Signal, AirDrop, etc.,
          since none of those expose a public share URL. */}
      <Section bgColor="cream" title="Share the Story">
        <CampaignShare />
      </Section>

      {/* ACP Link */}
      <Section bgColor="navy">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white font-serif">
            Learn About the American Congress Party
          </h2>
          <p className="mt-4 text-white/80 text-lg max-w-2xl mx-auto">
            The 2026 race was one step in a larger movement. The ACP is building
            a party for the Americans neither Republicans nor Democrats
            represent.
          </p>
          <div className="mt-6">
            <CTAButton
              variant="primary"
              href="https://americancongressparty.com"
            >
              Join the American Congress Party
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
