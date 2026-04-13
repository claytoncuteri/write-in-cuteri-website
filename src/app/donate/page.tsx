import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { Clock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Clayton Cuteri's write-in campaign for U.S. House SC-01. Donations coming soon, pending FEC registration.",
};

export default function DonatePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-red-accent font-semibold text-sm uppercase tracking-wider mb-3">
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

      {/* Coming Soon */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <Clock size={48} className="text-navy mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-charcoal font-serif">
            Donations Coming Soon
          </h2>
          <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
            We are completing FEC registration, obtaining our EIN, and setting up
            a compliant campaign bank account. Once those steps are finalized,
            online donations will open here.
          </p>
          <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
            Want to be the first to know?
          </p>

          {/* Email signup placeholder */}
          <div className="mt-6 bg-cream rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm font-medium text-charcoal mb-3">
              Get notified when donations open:
            </p>
            <form
              action="[FORMSPREE_DONATE_NOTIFY_ENDPOINT]"
              method="POST"
              className="flex gap-2"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
              />
              <CTAButton variant="primary" type="submit" className="text-sm px-4 py-2.5">
                Notify Me
              </CTAButton>
            </form>
            <input type="hidden" name="_subject" value="Donation notification signup" />
            <p className="text-xs text-charcoal/40 mt-2">
              [FORMSPREE_DONATE_NOTIFY_ENDPOINT: Replace with Formspree URL]
            </p>
          </div>
        </div>
      </Section>

      {/* Contribution info */}
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

          {/* Prohibited */}
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
