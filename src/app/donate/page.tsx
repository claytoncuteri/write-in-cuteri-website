import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";

// Post-election (after Nov 3, 2026): the Anedot donation form is off.
//
// FEC rule: after the election, a candidate committee may accept
// contributions for that election only to pay off net debts from it
// (11 CFR 110.1(b)(3)). Gifts for a later election need a real candidacy
// in that election, with an amended Statement of Candidacy (Form 2)
// filed within 15 days of qualifying. Until Clayton decides on that, the
// page thanks donors and asks for nothing.
//
// DonateClient.tsx and flags.ts are kept unchanged so the form can come
// back by restoring the previous version of this file.
export const metadata: Metadata = pageMetadata({
  path: "/donate",
  title: "Thank You to Our Donors | Clayton Cuteri",
  description:
    "The 2026 SC-01 race is over and Cuteri for Americans is not accepting contributions right now. Thank you to every donor. Stay in touch and join the American Congress Party.",
  ogTitle: "Thank You to Our Donors",
  ogDescription:
    "The 2026 SC-01 race is over. Thank you to every donor who made Clayton Cuteri's campaign possible.",
  image: ogCard("donate", "Clayton Cuteri seated, with the headline Thank You to Our Donors"),
});

export default function DonatePage() {
  return (
    <>
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              Donors
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Thank You to Our Donors
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              The 2026 race for U.S. House, South Carolina District 1 is over.
              Your support made it possible. Thank you.
            </p>
          </div>
        </div>
      </section>

      <Section bgColor="cream">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif">
            We are not accepting contributions right now
          </h2>
          <p className="mt-4 text-charcoal/80 text-lg leading-relaxed">
            The campaign is closed to new gifts while we finish our final
            reports with the Federal Election Commission. The best way to help
            today is to stay in touch and join the American Congress Party.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <CTAButton variant="primary" href="/#stay-in-touch">
              Stay in Touch
            </CTAButton>
            <CTAButton variant="secondary" href="https://americancongressparty.com">
              Join the American Congress Party
            </CTAButton>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-charcoal/70 leading-relaxed text-center">
            Paid for by Cuteri for Americans (FEC ID C00947259).
          </p>
        </div>
      </Section>
    </>
  );
}
