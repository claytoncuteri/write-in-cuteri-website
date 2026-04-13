import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { ExpandableCard } from "@/components/ExpandableCard";
import { problems } from "@/data/problems";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SC-01 Problems",
  description:
    "The eight most urgent problems facing Charleston, Berkeley, Beaufort, and Lowcountry communities -- and why both parties have failed to fix them.",
};

export default function ProblemsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-red-accent font-semibold text-sm uppercase tracking-wider mb-3">
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
              title={problem.title}
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
                    Cuteri&apos;s Position
                  </h4>
                  <p className="text-charcoal font-medium text-sm leading-relaxed">
                    {problem.talkingPoint}
                  </p>
                </div>

                {/* Policy planks */}
                {problem.planks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-navy mb-2">
                      Policy Solutions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {problem.planks.map((plank) => (
                        <Link
                          key={plank.id}
                          href={`/policies#plank-${plank.id}`}
                          className="inline-flex items-center gap-1 bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-navy hover:text-white transition-colors"
                        >
                          Plank {plank.number}: {plank.title}
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

      {/* CTA */}
      <Section bgColor="navy" title="Ready to See the Solutions?">
        <p className="text-white/80 text-lg leading-relaxed max-w-2xl mb-8">
          Every problem above has a policy plank. Thirteen concrete proposals,
          grounded in real math, not slogans.
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
            How to Write Me In
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
