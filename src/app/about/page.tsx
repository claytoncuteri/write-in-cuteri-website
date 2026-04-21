import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { imageBlur } from "@/data/imageBlur";

export const metadata: Metadata = {
  title: "About Clayton Cuteri | SC-01 Write-In Candidate 2026",
  description:
    "Who is Clayton Cuteri? Write-in candidate for U.S. House SC-01 in the 2026 election. Secretary General of the American Congress Party, third-party alternative for Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper county voters across the SC-01 Lowcountry.",
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
            <Image
              src="/images/Clayton_Headshot.jpg"
              alt="Clayton Cuteri, Secretary General of the American Congress Party"
              width={1284}
              height={1371}
              quality={85}
              sizes="(max-width: 1024px) 100vw, 384px"
              placeholder="blur"
              blurDataURL={imageBlur["/images/Clayton_Headshot.jpg"]}
              className="w-full max-w-sm rounded-xl shadow-lg object-cover object-top"
            />
          </div>
        </div>
      </Section>

      {/* Career Before Politics.
          Replaces the prior "Connection to the Lowcountry" beat. This is
          now the primary place on the site where Clayton's career
          credibility is established before politics. Dual-fact framing on
          the Yorktown photo: the caption names USS Yorktown (CV-10) at
          Patriots Point Naval & Maritime Museum accurately, and the Navy
          government-contracting work is stated separately in body copy.
          The photo does not depict contracting work or military service. */}
      <Section bgColor="cream" title="Career Before Politics">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-charcoal/80 text-lg leading-relaxed">
              Before running for Congress, Clayton built a career as a
              software engineer, rising to Vice President of Engineering &amp;
              AI at Amara Social, a social media company that builds on top of
              AI. He then left to start his own companies and today operates
              multiple businesses across media, technology, and consumer
              brands.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              Five years ago he launched the podcast &quot;Traveling to
              Consciousness,&quot; which grew into a media platform reaching 30
              to 100 million views per month across Instagram, YouTube, and
              Facebook, with more than 700,000 followers combined. That
              audience is now the foundation of this campaign.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              Clayton&apos;s engineering career has also included
              government-contracting work with the U.S. Navy on military
              drones and on communications, software, and networking systems.
              That work is one of the reasons District 1&apos;s military economy
              (Joint Base Charleston, MCAS Beaufort, and Parris Island) is a
              priority for this campaign.
            </p>
            <p className="text-charcoal/80 text-lg leading-relaxed">
              He is running without corporate PAC money and without needing
              this job to support his family.
            </p>
          </div>
          <div className="lg:col-span-2 flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/images/clayton-yorktown-patriots-point.jpg"
                alt="Clayton Cuteri aboard USS Yorktown (CV-10) at Patriots Point Naval & Maritime Museum in Mount Pleasant, South Carolina."
                fill
                quality={85}
                sizes="(max-width: 1024px) 100vw, 384px"
                placeholder="blur"
                blurDataURL={imageBlur["/images/clayton-yorktown-patriots-point.jpg"]}
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
            <p className="mt-3 text-xs text-charcoal/60 max-w-sm text-center">
              Aboard USS Yorktown (CV-10).
            </p>
          </div>
        </div>
      </Section>

      {/* Connection to SC-01 */}
      <Section title="Home in District 1">
        <div className="max-w-3xl space-y-4">
          <p className="text-charcoal/80 text-lg leading-relaxed">
            After years of moving across the country, the Lowcountry was the
            place that felt like home. Clayton lives in Mount Pleasant, but
            this campaign is for the whole district: from Hilton Head,
            Bluffton, and Beaufort through Walterboro and Ridgeland, up
            through Summerville, Goose Creek, and Moncks Corner, and across
            Charleston, Mount Pleasant, and North Charleston. The marshes,
            the harbor, the ACE Basin, the communities that people have
            built here: this is worth protecting.
          </p>
          <p className="text-charcoal/80 text-lg leading-relaxed">
            What pushed Clayton from commentary to candidacy was watching
            District 1 get hollowed out in real time. Kids who grew up in Mount
            Pleasant and Bluffton cannot afford starter homes. Retirees on
            Hilton Head and Edisto are being taxed out of houses they paid
            off decades ago. Families across Charleston, Berkeley,
            Dorchester, Beaufort, Colleton, and Jasper counties pay $5,000
            or more a year in insurance, and carriers are still leaving the
            market. Both parties have had years to fix this, and both have
            failed.
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
            <Image
              src="/images/ACP_logo_with_letters.png"
              alt="American Congress Party"
              width={1080}
              height={1080}
              sizes="(max-width: 640px) 192px, 224px"
              className="w-48 sm:w-56 h-auto object-contain"
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
            <Image
              src="/images/clayton-red-carpet.jpg"
              alt="Clayton Cuteri at the Asia Icon Global Leader of the Year 2024 award ceremony"
              width={1284}
              height={1542}
              quality={85}
              sizes="(max-width: 1024px) 100vw, 384px"
              className="w-full max-w-sm h-auto rounded-xl shadow-lg"
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
              className="!border-white !text-white hover:!bg-white hover:!text-navy"
            >
              Get Involved
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
