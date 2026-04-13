import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Cuteri for Americans campaign website.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif">
            Privacy Policy
          </h1>
          <p className="mt-4 text-white/80">
            Last updated: [PRIVACY_LAST_UPDATED_DATE]
          </p>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl prose prose-charcoal">
          <h2 className="text-2xl font-bold text-charcoal font-serif">
            What We Collect
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            When you submit a form on this website (volunteer signup, email
            notification, or contact form), we collect the information you
            provide: name, email address, phone number, zip code, and any
            message content. This data is collected via Formspree, a third-party
            form processing service.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            How We Use Your Information
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            We use your information to communicate with you about campaign
            updates, volunteer opportunities, and events. We do not sell, trade,
            or rent your personal information to third parties. Campaign
            communications are sent directly by Cuteri for Americans.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            FEC Disclosure Requirements
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            Federal Election Commission regulations require campaigns to collect
            and report the name, mailing address, occupation, and employer of
            individuals whose contributions exceed $200 in an election cycle.
            This information is part of the public record as required by federal
            law.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Cookies
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            This website is a static site and does not use cookies or tracking
            scripts. We do not use Google Analytics, Facebook Pixel, or any
            similar tracking tools.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Third-Party Services
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            Form submissions are processed by Formspree. Please review{" "}
            <a
              href="https://formspree.io/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy hover:text-navy-dark underline"
            >
              Formspree&apos;s privacy policy
            </a>{" "}
            for details on how they handle submitted data.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Contact
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            For privacy questions or data removal requests, contact us at{" "}
            <a
              href="mailto:[CAMPAIGN_EMAIL]"
              className="text-navy hover:text-navy-dark underline"
            >
              [CAMPAIGN_EMAIL]
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
