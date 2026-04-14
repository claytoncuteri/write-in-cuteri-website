import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { ExpandableCard } from "@/components/ExpandableCard";
import { policies, partLabels } from "@/data/policies";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Priorities",
  description:
    "Thirteen priorities for SC-01. What would you do with an extra $582 per month? These policies save Americans $2.34+ trillion per year.",
};

// SC-01 has ~800,000 residents. $2.34T / 335M population * 800K = ~$5.59B for SC-01.
// Per person: $2.34T / 335M = ~$6,988/year = ~$582/month
const PER_PERSON_YEARLY = "$6,988";
const PER_PERSON_MONTHLY = "$582";

function groupByPart(items: typeof policies) {
  const groups: Record<number, typeof policies> = {};
  for (const p of items) {
    if (!groups[p.partNumber]) groups[p.partNumber] = [];
    groups[p.partNumber].push(p);
  }
  return groups;
}

// CTA config: which CTA appears after which part
const partCTAs: Record<number, { variant: "primary" | "secondary"; href: string; label: string; message: string } | null> = {
  1: {
    variant: "primary",
    href: "/write-in",
    label: "Learn How to Write In Clayton",
    message: "Like what you see? On November 3, you can write in Clayton Cuteri for SC-01. Make sure you know how before Election Day.",
  },
  2: {
    variant: "primary",
    href: "/donate",
    label: "Donate to the Campaign",
    message: "Tired of your money going to wars and waste? Fund the alternative.",
  },
  3: {
    variant: "secondary",
    href: "/get-involved",
    label: "Get Involved",
    message: "These priorities start with your community. Join us.",
  },
  4: null,
  5: null,
};

export default function PoliciesPage() {
  const grouped = groupByPart(policies);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              Where Clayton Stands
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Thirteen Priorities for SC-01
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Expand any priority to see the details and the math.
            </p>
          </div>
        </div>
      </section>

      {/* Policies by Part */}
      {Object.entries(grouped).map(([partNum, planks]) => (
        <div key={partNum}>
          <Section bgColor={Number(partNum) % 2 === 0 ? "cream" : "white"}>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif mb-8">
              {partLabels[Number(partNum)]}
            </h2>
            <div className="space-y-5">
              {planks.map((policy) => (
                <ExpandableCard
                  key={policy.id}
                  id={`priority-${policy.id}`}
                  subtitle={`Priority ${policy.number}`}
                  title={policy.title}
                  accentColor={policy.number === 13 ? "red" : "navy"}
                  summary={
                    <p className="text-charcoal/80 text-sm">
                      {policy.plank}
                    </p>
                  }
                >
                  <div className="space-y-5 pt-1">
                    {/* Full explanation */}
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-navy mb-2">
                        What This Means
                      </h4>
                      <p className="text-charcoal/80 text-sm leading-relaxed">
                        {policy.whatItMeans}
                      </p>
                    </div>

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
                              {prob.shortLabel}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Funded by (for Priority 13) */}
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

                    {/* Sub-solutions for Priority 13 */}
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

                    {/* The math */}
                    {policy.netBenefit && (
                      <ExpandableCard
                        id={`math-${policy.id}`}
                        title={`Saves ${policy.netBenefit}`}
                        summary={
                          <p className="text-green-700 text-sm">
                            Nationally. Expand for the breakdown.
                          </p>
                        }
                        accentColor="navy"
                      >
                        {policy.mathBreakdown && (
                          <ul className="space-y-2">
                            {policy.mathBreakdown.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-charcoal/80"
                              >
                                <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">
                                  +
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-xs text-charcoal/50 mt-4">
                          Full breakdown in &quot;America Reimagined&quot; by
                          Clayton Cuteri.
                        </p>
                      </ExpandableCard>
                    )}

                    {/* Source */}
                    <p className="text-xs text-charcoal/50">
                      Source: {policy.readMore}
                    </p>
                  </div>
                </ExpandableCard>
              ))}
            </div>
          </Section>

          {/* Strategic CTA after this group */}
          {partCTAs[Number(partNum)] && (
            <div className="bg-navy/5 py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-charcoal/70 text-base mb-4">
                  {partCTAs[Number(partNum)]!.message}
                </p>
                <CTAButton
                  variant={partCTAs[Number(partNum)]!.variant}
                  href={partCTAs[Number(partNum)]!.href}
                >
                  {partCTAs[Number(partNum)]!.label}
                </CTAButton>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Personal impact hook */}
      <Section bgColor="navy">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
            What this means for you
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-serif">
            {PER_PERSON_MONTHLY} more per month
          </h2>
          <p className="text-white/60 text-lg mt-2">
            {PER_PERSON_YEARLY} per person, per year
          </p>
          <p className="mt-6 text-white/80 text-lg leading-relaxed max-w-xl mx-auto">
            What would you do with an extra {PER_PERSON_MONTHLY} every month?
            Cover your insurance deductible? Pay down your mortgage? Save for
            your kids? That is what these priorities put back in your pocket.
          </p>
          <p className="mt-3 text-white/50 text-sm">
            Based on {PER_PERSON_YEARLY}/person from $2.34+ trillion in national
            savings across all 13 priorities.
          </p>
        </div>
      </Section>

      {/* National equation (expandable for those who want the full breakdown) */}
      <Section bgColor="cream">
        <div className="max-w-2xl mx-auto">
          <ExpandableCard
            id="full-equation"
            title="See the Full National Equation"
            summary={
              <p className="text-charcoal/70 text-sm">
                All 13 priorities add up to $2.34+ trillion saved nationally per
                year. Expand to see each one.
              </p>
            }
          >
            <div className="space-y-3 font-mono text-sm sm:text-base">
              {policies
                .filter((p) => p.netBenefit)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="text-charcoal/70 truncate font-sans">
                      {p.title}
                    </span>
                    <span className="text-green-700 font-semibold whitespace-nowrap">
                      + {p.netBenefit?.replace("/year", "")}
                    </span>
                  </div>
                ))}
              <div className="border-t-2 border-charcoal pt-3 mt-4 flex items-baseline justify-between gap-4">
                <span className="text-charcoal font-bold text-base sm:text-lg font-sans">
                  Total saved per year
                </span>
                <span className="text-green-700 font-bold text-lg sm:text-xl">
                  $2.34+ trillion
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-charcoal/50 font-sans">
              National figures. Per-person share for SC-01 residents:
              {" "}{PER_PERSON_YEARLY}/year ({PER_PERSON_MONTHLY}/month). Not new
              spending. Every dollar comes from eliminating waste, ending
              corporate capture, and redirecting money currently taken from
              working Americans.
            </p>
          </ExpandableCard>
        </div>
      </Section>

      {/* Final CTA */}
      <Section bgColor="navy">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif">
            Remember Clayton Cuteri on November 3
          </h2>
          <p className="mt-4 text-white/80 text-lg leading-relaxed mb-8">
            Writing in a candidate is simple, but you need to know the steps
            before you walk into the booth. Learn how now so you are ready on
            Election Day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton variant="primary" href="/write-in">
              Learn How to Write Me In
            </CTAButton>
            <CTAButton
              variant="secondary"
              href="/get-involved"
              className="border-white text-white hover:bg-white hover:text-navy"
            >
              Spread the Word
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
