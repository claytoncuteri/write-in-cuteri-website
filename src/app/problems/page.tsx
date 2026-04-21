import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { ExpandableCard } from "@/components/ExpandableCard";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { problems } from "@/data/problems";
import Link from "next/link";
import { Printer } from "lucide-react";

export const metadata: Metadata = {
  title: "SC-01 Problems | Lowcountry Insurance, Housing, and More",
  description:
    "The eight biggest issues facing South Carolina District 1 voters in Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper counties: coastal flood insurance costs, the housing affordability crisis, cost of living, and more. Why both parties have failed SC-01 voters and what Clayton Cuteri will do about it.",
};

export default function ProblemsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              SC-01 Problems
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              What SC-01 Voters Are Living With
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              These are not abstractions. These are the real problems reported by
              Charleston, Berkeley, Beaufort, Dorchester, Colleton, and Jasper
              County families. Both parties have had decades to fix them. Neither
              has.
            </p>
          </div>
        </div>
      </section>

      {/* Problems list */}
      <Section>
        <div className="space-y-5">
          {problems.map((problem) => (
            <ExpandableCard
              key={problem.id}
              id={`problem-${problem.id}`}
              subtitle={`Problem ${problem.number} of 8`}
              title={`\u201C${problem.title}\u201D`}
              summary={
                <p className="text-charcoal/80">{problem.pain}</p>
              }
            >
              <div className="space-y-5 pt-1">
                {/* Root cause */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-navy mb-2">
                    Why It Happens
                  </h4>
                  <p className="text-charcoal/80 text-sm leading-relaxed">
                    {problem.cause}
                  </p>
                </div>

                {/* Talking point */}
                <div className="bg-cream rounded-md p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-red-accent mb-2">
                    Clayton&apos;s Position
                  </h4>
                  <p className="text-charcoal font-medium text-sm leading-relaxed">
                    {problem.talkingPoint}
                  </p>
                </div>

                {/* Policy solutions */}
                {problem.planks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-navy mb-2">
                      Policy Solutions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {problem.planks.map((plank) => (
                        <Link
                          key={plank.id}
                          href={`/policies#priority-${plank.id}`}
                          className="inline-flex items-center gap-1 bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-navy hover:text-white transition-colors"
                        >
                          {plank.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ExpandableCard>
          ))}
        </div>
      </Section>

      {/* Wallet card */}
      <Section bgColor="cream">
        <div className="max-w-xl mx-auto text-center">
          <Printer size={32} className="text-navy mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-charcoal font-serif">
            Remember the Name on Election Day
          </h2>
          <p className="mt-2 text-charcoal/70">
            Print a wallet-sized card with the correct spelling and bring it to
            the polls on November 3.
          </p>
          <div className="mt-5">
            <PdfDownloadButton href="/images/cuteri-wallet-card.pdf">
              Download Wallet Card (PDF)
            </PdfDownloadButton>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section bgColor="navy" title="Ready to See the Solutions?">
        <p className="text-white/80 text-lg leading-relaxed max-w-2xl mb-8">
          Every problem above has a policy solution. Thirteen concrete proposals,
          grounded in real numbers, not slogans.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <CTAButton variant="primary" href="/policies">
            See the Full Platform
          </CTAButton>
          <CTAButton
            variant="secondary"
            href="/write-in"
            className="border-white text-white hover:bg-white hover:text-navy"
          >
            Learn How to Write Me In
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
