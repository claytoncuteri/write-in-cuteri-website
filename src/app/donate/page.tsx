import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { ShieldCheck } from "lucide-react";
import { DonateClient } from "./DonateClient";
import { DONATIONS_LIVE } from "./flags";

export const metadata: Metadata = {
  title: "Donate | Clayton Cuteri for Congress SC-01",
  description:
    "Support Clayton Cuteri's write-in campaign for U.S. House SC-01. Secure donations processed by Anedot. Federal contribution limits apply.",
};

export default function DonatePage() {
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

      {/* Interactive donation UI (preview toggle, presets, Anedot links, email signup) */}
      <DonateClient />

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
              individuals whose contributions exceed $200 in an election
              cycle. Federal Election Commission limits apply: individuals may
              contribute up to $3,500 per election. Paid for by Cuteri for
              Americans (FEC ID C00947259). Not authorized by any other
              candidate or candidate&apos;s committee.
            </p>
          </div>

          {/* Ready-to-give CTA. Anchor-link back up so users who finish
              reading the disclaimer (highest-intent readers since they
              checked requirements) don't have to scroll hunt for the
              donate button. The `#donate-now` id lives on whichever
              section DonateClient is currently rendering (live or
              coming-soon), so this works with DONATIONS_LIVE on or off. */}
          <div className="mt-8 text-center">
            <CTAButton variant="primary" href="#donate-now">
              {DONATIONS_LIVE ? "Donate Now" : "Get Notified When Donations Open"}
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
