// IssueMatcher quiz content.
//
// Thirteen questions, strict 1:1 mapped to Clayton's thirteen policy
// priorities. Every question is persuasively framed so YES = aligned with
// Clayton's platform. NO = not aligned. UNSURE = neutral (counts for zero).
//
// Why persuasive framing: the goal is to win SC-01 on Nov 3, 2026, not to
// run a neutral survey. Broockman & Kalla (2016) show persuasion works
// strongest when voters self-identify agreement on concrete, named stakes;
// Cialdini commitment-consistency predicts they then internalize the
// position. We accept the framing bias as the cost of the persuasive lift.
// Rank-order per priority is still valid under Krosnick (1999).
//
// Structure:
//   - 8 CORE questions gate the email capture (sequenced highest-yes-first
//     to maximize early-commitment momentum per Cialdini consistency).
//     Lowcountry-first flavor preserved: q1 is Lowcountry drinking water.
//   - 5 EXTENDED questions unlock after email, covering the remaining
//     priorities so every voter can touch every position.
//
// Three stable identifiers per question, intentionally decoupled:
//   - `id` ("q1".."q13"): stable database/analytics foreign key. Never
//     changes; assigned at creation. Does NOT match array position.
//   - `priorityId`: semantic slug matching a /policies priority. Admin
//     dashboard aggregates agreement rates via this field.
//   - Array position: display order. Can be re-sequenced freely without
//     breaking historical data, since id and priorityId both stay stable.

export type QuizAnswer = "yes" | "no" | "unsure";

export interface QuizQuestion {
  id: string;               // q1..q13 - stable forever, used as DB/analytics keys
  priorityId: string;       // 1:1 map to a policy priority slug on /policies
  heading: string;          // short label shown in the progress strip
  prompt: string;           // the persuasively framed question asked to the voter
  aligned: "yes" | "no";    // which answer counts toward the score
  policyRef?: string;       // link slug on /policies for "read more" footer
  rationale: string;        // shown on the results screen after they answer
}

export const CORE_QUESTIONS: QuizQuestion[] = [
  {
    id: "q2",
    priorityId: "clean-food-clean-water",
    heading: "Clean food & water",
    prompt:
      "Should we stop the chemical companies from polluting our water and deciding what's safe for the Lowcountry to drink?",
    aligned: "yes",
    policyRef: "clean-water",
    rationale:
      "End the revolving door between chemical industry lobbyists and EPA rule-writing. PFAS limits set by independent toxicologists.",
  },
  {
    id: "q3",
    priorityId: "veterans-first-responders",
    heading: "Veterans & first responders",
    prompt:
      "Should District 1's 75,000 veterans and first responders finally get the care and pay they earned?",
    aligned: "yes",
    policyRef: "veterans-first-responders",
    rationale:
      "Direct-care VA reform with guaranteed appointment timelines, plus a federal first-responder pay floor indexed to local cost-of-living.",
  },
  {
    id: "q4",
    priorityId: "affordable-housing",
    heading: "Affordable housing",
    prompt:
      "Should hedge funds and corporations be banned from bulk-buying single-family homes that working Lowcountry families are trying to buy?",
    aligned: "yes",
    policyRef: "housing-affordability",
    rationale:
      "End the Hedge Fund Control of Single-Family Homes framework. No institutional buyer should hold more than 50 homes in District 1.",
  },
  {
    id: "q5",
    priorityId: "free-medication",
    heading: "Free medication",
    prompt:
      "Should retirees pay $8 for insulin like Europeans do, instead of the $300 they pay now?",
    aligned: "yes",
    policyRef: "free-medication",
    rationale:
      "Most-favored-nation drug pricing. Americans pay Europe's price or the manufacturer loses U.S. market access.",
  },
  {
    id: "q6",
    priorityId: "stop-endless-wars",
    heading: "Stop endless wars",
    prompt:
      "Should we stop spending $90 billion a year on foreign wars and invest that money in District 1 instead?",
    aligned: "yes",
    policyRef: "end-forever-wars",
    rationale:
      "Every young adult sent to a foreign war, and every dollar that funds it, is a life and a dollar not invested in Lowcountry insurance, veteran care, or first-responder pay.",
  },
  {
    id: "q12",
    priorityId: "no-federal-income-tax",
    heading: "No federal income tax",
    prompt:
      "Should working families keep the $8,000 to $15,000 a year the Federal Government currently takes from their paycheck?",
    aligned: "yes",
    policyRef: "no-federal-income-tax",
    rationale:
      "Replace the federal income tax with a tariff-and-excise system that doesn't punish earning. Full transition plan in the policy book.",
  },
  {
    id: "q1",
    priorityId: "lowcountry-resilience",
    heading: "Lowcountry resilience",
    prompt:
      "Should the Federal Government provide a safety net for coastal insurance so carriers stay in the Lowcountry and bring down the $12,000 per year premium?",
    aligned: "yes",
    policyRef: "coastal-insurance",
    rationale:
      "Federal backstop for Lowcountry coastal insurance modeled after the NFIP so carriers stay and premiums drop.",
  },
  {
    id: "q7",
    priorityId: "open-books",
    heading: "Open books",
    prompt:
      "Should every federal dollar be public online in real time, so you see exactly where your paycheck went?",
    aligned: "yes",
    policyRef: "government-transparency",
    rationale:
      "Real-time public ledger of federal spending. Sunlight is the cheapest accountability we have.",
  },
];

export const EXTENDED_QUESTIONS: QuizQuestion[] = [
  {
    id: "q8",
    priorityId: "free-food",
    heading: "Free food",
    prompt:
      "Should no American child go hungry while we send billions to kill innocent children overseas?",
    aligned: "yes",
    policyRef: "free-food",
    rationale:
      "Universal school meals plus SNAP reform. A country that funds foreign wars can feed its own kids.",
  },
  {
    id: "q9",
    priorityId: "energy-independence",
    heading: "Energy independence",
    prompt:
      "Should South Carolina produce its own clean energy instead of depending on foreign regimes?",
    aligned: "yes",
    policyRef: "energy-independence",
    rationale:
      "Domestic clean-energy build-out so SC keeps the paychecks and the power. Stop importing energy from regimes that hate us.",
  },
  {
    id: "q10",
    priorityId: "end-homelessness",
    heading: "End homelessness",
    prompt:
      "Should homeless veterans and families in Charleston get a real bed and treatment, not another arrest cycle?",
    aligned: "yes",
    policyRef: "end-homelessness",
    rationale:
      "Housing-first with integrated mental-health and substance-abuse care. Cheaper than jail, and it actually works.",
  },
  {
    id: "q11",
    priorityId: "gold-standard",
    heading: "Sound money",
    prompt:
      "Should Congress audit the Federal Reserve and stop the money-printing that's shrinking your paycheck every year?",
    aligned: "yes",
    policyRef: "gold-standard",
    rationale:
      "Full Fed audit, then a phased return to a sound-money standard. Stop the silent transfer of wealth from wage-earners to asset-holders.",
  },
  {
    id: "q13",
    priorityId: "free-education",
    heading: "Free education",
    prompt:
      "Should every SC kid be able to learn a trade or finish college without $100,000 in debt?",
    aligned: "yes",
    policyRef: "free-education",
    rationale:
      "Trade schools and public-college tuition funded by redirecting a fraction of the foreign-war budget. Degrees and credentials without decades of debt.",
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
