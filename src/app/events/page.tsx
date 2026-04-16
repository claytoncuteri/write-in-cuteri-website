import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CTAButton } from "@/components/CTAButton";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Events | Town Halls, Rallies, and Community Meetings",
  description:
    "Upcoming campaign events for Clayton Cuteri in SC-01. Town halls, community meetings, and voter education events across Charleston, Berkeley, Beaufort, and the Lowcountry.",
};

// Add events here as they are scheduled
const upcomingEvents: {
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  description: string;
  rsvpLink?: string;
}[] = [
  // Example format (uncomment and fill in when events are scheduled):
  // {
  //   title: "Town Hall: Insurance and the Lowcountry",
  //   date: "June 15, 2026",
  //   time: "6:30 PM - 8:00 PM",
  //   location: "Charleston County Public Library",
  //   address: "68 Calhoun St, Charleston, SC 29401",
  //   description: "Join Clayton for a discussion on the coastal insurance crisis and what his Lowcountry Resilience plan means for your premiums.",
  //   rsvpLink: "#",
  // },
];

export default function EventsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              Events
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Meet Clayton in Person
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Town halls, community meetings, and voter education events across
              SC-01. Come ask questions, hear the platform, and decide for
              yourself.
            </p>
          </div>
        </div>
      </section>

      {/* Events list */}
      <Section>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-6 max-w-3xl">
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className="bg-cream rounded-lg p-6 sm:p-8 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-charcoal font-serif">
                      {event.title}
                    </h2>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-charcoal/70">
                        <Calendar size={16} className="text-navy flex-shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-charcoal/70">
                        <Clock size={16} className="text-navy flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-charcoal/70">
                        <MapPin size={16} className="text-navy flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-charcoal">
                            {event.location}
                          </span>
                          <br />
                          <span>{event.address}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-charcoal/80 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                  {event.rsvpLink && (
                    <div className="flex-shrink-0">
                      <CTAButton variant="primary" href={event.rsvpLink}>
                        RSVP
                      </CTAButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No events yet */
          <div className="max-w-2xl mx-auto text-center py-8">
            <Calendar size={48} className="text-navy/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-charcoal font-serif">
              Events Coming Soon
            </h2>
            <p className="mt-3 text-charcoal/70 text-lg leading-relaxed">
              Clayton is scheduling town halls and community events across
              Charleston, Berkeley, Dorchester, Beaufort, and Jasper counties.
              Sign up below to be the first to know when events are announced.
            </p>
          </div>
        )}
      </Section>

      {/* Event notification signup */}
      <Section bgColor="cream">
        <div className="max-w-xl mx-auto text-center">
          <Users size={32} className="text-navy mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-charcoal font-serif">
            Get Event Notifications
          </h2>
          <p className="mt-2 text-charcoal/70 text-sm">
            Be the first to know when Clayton is coming to your area.
          </p>
          <div className="mt-4">
            <CTAButton variant="secondary" href="/get-involved">
              Join the Volunteer List
            </CTAButton>
          </div>
        </div>
      </Section>

      {/* Host an event CTA */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-charcoal font-serif">
            Want to Host an Event?
          </h2>
          <p className="mt-3 text-charcoal/70 leading-relaxed">
            If you have a venue, a living room, or a backyard in SC-01 and want
            to host a meet-and-greet with Clayton, reach out. Grassroots events
            are the backbone of this campaign.
          </p>
          <div className="mt-4">
            <CTAButton variant="secondary" href="/press">
              Contact the Campaign
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
