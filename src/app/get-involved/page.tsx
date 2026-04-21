"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { Users, Share2, Mail, FileText, Printer } from "lucide-react";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { IssueMatcher } from "@/components/IssueMatcher";
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
            phone: String(data.get("phone") || ""),
            zip_code: zip,
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
              Get Involved
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Join the Movement
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              This campaign runs on people, not PAC money. Every volunteer,
              every shared post, every conversation at the grocery store matters.
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
              Volunteer
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Help at events, knock doors, make calls, or distribute materials
              across District 1.
            </p>
          </div>
          <div className="bg-cream rounded-lg p-6 text-center">
            <Share2 size={32} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Spread the Word
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Share this website. Talk to your neighbors. The biggest barrier for
              a write-in is name recognition.
            </p>
          </div>
          <div className="bg-cream rounded-lg p-6 text-center">
            <Mail size={32} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Stay Updated
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Join the email list to get campaign updates, event invitations, and
              voter education materials.
            </p>
          </div>
        </div>

        {/* Volunteer Form */}
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif mb-6">
            Sign Up to Volunteer
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
                {submitting ? "Sending..." : "Sign Up to Volunteer"}
              </CTAButton>
            </form>
          )}
        </div>
      </Section>

      {/* Volunteer materials */}
      <Section bgColor="cream" title="Materials for Volunteers">
        <p className="text-charcoal/70 mb-6">
          Download and print these to hand out at events, door-to-door, or
          anywhere someone asks what Clayton stands for.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
          <div className="bg-white rounded-lg p-5 border border-gray-200 text-center">
            <FileText size={28} className="text-navy mx-auto mb-2" />
            <h3 className="font-bold text-charcoal text-sm font-serif">
              Campaign One-Pager
            </h3>
            <p className="text-xs text-charcoal/60 mt-1 mb-3">
              Platform summary and talking points
            </p>
            <PdfDownloadButton href="/images/cuteri-one-pager.pdf">
              Download PDF
            </PdfDownloadButton>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200 text-center">
            <Printer size={28} className="text-navy mx-auto mb-2" />
            <h3 className="font-bold text-charcoal text-sm font-serif">
              Wallet Card
            </h3>
            <p className="text-xs text-charcoal/60 mt-1 mb-3">
              Write-in reminder card for Election Day
            </p>
            <PdfDownloadButton href="/images/cuteri-wallet-card.pdf">
              Download PDF
            </PdfDownloadButton>
          </div>
        </div>
      </Section>

      {/* Issue-matcher for visitors who are interested but not yet ready to
          commit to the volunteer form. Placed AFTER the volunteer form and
          materials so high-intent visitors hit the form first; the quiz is
          the soft landing for anyone who scrolled past it. */}
      <Section>
        <IssueMatcher sourcePage="/get-involved" />
      </Section>

      {/* Social share */}
      <Section bgColor="cream" title="Share This Campaign">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-charcoal/70 text-lg mb-6">
            The biggest challenge for any write-in candidate is name recognition.
            Every share helps.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://twitter.com/intent/tweet?text=I%27m%20writing%20in%20Clayton%20Cuteri%20for%20Congress%20in%20SC-01.%20writeincuteri.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-charcoal text-white rounded-lg text-sm font-semibold hover:bg-charcoal/80 transition-colors"
            >
              Share on X
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://writeincuteri.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#1877F2] text-white rounded-lg text-sm font-semibold hover:bg-[#1877F2]/80 transition-colors"
            >
              Share on Facebook
            </a>
          </div>
        </div>
      </Section>

      {/* ACP Link */}
      <Section bgColor="navy">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white font-serif">
            Learn About the American Congress Party
          </h2>
          <p className="mt-4 text-white/80 text-lg max-w-2xl mx-auto">
            This campaign is part of a larger movement. The ACP is building a
            party for the Americans neither Republicans nor Democrats represent.
          </p>
          <div className="mt-6">
            <CTAButton
              variant="primary"
              href="https://americancongressparty.com"
            >
              Visit americancongressparty.com
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
