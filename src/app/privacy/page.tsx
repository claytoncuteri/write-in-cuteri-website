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
          <p className="mt-4 text-white/80">Last updated: April 16, 2026</p>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl prose prose-charcoal">
          <p className="text-charcoal/80 leading-relaxed">
            This policy explains what information we collect on writeincuteri.com,
            how we use it, who we share it with, and how you can control it. We
            wrote it to be readable by a human, not a lawyer.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Information you give us directly
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            When you submit a form on this site, we collect the information you
            type into it. Depending on the form, that may include your email
            address, first name, last name, ZIP code, county, message content,
            and quiz answers. We also record which page the form was submitted
            from (for example, /donate or /get-involved) and which tag applies
            (volunteer, donor interest, press, general supporter).
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Information we collect automatically
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            When you use the site, we collect anonymous usage data to help us
            reach voters who care about the issues Clayton is running on. This
            includes:
          </p>
          <ul className="mt-3 space-y-2 text-charcoal/80 text-base list-disc pl-6">
            <li>
              Pages visited, time on page, scroll depth, clicks, and form
              interactions.
            </li>
            <li>
              Approximate geography (country, state, city) derived from your IP
              address via Cloudflare. We do not store your full IP address.
            </li>
            <li>
              Device type, browser, and referring site (for example, whether
              you came from Twitter, a Google search, or a direct link).
            </li>
            <li>
              Practice ballot completion and quiz answer events so we can tell
              what helps voters learn how to write Clayton in.
            </li>
            <li>
              Session recordings on some pages (not on /donate). Recordings
              mask text inputs and sensitive fields by default.
            </li>
          </ul>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            If your browser sends a Do Not Track signal, we honor it: analytics
            and session recording are disabled for your visit.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            How we protect your email in analytics
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            When you submit your email through a form, we associate your
            analytics activity with a SHA-256 hash of your email address, not
            the email itself. The raw email is only stored in our signup list
            (see below). This means our analytics vendor cannot read your
            email; it sees only a one-way hash.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Where your data lives
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            We use the following processors to run the campaign. Each is a
            separate company with its own privacy practices; the links go to
            their policies.
          </p>
          <ul className="mt-3 space-y-2 text-charcoal/80 text-base list-disc pl-6">
            <li>
              <strong>Kit (ConvertKit)</strong> &ndash; our email list and
              automation platform. Stores your email, name, ZIP, and signup
              tag. Used to send you campaign updates.{" "}
              <a
                href="https://kit.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy hover:text-navy-dark underline"
              >
                Kit privacy policy
              </a>
              .
            </li>
            <li>
              <strong>PostHog</strong> &ndash; our product analytics and
              session replay provider. Stores page views, events, and
              approximate geography. Emails are only ever sent as SHA-256
              hashes.{" "}
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy hover:text-navy-dark underline"
              >
                PostHog privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Replit</strong> &ndash; hosts the site and the database
              that holds a copy of your form submissions so the campaign can
              reach you even if we change email vendors.{" "}
              <a
                href="https://replit.com/site/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy hover:text-navy-dark underline"
              >
                Replit privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Cloudflare</strong> &ndash; provides the network that
              serves the site. Sees your IP address for routing and DDoS
              protection and passes approximate geography (country, state,
              city) to our servers.{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy hover:text-navy-dark underline"
              >
                Cloudflare privacy policy
              </a>
              .
            </li>
            <li>
              <strong>Anedot</strong> (when donations open) &ndash; processes
              donations and collects FEC-required donor information. Subject
              to federal campaign finance disclosure.{" "}
              <a
                href="https://www.anedot.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy hover:text-navy-dark underline"
              >
                Anedot privacy policy
              </a>
              .
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            How we use your information
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            We use what you give us and what we collect automatically to: send
            you campaign updates you signed up for, answer questions you send
            us, improve the website, reach similar voters, comply with FEC
            reporting requirements for donations, and measure whether our
            outreach is working. We do not sell, trade, or rent your personal
            information to third parties. Campaign communications are sent
            directly by Cuteri for Americans.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            FEC disclosure
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            Federal Election Commission regulations require campaigns to
            collect and report the name, mailing address, occupation, and
            employer of individuals whose contributions exceed $200 in an
            election cycle. That information is part of the public record as
            required by federal law and will appear on FEC filings published at
            fec.gov.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Your choices
          </h2>
          <ul className="mt-3 space-y-2 text-charcoal/80 text-base list-disc pl-6">
            <li>
              <strong>Unsubscribe from email</strong> anytime using the link at
              the bottom of any campaign email. Unsubscribing also removes you
              from future outreach.
            </li>
            <li>
              <strong>Opt out of analytics</strong> by enabling Do Not Track in
              your browser, or by using any ad-blocker or privacy extension
              (we do not try to defeat them).
            </li>
            <li>
              <strong>Request deletion</strong> of your form submissions and
              any associated analytics profile by emailing us (see Contact
              below). We will remove your records from our database and from
              Kit, PostHog, and any other processor that holds them, except
              where federal law requires us to retain donor records.
            </li>
            <li>
              <strong>Request a copy</strong> of what we hold on you and we
              will send it within 30 days.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Children
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            This site is not directed at children under 13, and we do not
            knowingly collect information from them. If you believe we have
            collected such information, please contact us and we will delete
            it.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Security
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            All traffic to the site is encrypted in transit via TLS. Administrative
            access to the signup database is restricted to campaign staff and
            gated by password and a signed session cookie. Donations are processed
            by a PCI-compliant vendor (Anedot); this site never sees your full
            card number.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Changes to this policy
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            If we change this policy, we will update the date at the top. If
            the change is material (for example, adding a new processor), we
            will notify active subscribers by email before it takes effect.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Contact
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            For privacy questions, data access requests, or deletion requests,
            contact us at{" "}
            <a
              href="mailto:info@writeincuteri.com"
              className="text-navy hover:text-navy-dark underline"
            >
              info@writeincuteri.com
            </a>
            . Paid for by Cuteri for Americans.
          </p>
        </div>
      </Section>
    </>
  );
}
