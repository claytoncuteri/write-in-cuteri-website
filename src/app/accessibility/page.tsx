import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "Accessibility commitment and features for the Cuteri for Americans campaign website.",
};

export default function AccessibilityPage() {
  return (
    <>
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif">
            Accessibility
          </h1>
          <p className="mt-4 text-white/80">
            Our commitment to an inclusive web experience.
          </p>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-charcoal font-serif">
            Our Commitment
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            Cuteri for Americans is committed to ensuring that this website is
            accessible to all visitors, including people with disabilities. We
            strive to meet WCAG 2.1 Level AA standards across all pages.
          </p>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Accessibility Features
          </h2>
          <ul className="mt-3 space-y-2 text-charcoal/80">
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>Semantic HTML structure with proper heading hierarchy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>Alt text on all images</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>Keyboard navigation support for all interactive elements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>ARIA attributes on expandable cards and navigation menus</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>Sufficient color contrast ratios (WCAG AA compliant)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>Responsive design that works across screen sizes and devices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>Form labels properly associated with input fields</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold mt-0.5">&#x2022;</span>
              <span>Focus indicators on all interactive elements</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal font-serif mt-8">
            Feedback
          </h2>
          <p className="text-charcoal/80 leading-relaxed mt-3">
            If you encounter any accessibility barriers on this website, please
            contact us at{" "}
            <a
              href="mailto:info@writeincuteri.com"
              className="text-navy hover:text-navy-dark underline"
            >
              info@writeincuteri.com
            </a>
            . We take all feedback seriously and will work to address issues
            promptly.
          </p>
        </div>
      </Section>
    </>
  );
}
