"use client";

// Initialises PostHog on the client, captures $pageview + $pageleave
// automatically via App Router navigation events, and enables session replay
// on every route except /donate (where we honour a tighter privacy posture).

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { recordSessionEntry } from "@/lib/analytics";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Flag that ensures we only init PostHog once even under React 19 StrictMode.
let initialised = false;

function initIfNeeded() {
  if (initialised) return;
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return; // no key configured yet  -  fail quiet
  initialised = true;

  posthog.init(POSTHOG_KEY, {
    // Route ingest through our own /ingest/* reverse proxy (see next.config.ts)
    // so ad-blockers don't kill analytics.
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",

    // App Router drives pageviews explicitly via the effect below.
    capture_pageview: false,
    capture_pageleave: true,

    // Session replay  -  free tier: 5000 recordings/month. Plenty of headroom.
    // Masks input fields by default (emails, names). See PostHog docs for
    // finer control per field.
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
    },

    // Strip query params we never want to see in PostHog (utm_* are kept  - 
    // they are already tracked as properties elsewhere, but we like the URL).
    sanitize_properties: (properties) => {
      const p = { ...properties };
      // Never let raw email leak into event props from an errant caller.
      for (const key of Object.keys(p)) {
        if (/email/i.test(key) && typeof p[key] === "string") {
          if (/@/.test(p[key] as string)) {
            p[key] = "[redacted]";
          }
        }
      }
      return p;
    },

    // Respect Do-Not-Track.
    respect_dnt: true,

    // Persist anonymous IDs in a first-party cookie for 400 days (Chrome's
    // cookie lifetime cap). Survives strict trackers.
    persistence: "localStorage+cookie",
    cookie_name: "cuteri_ph",
  });
}

function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Treat /donate with a stricter privacy posture: no session replay there.
  useEffect(() => {
    if (!initialised) return;
    if (pathname?.startsWith("/donate")) {
      posthog.stopSessionRecording();
    } else {
      posthog.startSessionRecording();
    }
  }, [pathname]);

  useEffect(() => {
    if (!initialised) return;
    if (!pathname) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  useEffect(() => {
    recordSessionEntry();
  }, []);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  initIfNeeded();
  // PHProvider wires the React context so hook-based consumers work too.
  // Suspense is scoped to JUST <PageViews/> because that is the only
  // component that calls useSearchParams(), which suspends during SSR in
  // Next 15+. Wrapping the broader tree in Suspense (as the layout used
  // to do) caused React to emit the null fallback into static HTML for
  // every page -  crawlers/curl saw an empty <body> with only RSC markers.
  // Scoping the boundary keeps page content synchronous and in the HTML.
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      {children}
    </PHProvider>
  );
}
