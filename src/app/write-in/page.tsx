import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { DistrictMap } from "@/components/DistrictMap";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { BallotSimulator } from "@/components/BallotSimulator";
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
  title: "How to Write In Clayton Cuteri | SC-01 Ballot Instructions",
  description:
    "How to write in a candidate in South Carolina. Step-by-step instructions for writing in Clayton Cuteri on your SC-01 ballot on November 3, 2026. Check voter registration, find your polling place, spell it: C-L-A-Y-T-O-N C-U-T-E-R-I.",
};

const steps = [
  {
    icon: CheckCircle,
    title: "Check your voter registration",
    description:
      "Confirm you are registered to vote in South Carolina Congressional District 1. This includes voters in Charleston (partial), Berkeley, Dorchester (partial), Beaufort, Colleton (partial), and Jasper counties.",
    action: {
      label: "Check registration at scvotes.gov",
      href: "https://vrems.scvotes.sc.gov/Voter/Login?PageMode=VoterInformation",
    },
  },
  {
    icon: MapPin,
    title: "Find your polling place, or request absentee",
    description:
      "Vote in person on Election Day or during early voting. If you cannot make it to the polls, request an absentee ballot from your county elections office.",
    action: {
      label: "Find your polling place",
      href: "https://vrems.scvotes.sc.gov/Voter/Login?PageMode=PollingPlace",
    },
  },
  {
    icon: FileText,
    title: "Check in and get your activation card",
    description:
      "At your polling place, check in with a poll worker. They will hand you a blank activation card. Take it to any open ExpressVote touchscreen machine and insert the card when prompted. (Voting absentee by mail? Open the paper ballot that arrives in your envelope.)",
  },
  {
    icon: PenTool,
    title: "Find U.S. House of Representatives, District 1 and tap Write-In",
    description:
      "The screen steps you through each contest. When you reach U.S. House of Representatives, District 1, tap the Write-In box, type CLAYTON CUTERI on the on-screen keyboard, then tap Accept. The machine marks the selection for you. (On a paper absentee ballot, fill in the Write-In oval and write CLAYTON CUTERI on the line in pen.)",
  },
  {
    icon: ShieldCheck,
    title: "Review and cast your ballot",
    description:
      "On the review screen, check the name is spelled correctly, then tap Print Ballot Card. Take the printed card to the scanner (a separate tabulator machine) and feed it in. Your vote is cast. (Absentee voters: sign the return envelope and mail it back before the deadline posted at scvotes.gov.)",
  },
];

export default function WriteInPage() {
  return (
    <>
      {/* Spelling Banner */}
      <div className="bg-navy py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm font-medium uppercase tracking-wider mb-4">
            Write this name on your ballot
          </p>
          <p className="text-white text-5xl sm:text-6xl lg:text-8xl" style={{ fontFamily: "var(--font-caveat), cursive" }}>
            CLAYTON CUTERI
          </p>
          <p className="mt-4 text-white/50 text-sm">
            Spell it exactly: C-L-A-Y-T-O-N &nbsp; C-U-T-E-R-I
          </p>
          <p className="mt-2 text-white/40 text-xs">
            Can&rsquo;t remember the exact spelling at the polls? South Carolina
            counts a clear attempt at his name. Do your best.
          </p>
        </div>
      </div>

      {/* Primary vs. general clarification. A write-in candidate never
          appears on a primary ballot, so supporters who don't know that
          can show up in June looking for Clayton, not find him, and
          wrongly assume the campaign is over. This note heads that off
          before anyone reaches the practice ballot. Navy left-border
          matches the ExpandableCard accent pattern used elsewhere. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="max-w-3xl bg-cream rounded-md px-3 py-2 border-l-4 border-l-navy text-charcoal/80 text-xs leading-snug">
          <span className="font-semibold text-navy">Note:</span> Write-ins
          skip the June primary. Vote for Clayton on November 3, 2026.
        </p>
      </div>

      {/* Interactive practice ballot (elevated  -  research shows hands-on first
          out-performs read-then-do). This is now the primary engagement
          moment on the page. Cream bg breaks the navy-on-navy stack with
          the spelling banner above and signals "now it's your turn to act." */}
      <Section bgColor="cream">
        <div className="text-center mb-8">
          <p className="text-navy font-semibold text-sm uppercase tracking-wider mb-3">
            Practice Ballot
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal font-serif">
            Rehearse Your Vote
          </h2>
          <p className="mt-3 text-charcoal/70 text-base sm:text-lg max-w-xl mx-auto">
            Practice finding the U.S. House of Representatives, District 1 race, selecting Write-In, and
            entering the name. The default view matches the ExpressVote
            touchscreen you&rsquo;ll see at the polls. Switch the toggle if
            you&rsquo;re voting absentee by mail. Nothing is submitted.
          </p>
        </div>
        <BallotSimulator />
      </Section>

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
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-charcoal/80 text-lg mb-6">
              To vote in the District 1 U.S. House race, you must be a
              registered voter in South Carolina&apos;s 1st Congressional
              District. The district includes:
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
          <div className="w-full">
            <DistrictMap />
            <p className="text-xs text-charcoal/50 mt-2 text-center">
              Zoom in to street level to see exactly where the district line falls. Map data © OpenStreetMap contributors.
            </p>
          </div>
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
              Early voting dates for 2026 have not been announced yet.
              Check scvotes.gov for the schedule as Election Day approaches.
            </p>
          </div>
        </div>
      </Section>

      {/* Common Questions. Plain cards (not ExpandableCard) because every
          answer here is short enough that collapsing it behind a toggle
          adds friction without saving space. Ordered so the primary-ballot
          question comes first (most common misconception), then the
          spelling question (second-most-common anxiety among supporters). */}
      <Section bgColor="cream" title="Common Questions">
        <div className="max-w-3xl space-y-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 border-l-4 border-l-navy">
            <h3 className="text-lg sm:text-xl font-bold text-charcoal font-serif">
              Will Clayton be on the primary ballot?
            </h3>
            <p className="mt-3 text-charcoal/80 text-base leading-relaxed">
              No. As a write-in candidate, Clayton Cuteri will only appear as
              a write-in option on the November 3, 2026 general election
              ballot. You do not need to vote in the June primary to vote for
              Clayton in November.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 border-l-4 border-l-navy">
            <h3 className="text-lg sm:text-xl font-bold text-charcoal font-serif">
              What if I can&rsquo;t spell &ldquo;Cuteri&rdquo; exactly right?
            </h3>
            <p className="mt-3 text-charcoal/80 text-base leading-relaxed">
              Your vote still counts. South Carolina counts write-in votes
              based on voter intent: as long as the name you write clearly
              identifies Clayton Cuteri and no other candidate with a similar
              name is running, the ballot will be counted for him. The safest
              thing is still to write <strong>Clayton Cuteri</strong>{" "}
              exactly, and the spelling guide at the top of this page is
              there to help. But don&rsquo;t skip the race if you&rsquo;re
              unsure: a recognizable attempt at his name is better than
              leaving it blank.
            </p>
            <p className="mt-3 text-charcoal/60 text-sm leading-relaxed">
              Source: guidance from the South Carolina State Election
              Commission, April 2026.
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
            <PdfDownloadButton href="/downloads/cuteri-wallet-card.pdf">
              Download Wallet Card (PDF)
            </PdfDownloadButton>
          </div>
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
