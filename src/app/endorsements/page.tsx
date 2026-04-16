"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/Section";
import { Award, Send } from "lucide-react";
import { subscribeToConvertKit } from "@/lib/convertkit";

// Add endorsements here as they come in
const endorsements: {
  name: string;
  title: string;
  quote: string;
  photo?: string;
}[] = [
  // Example format (uncomment and fill in when endorsements are received):
  // {
  //   name: "Jane Smith",
  //   title: "Charleston County School Board Member",
  //   quote: "Clayton understands the real issues facing working families in the Lowcountry.",
  //   photo: "/images/endorsements/jane-smith.jpg",
  // },
];

export default function EndorsementsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    try {
      await subscribeToConvertKit({
        email: data.get("email") as string,
        firstName: data.get("name") as string,
        tag: "general",
        fields: {
          organization: (data.get("organization") as string) || "",
          endorsement_reason: (data.get("reason") as string) || "",
        },
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              Endorsements
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Who Stands With Clayton
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Community leaders, local voices, and everyday Americans who
              believe SC-01 deserves better than what both parties have offered.
            </p>
          </div>
        </div>
      </section>

      {/* Endorsements list */}
      <Section>
        {endorsements.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {endorsements.map((endorsement, i) => (
              <div
                key={i}
                className="bg-cream rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  {endorsement.photo ? (
                    <img
                      src={endorsement.photo}
                      alt={endorsement.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                      <span className="text-navy font-bold text-lg">
                        {endorsement.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-charcoal text-sm">
                      {endorsement.name}
                    </h3>
                    <p className="text-charcoal/60 text-xs">
                      {endorsement.title}
                    </p>
                  </div>
                </div>
                <p className="text-charcoal/80 text-sm leading-relaxed italic">
                  &ldquo;{endorsement.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* No endorsements yet */
          <div className="max-w-2xl mx-auto text-center py-8">
            <Award size={48} className="text-navy/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-charcoal font-serif">
              Endorsements Growing
            </h2>
            <p className="mt-3 text-charcoal/70 text-lg leading-relaxed">
              This campaign is built on real people, not political machines.
              Endorsements from community leaders, local organizations, and
              SC-01 voters will be listed here as they come in.
            </p>
          </div>
        )}
      </Section>

      {/* Request to Endorse form */}
      <Section bgColor="cream" title="Request to Endorse">
        <div className="max-w-xl mx-auto">
          <p className="text-charcoal/70 text-sm mb-6">
            Are you a community leader, organization, or SC-01 voter who wants
            to publicly endorse Clayton Cuteri? Fill out the form below and the
            campaign will follow up.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-green-800">
                Thank you for your support!
              </h3>
              <p className="mt-2 text-green-700 text-sm">
                Check your inbox for a confirmation email. The campaign will
                follow up with you directly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="endorseName"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Your name *
                  </label>
                  <input
                    type="text"
                    id="endorseName"
                    name="name"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endorseEmail"
                    className="block text-sm font-medium text-charcoal mb-1"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="endorseEmail"
                    name="email"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="endorseOrg"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  Title / Organization
                </label>
                <input
                  type="text"
                  id="endorseOrg"
                  name="organization"
                  placeholder="e.g., Mount Pleasant City Council, Local business owner, SC-01 voter"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                />
              </div>
              <div>
                <label
                  htmlFor="endorseReason"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  Why you are endorsing Clayton
                </label>
                <textarea
                  id="endorseReason"
                  name="reason"
                  rows={3}
                  placeholder="What about Clayton's platform or character made you want to endorse?"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-navy font-semibold rounded-lg hover:bg-navy-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50"
              >
                <Send size={16} />
                {submitting ? "Submitting..." : "Submit Endorsement Request"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
