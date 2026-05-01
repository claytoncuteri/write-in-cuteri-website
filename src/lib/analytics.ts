// Client-side analytics helpers.
//
// Wraps posthog-js so we can:
//   1. Keep the SDK import out of bundles that don't need it (pages that don't
//      call track() still ship zero posthog-js bytes).
//   2. Hash email addresses before they become PostHog event properties (FEC
//      donor-privacy posture + general hygiene  -  we never ship raw email PII
//      to a third-party SaaS).
//   3. Provide a single `track()` API whose signature matches our event
//      schema so usage sites stay consistent.
//   4. Fail safe if PostHog is disabled / not loaded (e.g. user with Brave
//      strict-mode blocking that gets past our reverse-proxy).

"use client";

import posthog from "posthog-js";

// posthog-js is a singleton. PostHogProvider.tsx calls posthog.init()
// once at mount; every subsequent import here gets the same initialized
// instance.
//
// We previously tried to read `window.posthog`, which posthog-js v1.x
// used to auto-assign. v2+ (we're on v1.369+) does NOT touch window by
// default, so that reader returned null and every track() call no-oped
// silently. Rooted out by checking PostHog Activity and seeing zero
// ballot_sim_*, signup_form_*, donate_*, etc., despite the calls
// firing in the code. Importing the module directly fixes every
// custom event surface at once.
//
// Pageview / autocapture events were unaffected because PostHogProvider
// captures those via the imported module directly, never via window.
function ph(): typeof posthog | null {
  if (typeof window === "undefined") return null;
  // posthog-js sets `__loaded` to true after .init() has resolved.
  // Returning null until init completes prevents events from queueing
  // before the SDK is configured (they would be dropped on load).
  return posthog?.__loaded ? posthog : null;
}

/**
 * SHA-256 hash an email for use as a stable anonymous identifier. Runs in
 * the browser using the Web Crypto API; no network round-trip.
 */
export async function hashEmail(email: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, props?: EventProps) {
  const client = ph();
  if (!client) return;
  try {
    client.capture(event, props);
  } catch {
    // Never let analytics errors break the UI.
  }
}

/**
 * Identify a user after an email signup. We never pass the raw email  -  only
 * its SHA-256 hash. This gives PostHog a stable distinct_id across sessions
 * while keeping PII off their servers.
 */
export async function identifyByEmail(
  email: string,
  extraProps?: EventProps,
): Promise<void> {
  const client = ph();
  if (!client) return;
  try {
    const hashed = await hashEmail(email);
    client.identify(hashed, extraProps);
  } catch {
    // swallow
  }
}

/**
 * Set person properties that are meaningful for retention analysis
 * (first_seen_at, first_seen_source, etc.). Uses $set_once so subsequent
 * writes don't clobber the original acquisition attribution.
 */
export function setPersonAttributes(
  setOnce: EventProps,
  set?: EventProps,
): void {
  const client = ph();
  if (!client) return;
  try {
    const payload: Record<string, unknown> = {};
    if (Object.keys(setOnce).length) payload.$set_once = setOnce;
    if (set && Object.keys(set).length) payload.$set = set;
    client.capture("$set", payload);
  } catch {
    // swallow
  }
}

/**
 * Called once per client session to record retention-relevant attributes
 * captured from the URL + referrer.
 */
export function recordSessionEntry(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const utm = {
    utm_source: url.searchParams.get("utm_source") ?? undefined,
    utm_medium: url.searchParams.get("utm_medium") ?? undefined,
    utm_campaign: url.searchParams.get("utm_campaign") ?? undefined,
    utm_content: url.searchParams.get("utm_content") ?? undefined,
  };
  const referrerHost = (() => {
    try {
      return document.referrer ? new URL(document.referrer).host : "";
    } catch {
      return "";
    }
  })();
  setPersonAttributes(
    {
      first_seen_at: new Date().toISOString(),
      first_seen_page: url.pathname,
      first_seen_referrer_host: referrerHost || "$direct",
      first_seen_utm_source: utm.utm_source ?? null,
      first_seen_utm_campaign: utm.utm_campaign ?? null,
    },
    {
      last_seen_at: new Date().toISOString(),
    },
  );
}
