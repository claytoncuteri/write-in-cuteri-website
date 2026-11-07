// Shared flag for the /donate route.
//
// Lives in a plain (non-"use client") module so that both page.tsx
// (server component) and DonateClient.tsx (client component) can
// import the literal value. If this constant lived in the "use client"
// file, the server-side import would resolve to a client reference
// object (always truthy) instead of the literal boolean, silently
// breaking any `DONATIONS_LIVE ? ... : ...` in page.tsx.
//
// This branch (feat/donate-anedot) is merged only once Anedot approves
// the campaign account and the campaign is ready to accept live gifts,
// so this flag ships as `true`. If donations ever need to be paused
// (Anedot outage, compliance pause, etc.), flip to `false` and the
// page falls back to the "coming soon" email-signup view.
export const DONATIONS_LIVE = true;

// Post-election switch (Nov 2026). false = the thank-you page with no
// ask (what ships). true = the "next campaign" page, which brings back
// the Anedot form with wording for Clayton's next federal race.
//
// DRAFT, NOT APPROVED. Clayton has said he will run again, office and
// year not decided. Before flipping this, a campaign-finance lawyer
// should confirm: that Cuteri for Americans can take gifts for the
// next election now (11 CFR 110.1(b)), how gifts must be designated,
// the per-election limit for that cycle, whether a new committee is
// needed if the next race is not for this House seat, and when an
// amended Form 2 is due.
export const POST_ELECTION_DONATIONS_OPEN = false;
