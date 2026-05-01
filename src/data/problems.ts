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

// Copy guidance (internal):
// - SC-01 covers Charleston, Berkeley, Dorchester, Beaufort, Colleton, Jasper.
//   Distribute examples so every county shows up across the 8 problems.
// - Specific numbers must cite a primary source (Census ACS, FEMA, NOAA, BLS,
//   SCDOT, SC DES, SC DOE, SCPA, etc.). See /tmp/sc01-research.md.
// - No em dashes (U+2014). Use hyphens, commas, or sentence breaks.

export const problems: Problem[] = [
  {
    id: "insurance",
    number: 1,
    title: "Insurance is Eating Us Alive",
    // NFIP + coastal wind/hail squeeze hits Beaufort + Charleston + Jasper
    // hardest. NOAA Charleston gauge 8665530: 17 high-tide flood days in
    // 2023-24 (record), projected 45-85/yr by 2050. Carriers pulling out of
    // coastal SC is on the record at SC DOI.
    pain: "From the Charleston peninsula to Hilton Head, Beaufort, and Edisto, homeowners are watching premiums double, triple, or get dropped entirely. Flood plus wind and hail coverage runs $5,000 or more a year on top of a mortgage that already squeezes them. Jasper County coastal properties and Bluffton workforce housing feel the same pressure. Some carriers will not write policies in coastal SC at all anymore.",
    cause: "The National Flood Insurance Program is functionally insolvent and FEMA's Risk Rating 2.0 transition is resetting premiums upward across District 1's coast. Private carriers are fleeing the Lowcountry wind and hail market while federal flood maps lag actual flood reality by a decade. The NOAA Charleston tide gauge set a record with 17 high-tide flood days in 2023-24, and projections run 45 to 85 per year by 2050. Meanwhile, $90 billion a year flows to foreign wars instead of domestic resilience.",
    planks: [
      { id: "lowcountry-resilience", number: 13, title: "Lowcountry Resilience" },
      { id: "stop-endless-wars", number: 8, title: "Stop Endless Wars" },
      { id: "open-books", number: 7, title: "Tax Dollar Transparency" },
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
    ],
    talkingPoint:
      "We send $90 billion a year to foreign wars while families in Charleston, Beaufort, and Jasper cannot afford to insure the homes they already own. That ends. Bring the money home, fix the federal flood program, fund Lowcountry resilience.",
  },
  {
    id: "housing",
    number: 2,
    title: "I Cannot Afford to Live Where I Grew Up",
    // Hit Dorchester (Summerville growth), Charleston peninsula, Beaufort
    // (Hilton Head workforce). ACS DP04 median home values: Charleston
    // ~$450,800; Beaufort ~$551,482; Berkeley ~$354,900. Hilton Head
    // Workforce Housing Needs Assessment is a real town document.
    pain: "Median Charleston home prices have nearly doubled in a decade. The pressure does not stop at the Ravenel Bridge. Summerville in Dorchester County has absorbed the growth, Berkeley County starter homes in Goose Creek and Hanahan are getting priced out of reach, and Beaufort County's Hilton Head published its own Workforce Housing Needs Assessment because teachers, hospitality workers, and first responders cannot afford to live on the island they serve. Multi-generation Lowcountry families are being pushed inland while out-of-state investors buy the coast.",
    cause: "Wall Street firms bulk-buy Lowcountry housing as investment portfolios. Federal Reserve cheap-money policy makes the math work for them. ACS data shows Beaufort County's median home value now over $550,000 and Charleston County's over $450,000, while Colleton's remains under $200,000 and working families in every county compete with hedge funds for the same starter inventory.",
    planks: [
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
      { id: "no-federal-income-tax", number: 6, title: "No Federal Income Tax" },
      { id: "free-medication", number: 2, title: "Free Medication" },
      { id: "free-food", number: 1, title: "Free Food for All Americans" },
    ],
    talkingPoint:
      "Wall Street should not get to buy the house your kids were going to grow up in, whether that house is on James Island, in Summerville, or on Hilton Head. Ban corporate bulk-buying, give first-time buyers zero-interest loans, and let District 1 families come home.",
  },
  {
    id: "wars",
    number: 3,
    title: "Stop Sending Our Young Adults to War",
    // Joint Base Charleston (Berkeley/Charleston), MCAS Beaufort + Parris
    // Island. JBC: >70% of Atlantic-bound DoD materiel; ~$11B annual impact.
    // MCAS Beaufort + Parris Island + Naval Hospital ~20,000 personnel.
    pain: "Joint Base Charleston handles more than 70 percent of Atlantic-bound DoD materiel and deploys its C-17 crews constantly. MCAS Beaufort's F/A-18 and F-35B squadrons rotate in and out. Marine recruits from every county pass through Parris Island. Families in Berkeley, Dorchester, Beaufort, Colleton, and Jasper have lost young adults to wars they did not ask for and cannot justify, while military spouses raise kids alone for years at a stretch.",
    cause: "Defense contractors profit from endless deployment. The politicians who vote for war do not have skin in the game; their kids do not enlist. Both parties take turns starting wars; the young adults of District 1 and the rest of the working class fight them.",
    planks: [
      { id: "stop-endless-wars", number: 8, title: "Stop Endless Wars" },
      { id: "honor-first-responders", number: 11, title: "Honor First Responders & Veterans" },
      { id: "open-books", number: 7, title: "Tax Dollar Transparency" },
    ],
    talkingPoint:
      "If Congress votes to send your kid to die in another country, their kids should be the first ones on the plane. Stop offensive wars. Honor the young adults who actually serve.",
  },
  {
    id: "both-parties",
    number: 4,
    title: "Both Parties Have Failed Us",
    pain: "Lifelong Republicans across Berkeley, Dorchester, and Beaufort are exhausted by MAGA chaos. Lifelong Democrats on James Island, in North Charleston, and in Colleton are exhausted by establishment betrayal. Rural voters in Jasper and Colleton feel invisible to both. Everyone in District 1 feels unrepresented, unheard, and used.",
    cause: "The two parties function as a duopoly that profits from conflict. Different talking points, same donors, same outcomes for working families. A record share of Americans now identify as political independents, and District 1's turnout tells the same story.",
    planks: [
      { id: "open-books", number: 7, title: "Tax Dollar Transparency" },
    ],
    talkingPoint:
      "Republicans and Democrats agree on the only thing that matters to them: keeping you fighting each other while they cash the checks. The American Congress Party is for the Americans neither party speaks for.",
  },
  {
    id: "prescriptions",
    number: 5,
    title: "My Retirement Is Being Eaten by Prescription Costs",
    // Retiree-heavy areas: Hilton Head (Beaufort), Mount Pleasant
    // (Charleston), Summerville (Dorchester), and fixed-income rural
    // communities in Colleton and Jasper. Colleton MHI $48,779 is the
    // lowest in SC-01 by a wide margin.
    pain: "The average SC retiree spends $5,000 or more a year out of pocket on prescriptions. Many split pills, skip doses, or choose between meds and groceries. Hilton Head Island, Mount Pleasant, and Summerville all have large 65-and-over populations getting hammered by this. In Colleton County, where the median household income is under $49,000 (ACS 2019-2023), a retired couple on fixed income simply cannot absorb another drug-price increase.",
    cause: "Pharmaceutical companies have captured the regulatory process. Medicare cannot negotiate prices for most drugs. The exact same pills sell for one-tenth the price in Europe.",
    planks: [
      { id: "free-medication", number: 2, title: "Free Medication" },
      { id: "open-books", number: 7, title: "Tax Dollar Transparency" },
      { id: "clean-food-water", number: 4, title: "Clean Food, Clean Water" },
    ],
    talkingPoint:
      "Insulin costs $5 to make and sells for $300. The same pill is $80 in America and $8 in Europe. That is not a market. That is a racket. Free medication, paid for by ending pharma's grip on the federal government.",
  },
  {
    id: "working-class",
    number: 6,
    title: "I Work Hard and Have Nothing Left",
    // Berkeley (Volvo/Boeing supply chain), Charleston (port + hospitality),
    // Beaufort (tourism), Dorchester (Summerville trades). Port $87B
    // statewide, 260,000 jobs; Volvo 1,500 workers + 1,910 new jobs
    // announced; Boeing SC ~9,059 employees.
    pain: "A Port of Charleston longshoreman, a Hilton Head hospitality worker, a Boeing line tech in North Charleston, a Volvo plant worker in Ridgeville, a teacher in Summerville, a Walterboro first responder. District 1's working class works full-time and still struggles. Two jobs to make rent. No savings. One car repair from disaster.",
    cause: "Real wages have not kept up with productivity for 50 years. Income tax plus payroll tax plus sales tax plus inflation eat 40 percent or more of working-class income before they see a dime. The dollar has lost 97 percent of its purchasing power since 1913. The Port of Charleston supports 260,000 jobs statewide and generates $87 billion in economic impact (SCPA), but the workers who move the cargo cannot afford to live on the peninsula they serve.",
    planks: [
      { id: "no-federal-income-tax", number: 6, title: "No Federal Income Tax" },
      { id: "free-food", number: 1, title: "Free Food for All Americans" },
      { id: "free-medication", number: 2, title: "Free Medication" },
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
    ],
    talkingPoint:
      "If you work 40 hours a week on Hilton Head, at the Port, on the Volvo line in Berkeley County, or in a Summerville classroom, you should have a home, food on the table, healthcare, and savings. Right now you have a paycheck stub and a stress headache. The math is broken. Time to fix it.",
  },
  {
    id: "environment",
    number: 7,
    title: "The Lowcountry Is Being Poisoned and Paved",
    // Colleton (ACE Basin), Charleston (marsh + sprawl), Berkeley (Bushy
    // Park industrial TRI), Jasper (Port Royal Sound).
    // ACE Basin NERR ~98,308 acres; initiative preserved ~250,000 acres.
    pain: "Marsh erosion on Sullivan's Island and Edisto. PFAS concerns in drinking water across multiple SC-01 utilities. Sprawl eating Johns Island, the Berkeley County side of the Cainhoy peninsula, and the land between Summerville and Ridgeville. Industrial discharge monitoring around the Bushy Park complex in Goose Creek. Nutrient and development pressure on Port Royal Sound in Beaufort and Jasper. The ACE Basin in Colleton, the largest estuarine reserve on the East Coast at roughly 98,000 protected acres, needs a federal partner that actually funds conservation instead of chipping away at it.",
    cause: "Federal agencies allow chemical companies to pollute below 'acceptable' thresholds set by industry itself. Federal land-use policy enables sprawl. Local environmental damage is treated as somebody else's problem.",
    planks: [
      { id: "clean-food-water", number: 4, title: "Clean Food, Clean Water" },
      { id: "energy-independence", number: 12, title: "Energy Independence" },
      { id: "free-food", number: 1, title: "Free Food for All Americans" },
    ],
    talkingPoint:
      "The Lowcountry's beauty is its economy. Poison the water in Berkeley County, pave the marsh in Charleston, or sell out the ACE Basin in Colleton and you kill the goose. Real EPA accountability, District-1-first land protection, and an end to letting chemical companies grade their own homework.",
  },
  {
    id: "property-tax",
    number: 8,
    title: "My Property Tax Bill Keeps Doubling",
    // Coastal reassessment pressure: Mt. Pleasant, Sullivan's Island, IOP,
    // Folly (Charleston); Hilton Head, Bluffton, Beaufort (Beaufort); Edisto
    // (Colleton); Daufuskie (Beaufort). ACS Beaufort median home value
    // ~$551,482 is the highest in SC-01, so reassessment shock is worst
    // there.
    pain: "Fixed-income retirees in Mount Pleasant, Sullivan's Island, Isle of Palms, Folly Beach, and across Beaufort County on Hilton Head and in Bluffton are getting taxed out of homes they paid off decades ago. Beaufort County's median home value is over $550,000 per ACS, so a reassessment in Bluffton or Port Royal can double a retiree's tax bill in a single cycle. Property reassessments based on speculator-driven market values are punishing the people who built these communities.",
    cause: "Property reassessments use market value (driven by out-of-state investment) without considering occupant income. Local government has grown dependent on property tax revenue. There is no federal floor protecting primary residences.",
    planks: [
      { id: "affordable-housing", number: 9, title: "Affordable Housing" },
      { id: "open-books", number: 7, title: "Tax Dollar Transparency" },
      { id: "no-federal-income-tax", number: 6, title: "No Federal Income Tax" },
    ],
    talkingPoint:
      "If you have owned and lived in your home on Hilton Head, in Mount Pleasant, or on Edisto for 20 years, no government should be able to tax you out of it. Eliminate property taxes on primary residences, period.",
  },
];
