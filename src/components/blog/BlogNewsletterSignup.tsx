"use client";

// Slim newsletter signup placed at the foot of every blog post.
// Email + first-name only -- TCPA / phone capture lives on the
// dedicated signup surfaces (/, /get-involved, /events, /donate).
// Tagged "general" with sourcePage = the post URL so we can see
// which post drove the signup in /admin.

import { useState, type FormEvent } from "react";
import { CTAButton } from "@/components/CTAButton";
import { track, identifyByEmail } from "@/lib/analytics";

interface Props {
  sourcePage: string;
}

export function BlogNewsletterSignup({ sourcePage }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const firstName = String(fd.get("firstName") || "");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          tag: "general",
          sourcePage,
        }),
      });
      if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
      await identifyByEmail(email, { form_type: "blog_post_footer" });
      track("signup_form_submitted", {
        form_type: "blog_post_footer",
        source_page: sourcePage,
      });
      setSubmitted(true);
    } catch {
      track("signup_form_error", { form_type: "blog_post_footer" });
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
        <p className="text-green-800 font-medium text-sm">
          Thanks! Check your inbox to confirm and you&rsquo;ll hear
          when the next post goes up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-charcoal/70">
        Want more updates like this? Join the email list (no spam,
        unsubscribe anytime).
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          required
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
        />
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
        />
      </div>
      <CTAButton variant="primary" type="submit" className="w-full">
        {submitting ? "Signing up..." : "Sign me up"}
      </CTAButton>
    </form>
  );
}
