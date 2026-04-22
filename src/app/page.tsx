import Image from "next/image";
import { Section } from "@/components/Section";
import { imageBlur } from "@/data/imageBlur";
import { CTAButton } from "@/components/CTAButton";
import { HomeProblems } from "@/components/HomeProblems";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { IssueMatcher } from "@/components/IssueMatcher";
import { HashScroller } from "@/components/HashScroller";
import { HomeSignup } from "@/components/HomeSignup";
import { StickyMobileCta } from "@/components/StickyMobileCta";
import { ArrowRight, Printer, FileText, Users, Heart } from "lucide-react";

// Seasonal CTA posture. Before Sept 1, 2026 (persuasion phase) the quiz
// gets primary/red prominence and the write-in CTA sits as secondary.
// After Sept 1 (GOTV phase), swap: write-in primary, quiz secondary.
// Both buttons stay visible year-round for mere-exposure priming of the
// write-in action. Keep this in sync with StickyMobileCta's GOTV_CUTOVER.
const GOTV_CUTOVER = new Date("2026-09-01T00:00:00Z");
const IS_GOTV_MODE = new Date() >= GOTV_CUTOVER;

export default function HomePage() {
  return (
    <>
      <HashScroller />
      <StickyMobileCta />
      {/* Hero */}
      <section className="bg-navy overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-serif leading-tight">
                Clayton Cuteri for U.S. Congress
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-white/80">
                Write-In Candidate, South Carolina District 1 (the Lowcountry)
                <br />
                November 3, 2026 General Election
              </p>
              <p className="mt-6 text-white/70 text-base sm:text-lg leading-relaxed max-w-lg">
                Both Republicans and Democrats have failed us. The American
                Congress Party is for the Americans neither party speaks for.
              </p>
              {/* Seasonal CTA swap. April 2026 (persuasion phase): quiz is
                  primary/red, write-in is secondary navy-outline. Sept 1
                  2026 onward (GOTV phase): swap. Both buttons stay visible
                  all year so mere-exposure priming of the write-in action
                  keeps accumulating. */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {IS_GOTV_MODE ? (
                  <>
                    <CTAButton variant="primary" href="/write-in">
                      How to Write Me In
                    </CTAButton>
                    <CTAButton
                      variant="secondary"
                      href="#quiz"
                      className="!border-white !text-white hover:!bg-white hover:!text-navy"
                    >
                      Take the Quiz: Where Do We Agree?
                    </CTAButton>
                  </>
                ) : (
                  <>
                    <CTAButton variant="primary" href="#quiz">
                      Take the Quiz: Where Do We Agree?
                    </CTAButton>
                    <CTAButton
                      variant="secondary"
                      href="/write-in"
                      className="!border-white !text-white hover:!bg-white hover:!text-navy"
                    >
                      How to Write Me In
                    </CTAButton>
                  </>
                )}
              </div>
              {/* Tertiary escape hatch to the full platform page. The quiz is
                  now the primary above-fold interactive entry (secondary button
                  above), so this link serves voters who would rather read the
                  13 policies in full than take a quiz. */}
              <p className="mt-5 text-white/60 text-sm">
                Prefer the full platform?{" "}
                <a
                  href="/policies"
                  className="underline underline-offset-4 hover:text-white transition-colors"
                >
                  Read all 13 policies
                </a>
                .
              </p>
            </div>

            {/* Headshot */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/Clayton_Headshot.jpg"
                  alt="Clayton Cuteri, write-in candidate for US House SC-01 in the 2026 election"
                  fill
                  priority
                  quality={85}
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
                  placeholder="blur"
                  blurDataURL={imageBlur["/images/Clayton_Headshot.jpg"]}
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems (client component with expand toggle) */}
      <HomeProblems />

      {/* Issue-matcher quiz. Placed AFTER the problems beat on purpose:
          credibility-first sequencing. Baymard / ConversionXL data shows
          context-matched interactions convert 3-10% vs 0.5-1% cold. For a
          write-in campaign where credibility (not awareness) is the primary
          deficit, a quiz-as-first-interaction reads as lead-gen gimmick and
          undermines the "serious candidate" positioning. The hero anchor link
          gives advanced users a bypass. */}
      <Section bgColor="cream">
        <div id="quiz" className="scroll-mt-24">
          <IssueMatcher sourcePage="/" />
        </div>
      </Section>

      {/* About Teaser */}
      <Section bgColor="cream">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal font-serif">
              Meet Clayton
            </h2>
            <p className="mt-4 text-charcoal/80 text-lg leading-relaxed">
              Clayton Cuteri lives in Mount Pleasant, pays the same insurance
              premiums you do, and watches the same neighbors get priced out
              of District 1 every year, from Hilton Head and Bluffton to Summerville
              and Goose Creek. He is not a career politician. He is an
              entrepreneur, content creator, and co-founder of the American
              Congress Party who built a following of over 700,000 people by
              saying what both parties refuse to say.
            </p>
            <div className="mt-6">
              <CTAButton variant="tertiary" href="/about">
                Read full bio
              </CTAButton>
            </div>
          </div>
          <div className="lg:col-span-2 flex justify-center">
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/clayton-seated-smiling.jpg"
                alt="Clayton Cuteri, American Congress Party candidate for South Carolina's 1st Congressional District"
                fill
                quality={85}
                sizes="(max-width: 640px) 256px, 288px"
                placeholder="blur"
                blurDataURL={imageBlur["/images/clayton-seated-smiling.jpg"]}
                style={{ objectFit: "cover", objectPosition: "center 25%" }}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ACP Section */}
      <Section bgColor="navy" title="Why a Third Party?">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3">
            <p className="text-white/80 text-lg leading-relaxed">
              A record number of Americans now identify as political
              independents. Both parties profit from keeping you angry at each
              other while they serve the same donors. The American Congress Party
              is the structural alternative: a real party with a real platform
              for real people.
            </p>
            <p className="text-white/80 text-lg leading-relaxed mt-4">
              Clayton serves as ACP Secretary General. This campaign is not about
              left or right. It is about the common people versus the connected
              few.
            </p>
            <div className="mt-6">
              <a
                href="https://americancongressparty.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-white/80 transition-colors"
              >
                Visit americancongressparty.com <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div className="lg:col-span-2 flex justify-center">
            <Image
              src="/images/ACP_Eagle_transparent_background.png"
              alt="American Congress Party eagle emblem"
              width={2869}
              height={2869}
              sizes="(max-width: 640px) 192px, 224px"
              placeholder="blur"
              blurDataURL={imageBlur["/images/ACP_Eagle_transparent_background.png"]}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          </div>
        </div>
      </Section>

      {/* Homepage email + phone signup. Placed after the ACP section and
          before the CTA Cards so engaged visitors who scrolled past the
          hero but aren't ready for write-in/donate still have a low-
          friction path to hand us contact info. Required phone + TCPA
          opt-in here so we start building the SMS list for ballot-day
          GOTV. */}
      <HomeSignup />

      {/* CTA Cards */}
      <Section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-cream rounded-lg p-6 text-center">
            <Printer size={28} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Wallet Card
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Remember the name on Election Day.
            </p>
            <div className="mt-4">
              <PdfDownloadButton href="/images/cuteri-wallet-card.pdf">
                Download
              </PdfDownloadButton>
            </div>
          </div>
          <div className="bg-cream rounded-lg p-6 text-center">
            <FileText size={28} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              One-Pager
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              The full platform on a single page.
            </p>
            <div className="mt-4">
              <PdfDownloadButton href="/images/cuteri-one-pager.pdf">
                Download
              </PdfDownloadButton>
            </div>
          </div>
          <div className="bg-cream rounded-lg p-6 text-center">
            <Users size={28} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Get Involved
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Volunteer and spread the word.
            </p>
            <div className="mt-4">
              <CTAButton variant="secondary" href="/get-involved">
                Join Us
              </CTAButton>
            </div>
          </div>
          <div className="bg-cream rounded-lg p-6 text-center">
            <Heart size={28} className="text-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal font-serif">
              Support the Campaign
            </h3>
            <p className="mt-2 text-charcoal/70 text-sm">
              Every dollar funds voter education.
            </p>
            <div className="mt-4">
              <CTAButton variant="primary" href="/donate">
                Donate
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
