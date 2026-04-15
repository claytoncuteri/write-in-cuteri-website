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
              Clayton grew up in Pittsburgh, Pennsylvania, went to college at the
              University of Central Florida in Orlando, and spent years after
              graduation living in San Diego, Brazil, and back in Pittsburgh,
              where he started his businesses from his parents&apos; basement.
              Along the way, he taught himself the financial literacy, personal
              development, and real-world skills that eighteen years of
              classrooms never offered. When things started taking off, he moved
              to Mount Pleasant, South Carolina. His path to the Lowcountry was
              not a straight line, but every stop taught him something the
              political class never learns: what it actually feels like to build
              something from nothing.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              Five years ago, Clayton launched a spiritual podcast called
              &quot;Traveling to Consciousness.&quot; What started as
              conversations about personal growth and consciousness grew into
              political commentary as he realized that inner work without public
              action was not enough. Today he reaches 30 to 100 million views
              per month across Instagram, YouTube, and Facebook, with a combined
              audience of more than 700,000 followers. He has built and operated
              five businesses and is now turning that audience into a political
              movement.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              The turning point came during COVID, standing on a beach in
              California, staring at an empty ocean that bureaucrats had declared
              off limits. Nature herself, locked behind caution tape. In that
              moment, the scope of political power became impossible to ignore.
              Small businesses crushed, lives suspended, and nobody in charge
              asked for permission. Clayton realized that avoiding politics was
              not virtue. It was surrender, handing power to people willing to
              poison the food supply, send other people&apos;s children to war,
              and let insurance companies abandon entire coastlines. He is
              running because the Americans who feel abandoned by both parties
              deserve a representative who actually lives their problems, not one
              who fundraises off them.
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
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-charcoal/80 text-lg leading-relaxed">
              Clayton chose Charleston because, after years of moving across the
              country, the Lowcountry was the place that felt like home. He lives
              in Mount Pleasant. The marshes, the harbor, the people who have
              built their lives in these communities from Sullivan&apos;s Island
              down to Beaufort: this is worth protecting. This is not a district
              he is parachuting into for a campaign. This is home.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              What pushed Clayton from commentary to candidacy was watching the
              Lowcountry get hollowed out in real time. Kids who grew up in Mount
              Pleasant cannot afford a starter home here because Wall Street firms
              buy them in bulk. Retirees on the islands are being taxed out of
              houses they paid off decades ago. Families across Charleston,
              Berkeley, and Dorchester counties pay $5,000 or more a year in
              insurance, and carriers are still leaving the market. Both parties
              have had years to fix this, and both have failed.
            </p>
          </div>
          <div className="lg:col-span-2 flex justify-center">
            <img
              src="/images/clayton-podium.jpg"
              alt="Clayton Cuteri speaking at the Francis Marion Hotel in Charleston"
              className="w-full max-w-sm rounded-xl shadow-lg"
            />
          </div>
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
              The ACP is a real party with a real platform, built for the
              Americans who deserve representation. South Carolina is one of the
              first states where ACP candidates are running for federal office,
              and the party is growing every day.
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

      {/* Asia Icon Award */}
      <Section title="Asia Icon Global Leader of the Year, 2024">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-charcoal/80 text-lg leading-relaxed">
              In 2024, Clayton was recognized as the Asia Icon Global Leader of
              the Year for his work in consciousness, media, and political
              advocacy. The award ceremony brought international press coverage
              from BBC News, Al Jazeera, Sky News, and other global outlets.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              This recognition reflects the reach of Clayton&apos;s message
              beyond American borders and his ability to connect with audiences
              worldwide on issues of personal freedom, government accountability,
              and systemic reform.
            </p>
          </div>
          <div className="lg:col-span-2 flex justify-center">
            <img
              src="/images/clayton-red-carpet.jpg"
              alt="Clayton Cuteri at the Asia Icon Global Leader of the Year 2024 award ceremony"
              className="w-full max-w-sm rounded-xl shadow-lg"
            />
          </div>
        </div>
      </Section>

      {/* The Platform */}
      <Section bgColor="cream" title="The 13-Policy Platform">
        <div className="max-w-3xl space-y-4">
          <p className="text-charcoal/80 text-lg leading-relaxed">
            Clayton is a published author and is currently writing his political
            manifesto, which outlines the 13-policy platform at the center of
            this campaign. The platform covers everything from free food and
            medication to ending the Federal Reserve, eliminating the federal
            income tax, and redirecting war spending toward American communities.
          </p>
          <p className="text-charcoal/80 text-lg leading-relaxed">
            Every policy is backed by real numbers, real history, and real
            proposals. No slogans, no empty promises.
          </p>
          <div className="mt-2">
            <CTAButton variant="secondary" href="/policies">
              See the Full Platform
            </CTAButton>
          </div>
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
