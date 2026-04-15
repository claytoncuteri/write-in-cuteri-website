"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import Link from "next/link";
import {
  Download,
  Mic,
  Newspaper,
  Send,
  Mail,
  Globe,
  Calendar,
  Camera,
  Users,
  Play,
} from "lucide-react";
import { subscribeToConvertKit } from "@/lib/convertkit";

export default function MediaPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await subscribeToConvertKit({
        email: data.get("email") as string,
        firstName: data.get("name") as string,
        tag: "press",
        fields: {
          organization: (data.get("organization") as string) || "",
          inquiry_type: (data.get("inquiryType") as string) || "",
        },
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
              Press &amp; Media
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Media Resources
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Everything reporters, podcasters, and producers need to cover
              the Cuteri for Americans campaign.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Media Contact */}
      <Section>
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
            Media Contact
          </h2>
          <p className="text-charcoal/70 mb-6">
            For media inquiries, interview requests, or press credentials for
            campaign events:
          </p>
          <div className="bg-cream rounded-lg p-6 space-y-3">
            <p className="font-bold text-charcoal">Clayton A. Cuteri</p>
            <div className="flex items-center gap-2 text-sm text-charcoal/70">
              <Mail size={16} className="text-navy" />
              <span>Campaign: </span>
              <a
                href="mailto:clayton@writeincuteri.com"
                className="text-navy hover:text-navy-dark font-medium"
              >
                clayton@writeincuteri.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal/70">
              <Mail size={16} className="text-navy" />
              <span>Press: </span>
              <a
                href="mailto:info@writeincuteri.com"
                className="text-navy hover:text-navy-dark font-medium"
              >
                info@writeincuteri.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal/70">
              <Globe size={16} className="text-navy" />
              <a
                href="https://writeincuteri.com"
                className="text-navy hover:text-navy-dark font-medium"
              >
                writeincuteri.com
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 2: Candidate Bio + Headshot */}
      <Section bgColor="cream">
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
              Candidate Bio
            </h2>
            <div className="space-y-4 text-charcoal/80 leading-relaxed">
              <p>
                Clayton A. Cuteri is a write-in candidate for U.S. House of
                Representatives in South Carolina&apos;s 1st Congressional
                District (general election, November 3, 2026). He is running
                under the American Congress Party, a new third party he
                co-founded, and serves as the party&apos;s Secretary General.
              </p>
              <p>
                A resident of Mount Pleasant, South Carolina, Cuteri is an
                author and podcaster who built a national audience of more than
                700,000 followers across Instagram, Facebook, and YouTube over
                five years. His content, which began with a spiritual podcast
                and expanded into political commentary, reaches more than 30
                million views per month. He is the author of America Reimagined,
                which outlines the 13-policy platform at the center of his
                campaign.
              </p>
              <p className="text-sm text-charcoal/60">
                Principal campaign committee: Cuteri for Americans (FEC
                Committee ID: C00947259).
              </p>
            </div>
          </div>

          {/* Section 3: Headshot */}
          <div className="flex flex-col items-center">
            <img
              src="/images/Clayton_Headshot.jpg"
              alt="Clayton A. Cuteri, write-in candidate for U.S. Congress SC-01"
              className="w-full max-w-[300px] rounded-xl shadow-lg"
            />
            <a
              href="/images/Clayton_Headshot.jpg"
              download
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-dark transition-colors"
            >
              <Download size={14} />
              Download high-resolution headshot (print-ready)
            </a>
          </div>
        </div>
      </Section>

      {/* Section 4: Platform Summary */}
      <Section title="Platform Summary">
        <div className="max-w-3xl space-y-4 text-charcoal/80 leading-relaxed">
          <p>
            Cuteri&apos;s platform includes 13 policies that cross traditional
            partisan lines, drawn from his book America Reimagined. The platform
            is organized into four parts:
          </p>
          <div className="space-y-3">
            <div className="bg-cream rounded-lg p-4">
              <h3 className="font-bold text-charcoal text-sm">
                Part I: Foundation
              </h3>
              <p className="text-sm mt-1">
                Free food for all Americans (Policy 1), free medication
                (Policy 2), free education from pre-K through public university
                (Policy 3), and clean food and clean water standards (Policy 4).
              </p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <h3 className="font-bold text-charcoal text-sm">
                Part II: Breaking Free
              </h3>
              <p className="text-sm mt-1">
                Return to the gold standard (Policy 5), eliminate the federal
                income tax (Policy 6), mandatory open-books transparency for all
                federal spending (Policy 7), and ending U.S. involvement in
                foreign conflicts without direct national security interest
                (Policy 8).
              </p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <h3 className="font-bold text-charcoal text-sm">
                Part III: Securing the Foundation
              </h3>
              <p className="text-sm mt-1">
                Affordable housing through zero-interest federal construction
                loans (Policy 9), ending homelessness through housing-first
                federal programs (Policy 10), and expanded benefits and
                protections for first responders and veterans (Policy 11).
              </p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <h3 className="font-bold text-charcoal text-sm">
                Part IV: Energy
              </h3>
              <p className="text-sm mt-1">
                Energy independence through diversified domestic production
                (Policy 12) and Lowcountry Resilience (Policy 13), a
                district-specific plan addressing coastal flood infrastructure,
                insurance affordability, wind pool reform, and climate
                adaptation for SC-01 communities.
              </p>
            </div>
          </div>
          <p className="text-sm">
            The campaign estimates a combined annual benefit of $2.34 trillion,
            or approximately $6,988 per person ($582 per month).{" "}
            <Link
              href="/policies"
              className="text-navy font-semibold hover:text-navy-dark"
            >
              See the full platform
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* Section 5: The Write-In Process */}
      <Section bgColor="cream">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
            The Write-In Process
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Clayton Cuteri&apos;s name will not appear on the printed ballot. To
            vote for him, SC-01 voters must write &quot;Clayton A. Cuteri&quot;
            in the write-in field on their general election ballot on November 3,
            2026. South Carolina law permits write-in candidates for federal
            office. The campaign has filed all required notices with the South
            Carolina State Election Commission and the Federal Election
            Commission.
          </p>
          <div className="mt-4">
            <CTAButton variant="secondary" href="/write-in">
              Learn How to Write In Clayton
            </CTAButton>
          </div>
        </div>
      </Section>

      {/* Section 6: Key Facts */}
      <Section title="Key Facts">
        <div className="max-w-xl">
          <div className="space-y-3">
            {[
              ["Candidate", "Clayton A. Cuteri"],
              [
                "Office",
                "U.S. House of Representatives, South Carolina District 1",
              ],
              ["Election", "November 3, 2026 (general election, write-in)"],
              ["Party", "American Congress Party"],
              ["Committee", "Cuteri for Americans (FEC ID: C00947259)"],
              ["Residence", "Mount Pleasant, South Carolina"],
              ["Social reach", "700,000+ followers; 30M+ monthly views"],
              [
                "Platform",
                "13 policies spanning food, medication, education, taxation, military, housing, energy, and coastal resilience",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4">
                <span className="text-sm text-charcoal/50 w-28 flex-shrink-0">
                  {label}
                </span>
                <span className="text-sm text-charcoal font-medium">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Section 7: Press Kit Downloads */}
      <Section bgColor="cream" title="Press Kit Downloads">
        <p className="text-charcoal/70 mb-6">
          Download logos, headshot, and campaign materials for media use.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Candidate Headshot",
              file: "/images/Clayton_Headshot.jpg",
              desc: "High-resolution, navy backdrop (print-ready)",
            },
            {
              label: "ACP Logo with Letters",
              file: "/images/ACP_logo_with_letters.png",
              desc: "Full wordmark with eagle",
            },
            {
              label: "ACP Eagle (Transparent)",
              file: "/images/ACP_Eagle_transparent_background.png",
              desc: "Eagle only, transparent background",
            },
            {
              label: "Campaign One-Pager",
              file: "/images/cuteri-one-pager.pdf",
              desc: "Platform summary PDF",
            },
            {
              label: "Wallet Card",
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

      {/* Section 8: Launch Event */}
      <Section title="Campaign Launch Event">
        <div className="max-w-xl">
          <div className="bg-cream rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={20} className="text-navy" />
              <h3 className="font-bold text-charcoal font-serif">
                Live Announcement
              </h3>
            </div>
            <p className="text-charcoal/80 text-sm">
              A live-streamed campaign announcement is coming soon.
              Follow Clayton on social media for updates, or check back here
              for streaming links and event details.
            </p>
          </div>
        </div>
      </Section>

      {/* Section 9: Social Media */}
      <Section bgColor="cream" title="Social Media">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl">
          {[
            {
              platform: "Instagram",
              handle: "@claytoncuteri",
              followers: "441,000 followers",
              icon: Camera,
              href: "https://www.instagram.com/claytoncuteri/",
            },
            {
              platform: "Facebook",
              handle: "Clayton Cuteri",
              followers: "220,000 followers",
              icon: Users,
              href: "https://www.facebook.com/clayton.cuteri.2025/",
            },
            {
              platform: "YouTube",
              handle: "@ClaytonCuteriACP",
              followers: "49,000 subscribers",
              icon: Play,
              href: "https://www.youtube.com/@ClaytonCuteriACP",
            },
            {
              platform: "X / Twitter",
              handle: "@ClaytonCuteri",
              followers: "",
              icon: Globe,
              href: "https://x.com/ClaytonCuteri",
            },
          ].map((social) => (
            <a
              key={social.platform}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow block"
            >
              <social.icon size={24} className="text-navy mb-2" />
              <h3 className="font-semibold text-charcoal text-sm">
                {social.platform}
              </h3>
              {social.followers && (
                <p className="text-xs text-charcoal/60 mt-0.5">
                  {social.followers}
                </p>
              )}
            </a>
          ))}
        </div>
      </Section>

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

      {/* Media Inquiry Form */}
      <Section title="Media Inquiry">
        <div className="max-w-xl">
          <p className="text-charcoal/70 text-sm mb-6">
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
                Check your inbox for a confirmation email to join our mailing
                list. We will follow up on your inquiry within 24 hours.
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
              <input
                type="hidden"
                name="_subject"
                value="Media inquiry from website"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-navy font-semibold rounded-lg hover:bg-navy-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50"
              >
                <Send size={16} />
                {submitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
