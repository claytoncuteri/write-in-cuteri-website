"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/Section";
import { Download, Mic, Newspaper, Send } from "lucide-react";

export default function MediaPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await fetch("[FORMSPREE_PRESS_ENDPOINT]", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setSubmitted(true);
    } catch {
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
              Media
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Appearances & Press
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Podcasts, interviews, press coverage, and resources for media
              professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Media Appearances */}
      <Section title="Media Appearances">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-cream rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="bg-navy/5 p-6 flex items-center justify-center">
                <Mic size={40} className="text-navy/30" />
              </div>
              <div className="p-5">
                <p className="text-xs text-charcoal/50 uppercase tracking-wider mb-1">
                  [MEDIA_TYPE_{i}: Podcast / Interview / Panel]
                </p>
                <h3 className="font-bold text-charcoal font-serif">
                  [MEDIA_TITLE_{i}]
                </h3>
                <p className="mt-1 text-charcoal/60 text-sm">
                  [MEDIA_SHOW_NAME_{i}]
                </p>
                <p className="mt-1 text-charcoal/40 text-xs">
                  [MEDIA_DATE_{i}]
                </p>
                <a
                  href="[MEDIA_LINK_{i}]"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-navy hover:text-navy-dark transition-colors"
                >
                  Listen / Watch
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-charcoal/50 mt-6">
          Media appearances will be added as they are scheduled and recorded.
        </p>
      </Section>

      {/* Press Coverage */}
      <Section bgColor="cream" title="Press Coverage">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <Newspaper size={20} className="text-navy/30 mb-2" />
              <p className="text-xs text-charcoal/50 uppercase tracking-wider mb-1">
                [PRESS_SOURCE_{i}]
              </p>
              <h3 className="font-bold text-charcoal font-serif">
                [PRESS_HEADLINE_{i}]
              </h3>
              <p className="mt-2 text-charcoal/70 text-sm">
                [PRESS_EXCERPT_{i}]
              </p>
              <a
                href="[PRESS_LINK_{i}]"
                className="mt-3 inline-block text-sm font-semibold text-navy hover:text-navy-dark transition-colors"
              >
                Read article
              </a>
            </div>
          ))}
        </div>
        <p className="text-sm text-charcoal/50 mt-6">
          Press coverage will be added as it is published.
        </p>
      </Section>

      {/* Quick Facts */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
              Quick Facts
            </h2>
            <div className="bg-cream rounded-lg p-6 space-y-3 text-sm">
              {[
                ["Candidate", "Clayton A. Cuteri"],
                ["Office", "U.S. House, SC-01"],
                ["Party", "American Congress Party"],
                ["Status", "Write-in candidate"],
                ["Election", "November 3, 2026"],
                ["Website", "writeincuteri.com"],
                ["Committee", "Cuteri for Americans"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-charcoal/70">{label}</span>
                  <span className="font-medium text-charcoal">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Press Inquiry Form */}
          <div>
            <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
              Media Inquiry
            </h2>
            <p className="text-charcoal/70 text-sm mb-4">
              Interested in booking Clayton for your podcast, show, or
              publication? Fill out the form below and we will get back to you
              within 24 hours.
            </p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-green-800">
                  Inquiry received!
                </h3>
                <p className="mt-2 text-green-700 text-sm">
                  We will be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="pressName"
                      className="block text-sm font-medium text-charcoal mb-1"
                    >
                      Your name *
                    </label>
                    <input
                      type="text"
                      id="pressName"
                      name="name"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pressOrg"
                      className="block text-sm font-medium text-charcoal mb-1"
                    >
                      Organization / Show *
                    </label>
                    <input
                      type="text"
                      id="pressOrg"
                      name="organization"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="pressEmail"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="pressEmail"
                    name="email"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pressType"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Type of inquiry *
                  </label>
                  <select
                    id="pressType"
                    name="inquiryType"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy bg-white"
                  >
                    <option value="">Select one</option>
                    <option value="podcast">Podcast appearance</option>
                    <option value="interview">Interview request</option>
                    <option value="article">Article / Feature</option>
                    <option value="event">Event / Panel</option>
                    <option value="statement">Request a statement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="pressMessage"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Details
                  </label>
                  <textarea
                    id="pressMessage"
                    name="message"
                    rows={4}
                    placeholder="Tell us about your show, publication, or event. Include dates if applicable."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-none"
                  />
                </div>
                <input type="hidden" name="_subject" value="Media inquiry from website" />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-navy font-semibold rounded-lg hover:bg-navy-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50"
                >
                  <Send size={16} />
                  {submitting ? "Sending..." : "Submit Inquiry"}
                </button>
                <p className="text-xs text-charcoal/40 text-center">
                  [FORMSPREE_PRESS_ENDPOINT: Replace with Formspree URL]
                </p>
              </form>
            )}
          </div>
        </div>
      </Section>

      {/* Downloadable Assets */}
      <Section bgColor="cream" title="Press Kit">
        <p className="text-charcoal/70 mb-6">
          Download logos, headshot, and campaign materials for media use.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "ACP Logo (Full)",
              file: "/images/ACP_logo_with_letters.png",
              desc: "Full wordmark with eagle",
            },
            {
              label: "ACP Eagle (Transparent)",
              file: "/images/ACP_Eagle_transparent_background.png",
              desc: "Eagle only, transparent background",
            },
            {
              label: "Candidate Headshot",
              file: "/images/Clayton_Headshot.jpg",
              desc: "Clayton Cuteri, navy backdrop",
            },
            {
              label: "Wallet Card (PDF)",
              file: "/images/cuteri-wallet-card.pdf",
              desc: "Print-ready write-in reminder",
            },
          ].map((asset) => (
            <a
              key={asset.label}
              href={asset.file}
              download
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow block"
            >
              <Download size={20} className="text-navy mb-2" />
              <h3 className="font-semibold text-charcoal text-sm">
                {asset.label}
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">{asset.desc}</p>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
