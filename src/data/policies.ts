export interface SubSolution {
  title: string;
  plainEnglish: string;
  analogy: string;
  districtReality: string;
  framing: string;
}

export interface Policy {
  id: string;
  number: number;
  title: string;
  part: string;
  partNumber: number;
  plank: string;
  whatItMeans: string;
  solvesProblems: { id: string; title: string; shortLabel: string }[];
  readMore: string;
  netBenefit?: string;
  mathBreakdown?: string[];
  subSolutions?: SubSolution[];
  fundedBy?: string;
}

export const policies: Policy[] = [
  {
    id: "free-food",
    number: 1,
    title: "Free Food for All Americans",
    part: "The Foundation",
    partNumber: 1,
    plank:
      "Lease unused federal land to regenerative farmers at zero cost. Farmers keep 70% of profits; 40% of production distributed free. Ban glyphosate and toxic chemicals. Ban foreign ownership of American farmland.",
    whatItMeans:
      "America has tens of millions of acres of unused federal land. Lease that land to American farmers who agree to grow without poison, in exchange for distributing nearly half of what they grow free to the people. The farmer keeps 70% of profits on what they sell. The American people get clean food. The land regenerates. Foreign corporations stop owning the soil that feeds us.",
    solvesProblems: [
      { id: "working-class", title: "I Work Hard and Have Nothing Left", shortLabel: "Working-class wage gap" },
      { id: "environment", title: "The Lowcountry Is Being Poisoned and Paved", shortLabel: "Lowcountry environmental damage" },
    ],
    netBenefit: "$325+ billion/year",
    mathBreakdown: [
      "$150B saved by replacing fragmented food assistance programs",
      "$100B in healthcare savings from improved nutrition",
      "$150B+ in economic stimulus from 47.9 million Americans freed from food insecurity",
      "$75B annual program cost",
    ],
    readMore: "America Reimagined, Chapter 2",
  },
  {
    id: "free-medication",
    number: 2,
    title: "Free Medication",
    part: "The Foundation",
    partNumber: 1,
    plank:
      "Eliminate the profit motive from essential medicine. Free medication for all Americans. Restore natural and traditional healing to medical education. Legalize all plants for medical research.",
    whatItMeans:
      "Insulin costs $5 to make and sells for $300. The same pill is $80 in America and $8 in Europe. That gap is not market dynamics; it is institutional capture by pharmaceutical companies. Free essential medicine, paid for by ending pharma's grip on the Federal Government and the FDA. Restore the medical knowledge that was deliberately suppressed when the AMA aligned with chemical companies in the early 1900s.",
    solvesProblems: [
      { id: "prescriptions", title: "My Retirement Is Being Eaten by Prescription Costs", shortLabel: "Skyrocketing prescription costs" },
      { id: "working-class", title: "I Work Hard and Have Nothing Left", shortLabel: "Working-class wage gap" },
    ],
    netBenefit: "$285 billion/year",
    mathBreakdown: [
      "$650B in total savings from eliminating pharma markup on essential medicine",
      "$365B annual program cost",
    ],
    readMore: "America Reimagined, Chapter 3",
  },
  {
    id: "free-education",
    number: 3,
    title: "Free Education",
    part: "The Foundation",
    partNumber: 1,
    plank:
      "Redesign education from compliance-based to curiosity-driven. Free at all levels. Indigo education: meditation, breathwork, financial literacy, gardening, sacred geometry. Increase teacher pay to reflect their true value.",
    whatItMeans:
      "Our schools were designed in the industrial era to produce factory workers who could follow orders. We are not in that era anymore. Education should awaken curiosity, not extinguish it. Free at every level so cost never blocks ability. Real-world skills like financial literacy and gardening alongside core subjects. Pay teachers what they are worth.",
    solvesProblems: [
      { id: "working-class", title: "I Work Hard and Have Nothing Left", shortLabel: "Working-class wage gap" },
    ],
    netBenefit: "$5+ billion/year",
    mathBreakdown: [
      "$215B saved through eliminated redundancy and improved outcomes",
      "$210B annual cost after transition period",
    ],
    readMore: "America Reimagined, Chapter 4",
  },
  {
    id: "clean-food-water",
    number: 4,
    title: "Clean Food, Clean Water",
    part: "The Foundation",
    partNumber: 1,
    plank:
      "Strict pollution enforcement. Remove fluoride and PFAS from water. Reforestation and soil regeneration. Eliminate nuclear energy. Lead global nuclear disarmament. Reconnect Americans to the land.",
    whatItMeans:
      "Every American deserves food that does not poison them and water that does not sicken their children. Ban glyphosate. Remove fluoride and PFAS from public water. Hold chemical companies accountable instead of letting them write their own pollution thresholds. Restore the soil, restore the forests, restore the relationship between Americans and the land they live on.",
    solvesProblems: [
      { id: "environment", title: "The Lowcountry Is Being Poisoned and Paved", shortLabel: "Lowcountry environmental damage" },
      { id: "prescriptions", title: "My Retirement Is Being Eaten by Prescription Costs", shortLabel: "Skyrocketing prescription costs" },
    ],
    netBenefit: "$155+ billion/year",
    mathBreakdown: [
      "$290B saved from reduced chronic disease and avoided pollution cleanup",
      "$135B annual federal enforcement cost",
    ],
    readMore: "America Reimagined, Chapter 5",
  },
  {
    id: "gold-standard",
    number: 5,
    title: "Return to Gold Standard",
    part: "Breaking Free",
    partNumber: 2,
    plank:
      "End the Federal Reserve. Return to sound, gold-backed money. Restore Congressional control of the money supply as the Constitution intended.",
    whatItMeans:
      "The dollar has lost 97% of its purchasing power since 1913. That is the year the Federal Reserve was created. That is not a coincidence. End the Fed. Return money to its constitutional role: a unit of value backed by something real, controlled by elected representatives, not unelected bankers.",
    solvesProblems: [
      { id: "working-class", title: "I Work Hard and Have Nothing Left", shortLabel: "Working-class wage gap" },
      { id: "both-parties", title: "Both Parties Have Failed Us", shortLabel: "Two-party failure" },
    ],
    netBenefit: "$200+ billion/year",
    mathBreakdown: [
      "$200B+ saved by ending the hidden inflation tax on every American",
      "Dollar has lost 97% of purchasing power since 1913",
      "Sound money restores stability to savings and wages",
    ],
    readMore: "America Reimagined, Chapter 6",
  },
  {
    id: "no-federal-income-tax",
    number: 6,
    title: "No Federal Income Tax",
    part: "Breaking Free",
    partNumber: 2,
    plank:
      "Complete elimination of federal income tax, capital gains tax, estate tax, and payroll taxes. Implement Fair Tax (consumption-based). Eliminate the IRS. Eliminate property taxes on primary residences.",
    whatItMeans:
      "A working family of 4 keeps an extra $8,000 to $15,000 per year. The federal government still collects revenue, just through consumption (you control how much you pay by what you buy) instead of through wage garnishment. The IRS, the most-feared agency in America, becomes unnecessary.",
    solvesProblems: [
      { id: "working-class", title: "I Work Hard and Have Nothing Left", shortLabel: "Working-class wage gap" },
      { id: "property-tax", title: "My Property Tax Bill Keeps Doubling", shortLabel: "Rising property taxes" },
      { id: "housing", title: "I Cannot Afford to Live Where I Grew Up", shortLabel: "Unaffordable housing" },
    ],
    netBenefit: "$500+ billion/year",
    mathBreakdown: [
      "$8,000 to $15,000 kept per year by a working family of 4",
      "Fair Tax (consumption-based) replaces income tax revenue",
      "IRS eliminated entirely",
      "Property taxes eliminated on primary residences",
    ],
    readMore: "America Reimagined, Chapter 7",
  },
  {
    id: "open-books",
    number: 7,
    title: "Open Books",
    part: "Breaking Free",
    partNumber: 2,
    plank:
      "Real-time public platform showing all government spending. Citizen approve/disapprove system for expenditures. Eliminate the Secret Service. Full financial transparency at every level of government.",
    whatItMeans:
      "If they spent your money on it, you have the right to see it line by line. A real-time public platform shows every dollar the government spends, who it went to, and what for. Voters can flag suspicious expenditures. Both parties become accountable to the people they serve, not just to donors.",
    solvesProblems: [
      { id: "both-parties", title: "Both Parties Have Failed Us", shortLabel: "Two-party failure" },
      { id: "insurance", title: "Insurance is Eating Us Alive", shortLabel: "Coastal insurance crisis" },
      { id: "wars", title: "Stop Sending Our Young Adults to War", shortLabel: "Sent to war" },
    ],
    netBenefit: "$500+ billion/year",
    mathBreakdown: [
      "$2.4 trillion in improper government payments over the past 20 years",
      "$2.8 billion sent to dead people by federal agencies",
      "Real-time public visibility stops waste before it happens",
    ],
    readMore: "America Reimagined, Chapter 8",
  },
  {
    id: "stop-endless-wars",
    number: 8,
    title: "Stop Endless Wars",
    part: "Breaking Free",
    partNumber: 2,
    plank:
      "Strong defensive military, zero offensive operations. Congressional vote required for all military action. Politicians who vote for war register their children for deployment. Close the defense contractor revolving door.",
    whatItMeans:
      "America has the strongest military on earth. We use it for defense, not for empire. Every offensive military action requires a Congressional vote, and every member who votes yes must register their own children first. Defense contractors no longer get to write the policies that fund them.",
    solvesProblems: [
      { id: "wars", title: "Stop Sending Our Young Adults to War", shortLabel: "Sent to war" },
      { id: "insurance", title: "Insurance is Eating Us Alive", shortLabel: "Coastal insurance crisis" },
      { id: "both-parties", title: "Both Parties Have Failed Us", shortLabel: "Two-party failure" },
    ],
    netBenefit: "$200+ billion/year",
    mathBreakdown: [
      "~$8 trillion spent on wars since 2001",
      "$90B+ per year currently sent to foreign conflicts",
      "Redirected to domestic infrastructure and resilience",
      "Defense contractor revolving door closed",
    ],
    readMore: "America Reimagined, Chapter 9",
  },
  {
    id: "affordable-housing",
    number: 9,
    title: "Affordable Housing",
    part: "Securing the Foundation",
    partNumber: 3,
    plank:
      "Ban corporate bulk-buying of residential properties. Zero-interest government loans for first-time homebuyers. Convert 770,000+ vacant federal properties. Eliminate property taxes on primary residences.",
    whatItMeans:
      "Wall Street should not get to buy the house your kids were going to grow up in. Ban hedge funds and corporations from bulk-buying single-family homes. Zero-interest federal loans for first-time buyers. Convert hundreds of thousands of vacant federal properties into homes. Federal-level protection from being taxed out of your primary residence.",
    solvesProblems: [
      { id: "housing", title: "I Cannot Afford to Live Where I Grew Up", shortLabel: "Unaffordable housing" },
      { id: "property-tax", title: "My Property Tax Bill Keeps Doubling", shortLabel: "Rising property taxes" },
    ],
    netBenefit: "$50+ billion/year",
    mathBreakdown: [
      "770,000+ vacant federal properties converted to housing",
      "Zero-interest loans for first-time homebuyers",
      "Corporate bulk-buying of residential properties banned",
      "Property tax eliminated on primary residences",
    ],
    readMore: "America Reimagined, Chapter 10",
  },
  {
    id: "end-homelessness",
    number: 10,
    title: "End Homelessness",
    part: "Securing the Foundation",
    partNumber: 3,
    plank:
      "Housing First approach with comprehensive support services. Redirect $20 billion from foreign military aid. Veterans receive immediate housing. No American sleeps on the street.",
    whatItMeans:
      "Over 771,000 Americans sleep without shelter every night in the wealthiest nation in human history. Housing First, with comprehensive mental health, addiction, and employment support. Funded by redirecting $20 billion annually from foreign military aid. Veterans get housed immediately, no exceptions.",
    solvesProblems: [
      { id: "insurance", title: "Insurance is Eating Us Alive", shortLabel: "Coastal insurance crisis" },
      { id: "housing", title: "I Cannot Afford to Live Where I Grew Up", shortLabel: "Unaffordable housing" },
    ],
    netBenefit: "$10+ billion/year",
    mathBreakdown: [
      "Housing First costs less than ERs, jails, and shelters combined",
      "$20B redirected annually from foreign military aid",
      "Veterans receive immediate housing, no exceptions",
    ],
    readMore: "America Reimagined, Chapter 11",
  },
  {
    id: "honor-first-responders",
    number: 11,
    title: "Honor First Responders & Veterans",
    part: "Securing the Foundation",
    partNumber: 3,
    plank:
      "Substantial pay increases. Quadruple training hours. Mandatory mental health support. Adrenaline management through Brazilian Jiu Jitsu. Restore public honor and recognition.",
    whatItMeans:
      "The people who run toward danger so the rest of us do not have to deserve to be paid like it matters. Quadruple training, mandatory mental health support, real adrenaline management techniques. Restore public honor for first responders and veterans alike.",
    solvesProblems: [
      { id: "wars", title: "Stop Sending Our Young Adults to War", shortLabel: "Sent to war" },
      { id: "both-parties", title: "Both Parties Have Failed Us", shortLabel: "Two-party failure" },
    ],
    netBenefit: "$5+ billion/year",
    mathBreakdown: [
      "Quadrupled training hours and real pay increases",
      "Mandatory mental health support reduces turnover",
      "Investment pays back through better outcomes and retention",
    ],
    readMore: "America Reimagined, Chapter 12",
  },
  {
    id: "energy-independence",
    number: 12,
    title: "Energy Independence",
    part: "Energy Independence",
    partNumber: 4,
    plank:
      "Repeal the Invention Secrecy Act. Release suppressed technologies. Develop ocean wave energy, road kinetic harvesting. Open-source all publicly funded technology on blockchain. Federal grants for energy innovation.",
    whatItMeans:
      "Since 1951, the federal government has secretly classified over 6,500 patents as 'national security threats' and prevented the inventors from using or selling them. Many cover energy. Repeal the Act. Release the tech. Develop new American energy sources from the ocean and the roads we already drive on. All publicly funded research becomes public on day one.",
    solvesProblems: [
      { id: "insurance", title: "Insurance is Eating Us Alive", shortLabel: "Coastal insurance crisis" },
      { id: "environment", title: "The Lowcountry Is Being Poisoned and Paved", shortLabel: "Lowcountry environmental damage" },
      { id: "working-class", title: "I Work Hard and Have Nothing Left", shortLabel: "Working-class wage gap" },
    ],
    netBenefit: "$100+ billion/year",
    mathBreakdown: [
      "6,500+ suppressed patents released to the public",
      "All publicly funded technology open-sourced on blockchain",
      "Conservative estimate; grows to $300B+ at full implementation",
    ],
    readMore: "America Reimagined, Chapter 13",
  },
  {
    id: "lowcountry-resilience",
    number: 13,
    title: "Lowcountry Resilience",
    part: "SC-01 Specific",
    partNumber: 5,
    plank:
      "Bring competition back to coastal insurance, mitigation back to coastal communities, and accountability back to disaster spending.",
    whatItMeans:
      "Charleston families pay $5,000+ per year for flood, wind, and hail coverage on top of mortgages they can already barely afford. Carriers are abandoning the market entirely. Federal flood maps are a decade out of date. The National Flood Insurance Program is functionally bankrupt. Meanwhile, $90 billion a year flows to foreign wars while the homes we already have cannot be insured against the storms we already see.",
    solvesProblems: [
      { id: "insurance", title: "Insurance is Eating Us Alive", shortLabel: "Coastal insurance crisis" },
      { id: "environment", title: "The Lowcountry Is Being Poisoned and Paved", shortLabel: "Lowcountry environmental damage" },
    ],
    readMore: "Lowcountry Resilience Explained (campaign kit)",
    fundedBy:
      "Redirect $20 billion annually from foreign military aid. American money for American homes.",
    subSolutions: [
      {
        title: "Federal Catastrophic Reinsurance Backstop",
        plainEnglish:
          "Insurance for insurance companies, but only for the absolute worst-case disasters. The government becomes the safety net beneath the safety net.",
        analogy:
          "In 1957, Congress passed the Price-Anderson Act, making the federal government the insurer of last resort for nuclear catastrophes. This made nuclear power viable in America. Without it, no carrier would touch a nuclear plant.",
        districtReality:
          "Right now, insurance carriers are pulling out of South Carolina because if a Category 5 hurricane levels the coast, they could go bankrupt paying claims. With a federal backstop, carriers know that if losses exceed a certain threshold, the government covers everything above that. The carrier's exposure is capped. They become willing to compete for your business again.",
        framing:
          "This is not a government takeover of insurance. It is the government playing the role only the government can play: backstopping risks too big for any private actor to bear, so the private market can function for everything else.",
      },
      {
        title: "Interstate Insurance Compact",
        plainEnglish:
          "Let insurance carriers licensed in any state sell policies in every state, without 50 different sets of paperwork.",
        analogy:
          "Until 1994, an Ohio bank could not easily open branches in California. Then the Riegle-Neal Act allowed interstate banking, and competition increased. Consumer prices dropped. Insurance needs the same fix.",
        districtReality:
          "Right now, only a handful of carriers will write home insurance in coastal SC. They charge whatever they want because there is no real competition. If dozens more carriers could easily enter the SC market, they would compete for your business and premiums would drop.",
        framing:
          "This is a deregulation move. Removing artificial barriers to competition lets the free market actually work.",
      },
      {
        title: "Disaster Resilience Savings Accounts",
        plainEnglish:
          "A tax-free savings account specifically for hurricane preparation, mitigation upgrades, and insurance deductibles. Works like an HSA, but for storms.",
        analogy:
          "Health Savings Accounts (HSAs) let you put money in tax-free, grow it tax-free, and spend it tax-free on medical expenses. Millions of Americans use them. They work. This is the same concept for disaster preparation.",
        districtReality:
          "Most Charleston families do not have $10,000 sitting around for a hurricane deductible or to install impact windows. With a Disaster Resilience Account, you put $5,000 per year in pre-tax, and that money grows. When a storm hits, you have your deductible covered.",
        framing:
          "This puts disaster preparation in the hands of families, not bureaucrats. You decide when and how to use the money. The government just stops taxing you for being responsible.",
      },
      {
        title: "Modernize Federal Flood Maps",
        plainEnglish:
          "Update FEMA's flood maps using current data instead of 10- to 20-year-old estimates, so flood insurance prices match actual risk.",
        analogy:
          "Imagine if your car insurance rate was based on the value of your car in 2010. You would either be paying way too much or way too little. Insurance only works when the data behind it is current.",
        districtReality:
          "Many SC neighborhoods are classified on flood maps drawn before sea levels rose, before development paved over wetlands. Some homes in West Ashley are classified 'low risk' but flood three times a year. Updated maps mean accurate pricing for everyone.",
        framing:
          "Real data, public access, accurate pricing. No government should be running an insurance program on stale data.",
      },
      {
        title: "Federal Mitigation Grants",
        plainEnglish:
          "Government pays homeowners directly to make their houses more storm-resistant: elevating foundations, installing impact-resistant windows, hardening roofs.",
        analogy:
          "After Hurricane Andrew (1992), Florida funded 'wind mitigation' upgrades. When later hurricanes hit, those upgraded homes survived dramatically better. Insurance companies started offering discounts. The investment paid for itself many times over.",
        districtReality:
          "Elevating a home costs $30,000 to $80,000. Most families cannot afford this alone. With federal mitigation grants, a family pays maybe 20% and the government pays 80%. Premiums drop because risk drops. Preventing $200,000 in damage with $40,000 in mitigation is just good math.",
        framing:
          "This is not a giveaway. It is an investment that returns 5x to 10x in averted disaster claims. The current model, letting homes get destroyed and then paying to rebuild, is the most expensive option.",
      },
      {
        title: "Repeal the Invention Secrecy Act",
        plainEnglish:
          "Since 1951, the federal government has secretly classified over 6,500 patents. Many cover hurricane-resistant building materials, modular construction methods, and storm-hardened glass.",
        analogy:
          "Imagine Henry Ford invented the assembly line in 1913, and the government locked it away forever. That is what is happening to thousands of American inventors on technologies that could change lives.",
        districtReality:
          "Some of those classified patents are for building materials that survive Category 5 winds. We literally have technology in government vaults that could make Charleston homes nearly hurricane-proof. We just cannot use it. Repealing the Act unlocks that tech.",
        framing:
          "This is already in the Energy Independence priority. Lowcountry Resilience makes the storm-resistance application explicit.",
      },
      {
        title: "Bring Reinsurance Home",
        plainEnglish:
          "Reinsurance is the insurance that insurance companies buy for themselves. Most of it currently happens in Bermuda and London. Bring those markets back to the US.",
        analogy:
          "For decades, American factories moved overseas, and we lost critical capacity at home. The same thing happened with reinsurance: the global market consolidated offshore, and now American disaster premiums fund foreign economies.",
        districtReality:
          "When you pay your homeowner's insurance, a chunk of that premium gets paid to a reinsurer to back up the policy. Most of those reinsurers are based in Bermuda or London. Your hurricane premium is partly funding offshore economies. Bringing reinsurance home means American money stays accountable to American regulators.",
        framing:
          "American risk, American money, American homes. Stop sending Charleston money to people who do not care about Charleston.",
      },
    ],
  },
];

export const partLabels: Record<number, string> = {
  1: "Part I: The Foundation",
  2: "Part II: Breaking Free",
  3: "Part III: Securing the Foundation",
  4: "Part IV: Energy Independence",
  5: "Priority 13: SC-01 Specific",
};
