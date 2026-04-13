import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { ExpandableCard } from "@/components/ExpandableCard";
import { policies, partLabels } from "@/data/policies";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Policies",
  description:
    "Thirteen policy planks drawn from America Reimagined. Real solutions for SC-01, backed by math, not slogans.",
};

function groupByPart(items: typeof policies) {
  const groups: Record<number, typeof policies> = {};
  for (const p of items) {
    if (!groups[p.partNumber]) groups[p.partNumber] = [];
    groups[p.partNumber].push(p);
  }
  return groups;
}

export default function PoliciesPage() {
  const grouped = groupByPart(policies);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-red-accent font-semibold text-sm uppercase tracking-wider mb-3">
              The Platform
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Thirteen Planks, Real Math
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Drawn from &quot;America Reimagined.&quot; Each plank addresses
              real SC-01 problems with concrete proposals. Read the summary, or
              expand to see the full explanation and which problems it solves.
            </p>
          </div>
        </div>
      </section>

      {/* Policies by Part */}
      {Object.entries(grouped).map(([partNum, planks]) => (
        <Section
          key={partNum}
          bgColor={Number(partNum) % 2 === 0 ? "cream" : "white"}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif mb-8">
            {partLabels[Number(partNum)]}
          </h2>
          <div className="space-y-5">
            {planks.map((policy) => (
              <ExpandableCard
                key={policy.id}
                id={`plank-${policy.id}`}
                subtitle={`Plank ${policy.number}`}
                title={policy.title}
                accentColor={policy.number === 13 ? "red" : "navy"}
                summary={
                  <div>
                    <p className="font-medium text-charcoal text-sm mb-2">
                      {policy.plank}
                    </p>
                    <p className="text-charcoal/80 text-sm">
                      {policy.whatItMeans}
                    </p>
                  </div>
                }
              >
                <div className="space-y-5 pt-1">
                  {/* Problems it solves */}
                  {policy.solvesProblems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-navy mb-2">
                        SC-01 Problems It Addresses
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {policy.solvesProblems.map((prob) => (
                          <Link
                            key={prob.id}
                            href={`/problems#problem-${prob.id}`}
                            className="inline-flex items-center gap-1 bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-navy hover:text-white transition-colors"
                          >
                            {prob.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Funded by (for Plank 13) */}
                  {policy.fundedBy && (
                    <div className="bg-red-accent/5 border border-red-accent/20 rounded-md p-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-red-accent mb-1">
                        Funded By
                      </h4>
                      <p className="text-charcoal/80 text-sm">
                        {policy.fundedBy}
                      </p>
                    </div>
                  )}

                  {/* Sub-solutions for Plank 13 */}
                  {policy.subSolutions && policy.subSolutions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-navy mb-3">
                        The Seven-Part Solution
                      </h4>
                      <div className="space-y-3">
                        {policy.subSolutions.map((sub, idx) => (
                          <ExpandableCard
                            key={idx}
                            id={`sub-${policy.id}-${idx}`}
                            title={`${idx + 1}. ${sub.title}`}
                            summary={
                              <p className="text-charcoal/80 text-sm">
                                {sub.plainEnglish}
                              </p>
                            }
                          >
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                                  The Analogy
                                </h5>
                                <p className="text-charcoal/80 text-sm">
                                  {sub.analogy}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                                  What It Means for Charleston
                                </h5>
                                <p className="text-charcoal/80 text-sm">
                                  {sub.charlestonReality}
                                </p>
                              </div>
                              <div className="bg-cream rounded-md p-3">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                                  The Framing
                                </h5>
                                <p className="text-charcoal/80 text-sm">
                                  {sub.framing}
                                </p>
                              </div>
                            </div>
                          </ExpandableCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Read more */}
                  <p className="text-xs text-charcoal/50">
                    Source: {policy.readMore}
                  </p>
                </div>
              </ExpandableCard>
            ))}
          </div>
        </Section>
      ))}

      {/* Financial summary */}
      <Section bgColor="cream">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal font-serif">
            $2.34+ Trillion in Annual Benefit
          </h2>
          <p className="mt-4 text-charcoal/70 text-lg leading-relaxed">
            This is not new spending. This is the elimination of waste, theft,
            and misallocation currently extracted from the American people. Read
            the appendix of &quot;America Reimagined&quot; for the full math.
          </p>
        </div>
      </Section>

      {/* CTA */}
      <Section bgColor="navy">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif">
            Ready to Vote for Real Solutions?
          </h2>
          <p className="mt-4 text-white/80 text-lg leading-relaxed mb-8">
            Writing in Clayton Cuteri takes 30 seconds. The impact lasts a
            generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <CTAButton variant="primary" href="/write-in">
              How to Write Me In
            </CTAButton>
            <CTAButton
              variant="secondary"
              href="/problems"
              className="border-white text-white hover:bg-white hover:text-navy"
            >
              See SC-01 Problems
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
