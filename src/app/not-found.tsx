import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";

export default function NotFound() {
  return (
    <Section>
      <div className="max-w-xl mx-auto text-center py-12">
        <h1 className="text-6xl font-bold text-navy font-serif">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-charcoal font-serif">
          Page Not Found
        </h2>
        <p className="mt-3 text-charcoal/70 text-lg">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton variant="primary" href="/">
            Go Home
          </CTAButton>
          <CTAButton variant="secondary" href="/write-in">
            How to Write Me In
          </CTAButton>
        </div>
      </div>
    </Section>
  );
}
