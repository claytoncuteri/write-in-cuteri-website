import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";

export const metadata: Metadata = {
  title: "About Clayton Cuteri | SC-01 Write-In Candidate 2026",
  description:
    "Who is Clayton Cuteri? Write-in candidate for U.S. House SC-01 in the 2026 election. Secretary General of the American Congress Party, third-party alternative for Charleston and Lowcountry voters.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              About
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Clayton A. Cuteri
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Write-in candidate for U.S. House of Representatives, South
              Carolina District 1. Secretary General, American Congress Party.
            </p>
          </div>
        </div>
      </section>

      {/* Bio section */}
      <Section>
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-3xl font-bold text-charcoal font-serif">
              Who Is Clayton?
            </h2>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              [BIO_PARAGRAPH_1: Personal background. Where he grew up, what
              shaped him, what brought him to South Carolina. Keep it human and
              specific.]
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              [BIO_PARAGRAPH_2: Professional background. What he does for work,
              relevant experience, skills he brings to the table.]
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              [BIO_PARAGRAPH_3: Why he is running. The personal moment or
              realization that made him decide to run for Congress. What does he
              see that others do not?]
            </p>
          </div>
          <div className="lg:col-span-2">
            <img
              src="/images/Clayton_Headshot.jpg"
              alt="Clayton Cuteri"
              className="w-full max-w-sm rounded-xl shadow-lg object-cover object-top"
            />
          </div>
        </div>
      </Section>

      {/* Connection to SC-01 */}
      <Section bgColor="cream" title="Connection to the Lowcountry">
        <div className="max-w-3xl space-y-4">
          <p className="text-charcoal/80 text-lg leading-relaxed">
            [SC01_CONNECTION_1: Clayton&apos;s personal ties to Charleston,
            Berkeley, Beaufort, or the surrounding counties. When did he move
            here? What does he love about the area?]
          </p>
          <p className="text-charcoal/80 text-lg leading-relaxed">
            [SC01_CONNECTION_2: What specific local issues motivated him? Does he
            deal with insurance costs firsthand? Has he seen neighbors priced out
            of their homes?]
          </p>
        </div>
      </Section>

      {/* ACP Role */}
      <Section title="The American Congress Party">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-charcoal/80 text-lg leading-relaxed">
              Clayton serves as Secretary General of the American Congress Party,
              a national third-party organization building a structural
              alternative to the Republican-Democrat duopoly.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              The ACP is not a protest movement. It is a real party with a real
              platform, designed for the Americans neither major party speaks for.
              The party is still growing, and South Carolina is one of the first
              states where ACP candidates are running for federal office.
            </p>
            <div className="mt-4">
              <CTAButton
                variant="tertiary"
                href="https://americancongressparty.com"
              >
                Learn more at americancongressparty.com
              </CTAButton>
            </div>
          </div>
          <div className="lg:col-span-2 flex justify-center">
            <img
              src="/images/ACP_logo_with_letters.png"
              alt="American Congress Party logo"
              className="w-48 sm:w-56 object-contain"
            />
          </div>
        </div>
      </Section>

      {/* The Book */}
      <Section bgColor="cream" title="America Reimagined">
        <div className="max-w-3xl space-y-4">
          <p className="text-charcoal/80 text-lg leading-relaxed">
            Clayton is the author of &quot;America Reimagined,&quot; a
            book-length policy blueprint that lays out 13 concrete priorities for
            rebuilding the American system from the ground up. The platform on
            this website is drawn directly from that work.
          </p>
          <p className="text-charcoal/80 text-lg leading-relaxed">
            The book covers everything from free food and medication to ending
            the Federal Reserve, eliminating the federal income tax, and
            redirecting war spending toward American communities. It is backed by
            real numbers, real history, and real proposals.
          </p>
          <p className="text-charcoal/60 text-sm">
            [BOOK_STATUS: Add publication date, purchase link, or pre-order info
            when available.]
          </p>
        </div>
      </Section>

      {/* CTA */}
      <Section bgColor="navy">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif">
            Ready to Support Clayton?
          </h2>
          <p className="mt-4 text-white/80 text-lg leading-relaxed mb-8">
            Whether you volunteer, donate, or simply write his name on the
            ballot, every action builds the movement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <CTAButton variant="primary" href="/write-in">
              How to Write Me In
            </CTAButton>
            <CTAButton
              variant="secondary"
              href="/get-involved"
              className="border-white text-white hover:bg-white hover:text-navy"
            >
              Get Involved
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
