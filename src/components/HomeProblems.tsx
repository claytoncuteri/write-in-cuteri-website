"use client";

import { useState } from "react";
import { problems } from "@/data/problems";
import { Section } from "@/components/Section";
import { ArrowRight, ChevronDown } from "lucide-react";

export function HomeProblems() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? problems : problems.slice(0, 4);

  return (
    <Section
      title="What District 1 Voters Are Telling Us"
      subtitle="These are the most urgent issues facing Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper counties."
    >
      <div className="grid sm:grid-cols-2 gap-6">
        {displayed.map((problem) => (
          <div
            key={problem.id}
            className="bg-cream rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-navy/60">
              Problem {problem.number}
            </span>
            <h3 className="mt-1 text-xl font-bold text-charcoal font-serif">
              &ldquo;{problem.title}&rdquo;
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm leading-relaxed">
              {problem.pain.split(". ").slice(0, 2).join(". ")}.
            </p>
            <p className="mt-3 text-sm font-semibold text-navy">
              Clayton&apos;s answer:{" "}
              <span className="font-normal text-charcoal/70">
                {problem.planks.map((p) => p.title).join(", ")}
              </span>
            </p>
            <a
              href={`/problems#problem-${problem.id}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-navy-dark transition-colors"
            >
              Read more <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        {!showAll ? (
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-navy border-2 border-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors"
          >
            See All 8 District 1 Problems
            <ChevronDown size={18} />
          </button>
        ) : (
          <a
            href="/problems"
            className="inline-flex items-center gap-2 px-6 py-3 text-navy border-2 border-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors"
          >
            View Full Problem Details
            <ArrowRight size={18} />
          </a>
        )}
      </div>
    </Section>
  );
}
