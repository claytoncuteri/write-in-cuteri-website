export interface PlankRef {
  id: string;
  number: number;
  title: string;
}

export interface Problem {
  id: string;
  number: number;
  title: string;
  pain: string;
  cause: string;
  planks: PlankRef[];
  talkingPoint: string;
}

export const problems: Problem[] = [
  {
    id: "insurance",
    number: 1,
    title: "Insurance is Eating Us Alive",
    pain: "Charleston homeowners are watching premiums double, triple, or get dropped entirely. Flood plus wind/hail coverage runs $5,000+ per year on top of a mortgage that is already squeezing them. Some carriers will not write policies in coastal SC at all anymore.",
    cause: "The National Flood Insurance Program is functionally insolvent. Private carriers flee coastal markets while federal flood maps lag actual flood reality by a decade. Catastrophic risk is too big for any single carrier to bear, so they exit. Meanwhile, $90 billion a year flows to foreign wars instead of domestic resilience.",
    planks: [
      { id: "lowcountry-resilience", number: 13, title: "Lowcountry Resilience" },
      { id: "stop-endless-wars", number: 8, title: "Stop Endless Wars" },
      { id: "open-books", number: 7, title: "Open Books" },
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
    ],
    talkingPoint:
      "We send $90 billion a year to foreign wars while Charleston families cannot afford to insure the homes they already own. That ends. Bring the money home, fix the federal flood program, fund Lowcountry resilience.",
  },
  {
    id: "housing",
    number: 2,
    title: "I Cannot Afford to Live Where I Grew Up",
    pain: "Median Charleston home prices have nearly doubled in a decade. Tourism workers, teachers, first responders, and multi-generation Lowcountry families are being pushed to North Charleston, Summerville, Hanahan, and beyond. Kids who grew up in Mount Pleasant cannot afford to buy a starter home in Mount Pleasant.",
    cause: "Wall Street firms bulk-buy Lowcountry housing as investment portfolios. Federal Reserve cheap-money policy makes the math work for them. Working families compete with hedge funds for the same starter homes.",
    planks: [
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
      { id: "no-federal-income-tax", number: 6, title: "No Federal Income Tax" },
      { id: "free-medication", number: 2, title: "Free Medication" },
      { id: "free-food", number: 1, title: "Free Food for All Americans" },
    ],
    talkingPoint:
      "Wall Street should not get to buy the house your kids were going to grow up in. Ban corporate bulk-buying, give first-time buyers zero-interest loans, and let Charleston families come home.",
  },
  {
    id: "wars",
    number: 3,
    title: "Stop Sending Our Kids Overseas",
    pain: "Joint Base Charleston deploys constantly. Charleston, Berkeley, Beaufort, and Colleton families have lost children to wars they did not ask for and cannot justify. Military spouses raise kids alone for years at a stretch.",
    cause: "Defense contractors profit from endless deployment. The politicians who vote for war do not have skin in the game; their kids do not enlist. Both parties take turns starting wars; the working class fights them.",
    planks: [
      { id: "stop-endless-wars", number: 8, title: "Stop Endless Wars" },
      { id: "honor-first-responders", number: 11, title: "Honor First Responders & Veterans" },
      { id: "open-books", number: 7, title: "Open Books" },
    ],
    talkingPoint:
      "If Congress votes to send your kid to die in another country, their kids should be the first ones on the plane. Stop offensive wars. Honor the people who actually serve.",
  },
  {
    id: "both-parties",
    number: 4,
    title: "Both Parties Have Failed Us",
    pain: "Lifelong Republicans are exhausted by MAGA chaos. Lifelong Democrats are exhausted by establishment betrayal. Both feel unrepresented, unheard, and used. Even the conservative voters in SC-01 are tired of the current options.",
    cause: "The two parties function as a duopoly that profits from conflict. Different talking points, same donors, same outcomes for working families. A record number of Americans now identify as political independents.",
    planks: [
      { id: "open-books", number: 7, title: "Open Books" },
    ],
    talkingPoint:
      "Republicans and Democrats agree on the only thing that matters to them: keeping you fighting each other while they cash the checks. The American Congress Party is for the Americans neither party speaks for.",
  },
  {
    id: "prescriptions",
    number: 5,
    title: "My Retirement Is Being Eaten by Prescription Costs",
    pain: "The average SC retiree spends $5,000+ per year out of pocket on prescriptions. Many split pills, skip doses, or choose between meds and groceries. Hilton Head, Mount Pleasant, and Beaufort have large 65+ populations getting hammered by this.",
    cause: "Pharmaceutical companies have captured the regulatory process. Medicare cannot negotiate prices for most drugs. The exact same pills sell for one-tenth the price in Europe.",
    planks: [
      { id: "free-medication", number: 2, title: "Free Medication" },
      { id: "open-books", number: 7, title: "Open Books" },
      { id: "clean-food-water", number: 4, title: "Clean Food, Clean Water" },
    ],
    talkingPoint:
      "Insulin costs $5 to make and sells for $300. The same pill is $80 in America and $8 in Europe. That is not a market. That is a racket. Free medication, paid for by ending pharma's grip on the Federal Government.",
  },
  {
    id: "working-class",
    number: 6,
    title: "I Work Hard and Have Nothing Left",
    pain: "Tourism workers, hospitality staff, teachers, first responders, contractors. Charleston's working class works full-time and still struggles. Two jobs to make rent. No savings. One car repair from disaster.",
    cause: "Real wages have not kept up with productivity for 50 years. Income tax plus payroll tax plus sales tax plus inflation eat 40%+ of working-class income before they see a dime. The dollar has lost 97% of its purchasing power since 1913.",
    planks: [
      { id: "no-federal-income-tax", number: 6, title: "No Federal Income Tax" },
      { id: "free-food", number: 1, title: "Free Food for All Americans" },
      { id: "free-medication", number: 2, title: "Free Medication" },
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
    ],
    talkingPoint:
      "If you work 40 hours a week, you should have a home, food on the table, healthcare, and savings. Right now you have a paycheck stub and a stress headache. The math is broken. Time to fix it.",
  },
  {
    id: "environment",
    number: 7,
    title: "The Lowcountry Is Being Poisoned and Paved",
    pain: "Marsh erosion. PFAS in drinking water. Sprawl eating Johns Island and the sea islands. Tourism degrading the very thing that makes Charleston worth visiting. Glyphosate residue in coastal farms.",
    cause: "Federal agencies allow chemical companies to pollute below 'acceptable' thresholds set by industry itself. Federal land-use policy enables sprawl. Local environmental damage is treated as somebody else's problem.",
    planks: [
      { id: "clean-food-water", number: 4, title: "Clean Food, Clean Water" },
      { id: "energy-independence", number: 12, title: "Energy Independence" },
      { id: "free-food", number: 1, title: "Free Food for All Americans" },
    ],
    talkingPoint:
      "Charleston's beauty is its economy. Poison the water, pave the marshes, and you kill the goose. Real EPA accountability, Lowcountry-first land protection, and an end to letting chemical companies grade their own homework.",
  },
  {
    id: "property-tax",
    number: 8,
    title: "My Property Tax Bill Keeps Doubling",
    pain: "Fixed-income retirees in Mount Pleasant, Sullivan's Island, Isle of Palms, and Folly Beach are getting taxed out of homes they paid off decades ago. Property reassessments based on speculator-driven market values are punishing the people who built these communities.",
    cause: "Property reassessments use market value (driven by out-of-state investment) without considering occupant income. Local government has grown dependent on property tax revenue. There is no federal floor protecting primary residences.",
    planks: [
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
      { id: "open-books", number: 7, title: "Open Books" },
      { id: "no-federal-income-tax", number: 6, title: "No Federal Income Tax" },
    ],
    talkingPoint:
      "If you have owned and lived in your home for 20 years, no government should be able to tax you out of it. Eliminate property taxes on primary residences, period.",
  },
];
