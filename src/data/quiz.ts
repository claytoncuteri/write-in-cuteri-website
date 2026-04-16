// IssueMatcher quiz content.
//
// Every question is slanted so that YES = aligned with Clayton's policy
// platform. NO = not aligned. UNSURE = neutral (counts for zero). This lets
// us display a simple "you agree with Clayton on X of Y issues" score that
// the user intuitively grasps and is willing to share.
//
// Six core questions gate the email capture. Four extended questions unlock
// after email is submitted. Completion benchmarks (research-backed):
//   - Core-six completion rate should beat 60%.
//   - Extended conversion (email-submitters who finish extended) should beat 25%.

export type QuizAnswer = "yes" | "no" | "unsure";

export interface QuizQuestion {
  id: string;               // q1..q10  -  stable forever, used as DB/analytics keys
  heading: string;          // short label shown in the progress strip
  prompt: string;           // the slanted question asked to the voter
  aligned: "yes" | "no";    // which answer counts toward the score
  policyRef?: string;       // link slug on /policies for "read more" footer
  rationale: string;        // shown on the results screen after they answer
}

export const CORE_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    heading: "Home insurance",
    prompt:
      "Are you tired of Charleston families paying $12,000 a year for home insurance while carriers keep leaving the state?",
    aligned: "yes",
    policyRef: "coastal-insurance",
    rationale:
      "Clayton wants a federal backstop for Lowcountry coastal insurance modeled after the NFIP so carriers stay and premiums drop.",
  },
  {
    id: "q2",
    heading: "Wall Street homes",
    prompt:
      "Should hedge funds and corporations be banned from bulk-buying single-family homes that working families are trying to buy?",
    aligned: "yes",
    policyRef: "housing-affordability",
    rationale:
      "Clayton supports the End Hedge Fund Control of Single-Family Homes framework  -  no institutional buyer should hold more than 50 homes in SC-01.",
  },
  {
    id: "q3",
    heading: "Property tax",
    prompt:
      "Should retirees and long-time homeowners be protected from being taxed out of the home they have lived in and paid off?",
    aligned: "yes",
    policyRef: "property-tax-protection",
    rationale:
      "Homestead caps on assessed value after 10 years of residency. No one should lose their paid-off home to a tax bill.",
  },
  {
    id: "q4",
    heading: "Foreign wars",
    prompt:
      "Should the U.S. stop sending $90 billion a year to foreign wars that kill innocent people, and bring that money home to insure and house our own families?",
    aligned: "yes",
    policyRef: "end-forever-wars",
    rationale:
      "Every dollar sent to a foreign war is a dollar not spent on Lowcountry insurance, veteran care, or first-responder pay.",
  },
  {
    id: "q5",
    heading: "Drug pricing",
    prompt:
      "Should Americans pay the same price for insulin as Europeans do  -  $8 instead of $300?",
    aligned: "yes",
    policyRef: "free-medication",
    rationale:
      "Most-favored-nation drug pricing. Americans pay Europe's price or the manufacturer loses U.S. market access.",
  },
  {
    id: "q6",
    heading: "Open books",
    prompt:
      "Should every dollar the federal government spends be publicly visible online in real time, line by line?",
    aligned: "yes",
    policyRef: "government-transparency",
    rationale:
      "Real-time public ledger of federal spending. Sunlight is the cheapest accountability we have.",
  },
];

export const EXTENDED_QUESTIONS: QuizQuestion[] = [
  {
    id: "q7",
    heading: "Clean water",
    prompt:
      "Should chemical companies be stopped from writing their own pollution standards and poisoning Lowcountry water?",
    aligned: "yes",
    policyRef: "clean-water",
    rationale:
      "End the revolving door between chemical industry lobbyists and EPA rule-writing. PFAS limits set by independent toxicologists.",
  },
  {
    id: "q8",
    heading: "Veterans & first responders",
    prompt:
      "Should the VA stop failing our veterans, and should first responders finally get pay that matches what they risk every shift?",
    aligned: "yes",
    policyRef: "veterans-first-responders",
    rationale:
      "Direct-care VA reform with guaranteed appointment timelines, plus a federal first-responder pay floor indexed to local cost-of-living.",
  },
  {
    id: "q9",
    heading: "Paycheck",
    prompt:
      "Should working families keep $8,000 to $15,000 more per year by replacing the federal income tax with a simpler system that doesn't punish work?",
    aligned: "yes",
    policyRef: "no-federal-income-tax",
    rationale:
      "Replace the federal income tax with a tariff-and-excise system that doesn't punish earning. Full transition plan in the policy book.",
  },
  {
    id: "q10",
    heading: "End the Fed",
    prompt:
      "Should Congress audit the Federal Reserve and end the hidden inflation tax that's eroding your paycheck and your savings?",
    aligned: "yes",
    policyRef: "gold-standard",
    rationale:
      "Full Fed audit, then a phased return to a sound-money standard. Stop the silent transfer of wealth from wage-earners to asset-holders.",
  },
];

export const ALL_QUESTIONS: QuizQuestion[] = [
  ...CORE_QUESTIONS,
  ...EXTENDED_QUESTIONS,
];

export function scoreAnswers(
  answers: Record<string, QuizAnswer>,
  questions: QuizQuestion[],
): number {
  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.aligned) score++;
  }
  return score;
}
