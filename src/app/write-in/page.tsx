import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import {
  CheckCircle,
  MapPin,
  FileText,
  PenTool,
  ShieldCheck,
  ExternalLink,
  Printer,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Write In Clayton Cuteri",
  description:
    "Step-by-step instructions for writing in Clayton Cuteri on your SC-01 ballot. November 3, 2026. Spell it: C-L-A-Y-T-O-N  C-U-T-E-R-I.",
};

const steps = [
  {
    icon: CheckCircle,
    title: "Check your voter registration",
    description:
      'Confirm you are registered to vote in South Carolina Congressional District 1. This includes voters in Charleston (partial), Berkeley, Dorchester (partial), Beaufort, Colleton (partial), and Jasper counties.',
    action: {
      label: "Check registration at scvotes.gov",
      href: "https://vrems.scvotes.sc.gov/Voter/Login?PageMode=VoterInformation",
    },
  },
  {
    icon: MapPin,
    title: "Find your polling place",
    description:
      "Know where to vote on Election Day or during the early voting period. You can also request an absentee ballot if you qualify.",
    action: {
      label: "Find your polling place",
      href: "https://vrems.scvotes.sc.gov/Voter/Login?PageMode=PollingPlace",
    },
  },
  {
    icon: FileText,
    title: "Find the U.S. House District 1 race on your ballot",
    description:
      "On Election Day, November 3, 2026 (or during early voting), look for the section labeled U.S. House of Representatives, District 1. You will see the listed candidates and a write-in option.",
  },
  {
    icon: PenTool,
    title: 'Write "Clayton Cuteri" in the write-in field',
    description:
      "On paper ballots, write the name clearly in the blank write-in line. On touchscreen machines, select the write-in option and type the name using the on-screen keyboard.",
  },
  {
    icon: ShieldCheck,
    title: "Verify your spelling and submit",
    description:
      "Double-check the spelling before casting your ballot. The name must be recognizable to count. Review your full ballot, then submit.",
  },
];

export default function WriteInPage() {
  return (
    <>
      {/* Spelling Banner */}
      <div className="bg-navy py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-3">
            Spell it exactly
          </p>
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {"CLAYTON".split("").map((letter, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border-2 border-red-accent rounded-lg text-white text-xl sm:text-3xl lg:text-4xl font-bold font-serif shadow-[0_2px_0_0_rgba(215,38,56,0.4)] bg-white/5"
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap mt-3">
            {"CUTERI".split("").map((letter, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border-2 border-red-accent rounded-lg text-white text-xl sm:text-3xl lg:text-4xl font-bold font-serif shadow-[0_2px_0_0_rgba(215,38,56,0.4)] bg-white/5"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <Section
        title="How to Write Me In"
        subtitle="Five simple steps to cast your vote for a real alternative on November 3, 2026."
      >
        <div className="space-y-6 max-w-3xl">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-4 sm:gap-6 p-5 sm:p-6 bg-cream rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-charcoal font-serif">
                  {step.title}
                </h3>
                <p className="mt-1 text-charcoal/80 text-sm sm:text-base">
                  {step.description}
                </p>
                {step.action && (
                  <a
                    href={step.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-navy-dark transition-colors"
                  >
                    {step.action.label}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Eligibility */}
      <Section bgColor="cream" title="Am I Eligible?">
        <div className="max-w-3xl">
          <p className="text-charcoal/80 text-lg mb-6">
            To vote in the SC-01 U.S. House race, you must be a registered voter
            in South Carolina Congressional District 1. The district includes:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {[
              "Charleston (partial)",
              "Berkeley",
              "Dorchester (partial)",
              "Beaufort",
              "Colleton (partial)",
              "Jasper",
            ].map((county) => (
              <div
                key={county}
                className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-charcoal"
              >
                {county}
              </div>
            ))}
          </div>
          <CTAButton
            variant="secondary"
            href="https://vrems.scvotes.sc.gov/Voter/Login?PageMode=VoterInformation"
          >
            Check Your Registration
          </CTAButton>
        </div>
      </Section>

      {/* Election Day Info */}
      <Section title="Important Dates">
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="bg-cream p-6 rounded-lg">
            <h3 className="font-bold text-charcoal font-serif text-lg">
              Election Day
            </h3>
            <p className="text-2xl font-bold text-navy mt-2 font-serif">
              November 3, 2026
            </p>
            <p className="text-sm text-charcoal/70 mt-2">
              Polls open 7:00 AM to 7:00 PM
            </p>
          </div>
          <div className="bg-cream p-6 rounded-lg">
            <h3 className="font-bold text-charcoal font-serif text-lg">
              Early Voting
            </h3>
            <p className="text-charcoal/80 mt-2">
              [EARLY_VOTING_DATES: Check scvotes.gov for SC early voting
              schedule as it is announced]
            </p>
          </div>
        </div>
      </Section>

      {/* Wallet Card */}
      <Section bgColor="cream">
        <div className="max-w-3xl text-center mx-auto">
          <Printer size={40} className="text-navy mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal font-serif">
            Take It With You
          </h2>
          <p className="mt-3 text-charcoal/80 text-lg">
            Print a wallet-sized reminder card with the correct spelling and
            your polling place info. Keep it in your pocket on Election Day.
          </p>
          <div className="mt-6">
            <CTAButton variant="secondary" href="/images/[WALLET_CARD_PDF]">
              Download Wallet Card (PDF)
            </CTAButton>
          </div>
          <p className="mt-3 text-sm text-charcoal/50">
            [WALLET_CARD_PDF: Add a PDF file to public/images/ and update this
            link]
          </p>
        </div>
      </Section>

      {/* Sticky Mobile Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-red-accent py-3 sm:hidden">
        <p className="text-white text-center font-bold tracking-[0.12em] text-sm">
          Write in: CLAYTON CUTERI
        </p>
      </div>
    </>
  );
}
