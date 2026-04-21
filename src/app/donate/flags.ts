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
