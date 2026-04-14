import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { Download, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Press",
  description:
    "Press resources for the Clayton Cuteri for Congress campaign. Download logos, headshot, and fact sheets.",
};

export default function PressPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              Press
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Media Resources
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Everything you need to cover the Cuteri for Congress campaign.
            </p>
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
              Press Contact
            </h2>
            <div className="bg-cream rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail size={20} className="text-navy" />
                <span className="font-medium text-charcoal">
                  [PRESS_EMAIL: e.g. press@writeincuteri.com]
                </span>
              </div>
              <p className="text-charcoal/70 text-sm">
                For interview requests, statements, and media inquiries. We aim
                to respond within 24 hours.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
              Quick Facts
            </h2>
            <div className="bg-cream rounded-lg p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Candidate</span>
                <span className="font-medium text-charcoal">Clayton A. Cuteri</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Office</span>
                <span className="font-medium text-charcoal">U.S. House, SC-01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Party</span>
                <span className="font-medium text-charcoal">American Congress Party</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Status</span>
                <span className="font-medium text-charcoal">Write-in candidate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Election</span>
                <span className="font-medium text-charcoal">November 3, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Website</span>
                <span className="font-medium text-charcoal">writeincuteri.com</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Press Mentions */}
      <Section bgColor="cream" title="Press Mentions">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <p className="text-xs text-charcoal/50 uppercase tracking-wider mb-2">
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
          Press mentions will be added as coverage develops.
        </p>
      </Section>

      {/* Downloadable Assets */}
      <Section title="Downloadable Assets">
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
              label: "ACP Eagle (White BG)",
              file: "/images/acp_eagle_with_white_background.png",
              desc: "Eagle only, white background",
            },
            {
              label: "Candidate Headshot",
              file: "/images/Clayton_Headshot.jpg",
              desc: "Clayton Cuteri, navy backdrop",
            },
          ].map((asset) => (
            <a
              key={asset.label}
              href={asset.file}
              download
              className="bg-cream rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow block"
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
