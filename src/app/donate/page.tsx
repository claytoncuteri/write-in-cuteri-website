"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { Clock, ShieldCheck, DollarSign } from "lucide-react";
import { track, identifyByEmail } from "@/lib/analytics";

// Toggle this to switch between "Coming Soon" and active donation view.
// Set to true when FEC registration, EIN, and bank account are ready.
const DONATIONS_LIVE = false;

export default function DonatePage() {
  const [previewLive, setPreviewLive] = useState(DONATIONS_LIVE);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const showLive = previewLive;

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

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              Donate
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Support the Campaign
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Every dollar funds voter education, not TV attack ads. This
              campaign runs on people and principles.
            </p>
          </div>
        </div>
      </section>

      {/* Admin preview toggle (only visible when DONATIONS_LIVE is false) */}
      {!DONATIONS_LIVE && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <p className="text-sm text-yellow-800">
              <strong>Preview mode:</strong> Toggle to see what the donation page
              will look like once donations are live.
            </p>
            <button
              onClick={() => setPreviewLive(!previewLive)}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg border transition-colors bg-white text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              {showLive ? "Show Coming Soon" : "Preview Live Donations"}
            </button>
          </div>
        </div>
      )}

      {showLive ? (
        /* ===== LIVE DONATION VIEW ===== */
        <>
          <Section>
            <div className="max-w-2xl mx-auto text-center">
              <DollarSign size={48} className="text-navy mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-charcoal font-serif">
                Make a Contribution
              </h2>
              <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
                Your contribution directly funds voter education, community
                events, and campaign outreach across SC-01.
              </p>

              {/* Donation widget placeholder */}
              <div className="mt-8 bg-cream rounded-lg p-8 border-2 border-dashed border-gray-300">
                <p className="text-charcoal/60 text-sm font-medium">
                  [ANEDOT_WIDGET: Embed your Anedot donation widget here. Replace
                  this entire div with the Anedot embed code.]
                </p>
              </div>

              {/* Quick donate amounts */}
              <div className="mt-8">
                <p className="text-sm font-medium text-charcoal mb-3">
                  Select an amount:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[25, 50, 100, 250, 500, 1000].map((amount) => (
                    <button
                      key={amount}
                      className="px-5 py-2.5 border-2 border-navy text-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-charcoal/50 mt-3">
                  [ANEDOT_WIDGET: These buttons are visual placeholders. Connect
                  them to your Anedot widget or replace this section entirely.]
                </p>
              </div>

              {/* Donor certification */}
              <div className="mt-8 bg-cream rounded-lg p-6 text-left max-w-md mx-auto">
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
        </>
      ) : (
        /* ===== COMING SOON VIEW ===== */
        <Section>
          <div className="max-w-2xl mx-auto text-center">
            <Clock size={48} className="text-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-charcoal font-serif">
              Donations Coming Soon
            </h2>
            <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
              We are completing FEC registration, obtaining our EIN, and setting
              up a compliant campaign bank account. Once those steps are
              finalized, online donations will open here.
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

      {/* Contribution info (always shown) */}
      <Section bgColor="cream" title="Contribution Guidelines">
        <div className="max-w-3xl space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-charcoal font-serif text-lg">
                Individual Limit
              </h3>
              <p className="text-3xl font-bold text-navy mt-2 font-serif">
                $3,500
              </p>
              <p className="text-sm text-charcoal/70 mt-1">
                Per individual, per election (primary and general are separate)
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <ShieldCheck size={24} className="text-navy mb-2" />
              <h3 className="font-bold text-charcoal font-serif text-lg">
                Donor Requirements
              </h3>
              <ul className="mt-2 text-sm text-charcoal/70 space-y-1">
                <li>U.S. citizen or permanent resident</li>
                <li>Using your own funds</li>
                <li>Not a federal contractor</li>
                <li>At least 18 years old</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-charcoal font-serif text-lg mb-3">
              Prohibited Contributions
            </h3>
            <p className="text-sm text-charcoal/70 leading-relaxed">
              Federal law prohibits contributions from corporations, labor
              unions, federal contractors, and foreign nationals. All
              contributions must be made from personal funds. PAC contributions
              are accepted within legal limits.
            </p>
          </div>
        </div>
      </Section>

      {/* FEC Disclaimer */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-charcoal text-sm uppercase tracking-wider mb-3">
              FEC Disclaimer
            </h3>
            <p className="text-sm text-charcoal/70 leading-relaxed">
              Contributions to Cuteri for Americans are not tax deductible.
              Federal law requires us to use our best efforts to collect and
              report the name, mailing address, occupation, and employer of
              individuals whose contributions exceed $200 in an election cycle.
              The maximum contribution is $3,500 per individual per election.
              Contributions from corporations, labor unions, federal contractors,
              and foreign nationals are prohibited.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
