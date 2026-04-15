import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { HomeProblems } from "@/components/HomeProblems";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { ArrowRight, Printer, FileText, Users, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <>
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
                Write-In Candidate, South Carolina District 1
                <br />
                November 3, 2026
              </p>
              <p className="mt-6 text-white/70 text-base sm:text-lg leading-relaxed max-w-lg">
                Both Republicans and Democrats have failed us. The American
                Congress Party is for the Americans neither party speaks for.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <CTAButton variant="primary" href="/write-in">
                  How to Write Me In
                </CTAButton>
                <CTAButton
                  variant="secondary"
                  href="/policies"
                  className="border-white text-white hover:bg-white hover:text-navy"
                >
                  See My Platform
                </CTAButton>
              </div>
            </div>

            {/* Headshot */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/Clayton_Headshot.jpg"
                  alt="Clayton Cuteri, write-in candidate for SC-01"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems (client component with expand toggle) */}
      <HomeProblems />

      {/* About Teaser */}
      <Section bgColor="cream">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal font-serif">
              Meet Clayton
            </h2>
            <p className="mt-4 text-charcoal/80 text-lg leading-relaxed">
              Clayton Cuteri lives in Mount Pleasant, pays the same insurance
              premiums you do, and watches the same neighbors get priced out of
              the Lowcountry every year. He is not a career politician. He is an
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
            <img
              src="/images/clayton-seated-smiling.jpg"
              alt="Clayton Cuteri"
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-xl object-cover object-top shadow-lg"
            />
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
            <img
              src="/images/ACP_Eagle_transparent_background.png"
              alt="American Congress Party Eagle"
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          </div>
        </div>
      </Section>

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
