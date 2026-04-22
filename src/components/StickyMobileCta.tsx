"use client";

// Mobile-only sticky bottom CTA. Appears when the user scrolls past a
// sentinel element (typically placed at the bottom of the hero) and stays
// pinned to the bottom edge of the viewport until dismissed.
//
// Why only mobile: on desktop, the hero CTAs stay in peripheral vision
// longer and the value of a persistent bar is low while the cost (visual
// clutter, hidden footer content) is high. On mobile, the CTAs disappear
// with the first scroll and a persistent bar is a standard 2026 campaign
// pattern. Hidden on `md:` and above via Tailwind.
//
// Seasonal content switch: before Sept 1, 2026 the persistent CTA is the
// quiz (persuasion phase, similarity-building). On and after Sept 1, it
// flips to the write-in instructions (GOTV phase). The hero CTA colors
// swap on the same date; this component reads the same seasonal flag so
// they stay coordinated.
//
// FEC disclosure: federal campaign messaging requires a "paid for by"
// label. Space on a 44px sticky bar is tight but doable with small type.
// We show "Paid for by Cuteri for Americans" in a second line below the
// CTA so voters can identify the sender without tapping.
//
// Dismissibility: the bar has a small close button. Dismissal is stored
// in sessionStorage so it doesn't reappear during the same session but
// does reappear on a fresh visit. sessionStorage over localStorage
// because we want returning voters in a different session to re-see the
// CTA, not forever-suppress it.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

// Seasonal cutover date. On or after this date, the sticky CTA flips from
// quiz-mode (persuasion) to write-in-mode (GOTV). Keep this in sync with
// the hero CTA swap in src/app/page.tsx.
const GOTV_CUTOVER = new Date("2026-09-01T00:00:00Z");

function isGotvMode(now = new Date()): boolean {
  return now >= GOTV_CUTOVER;
}

const DISMISS_KEY = "home-sticky-cta-dismissed";

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Seed dismissal from sessionStorage on mount. Keep inside useEffect so
  // SSR doesn't try to read sessionStorage (which doesn't exist there).
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // sessionStorage can throw in some private-browse modes. Ignore.
    }
  }, []);

  // IntersectionObserver on the sentinel element. The sentinel lives at
  // the end of the hero section; when it scrolls out of the top of the
  // viewport, we show the bar.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // isIntersecting === false AND boundingClientRect.top < 0 means
          // the sentinel has scrolled above the viewport, i.e. the hero
          // is no longer visible.
          const scrolledPast =
            !entry.isIntersecting && entry.boundingClientRect.top < 0;
          setVisible(scrolledPast);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Best effort.
    }
  }

  const gotv = isGotvMode();
  const cta = gotv
    ? { href: "/write-in", label: "How to Write Me In" }
    : { href: "#quiz", label: "Take the Quiz" };

  return (
    <>
      {/* Sentinel: place this at the bottom of the hero so the sticky bar
          appears as soon as the hero scrolls out of view. Zero height so
          it doesn't affect layout. */}
      <div ref={sentinelRef} aria-hidden className="h-0 w-full" />

      {/* The bar itself. Fixed-position, mobile-only. Below Footer in tab
          order so it doesn't trap keyboard users. */}
      {visible && !dismissed && (
        <div
          role="region"
          aria-label="Campaign call to action"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy border-t-2 border-red-accent shadow-lg"
        >
          <div className="flex items-center gap-3 px-4 py-2.5">
            <Link
              href={cta.href}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-red-accent hover:bg-red-accent-dark text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {cta.label}
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <p className="px-4 pb-1.5 text-[10px] text-white/60 text-center leading-tight">
            Paid for by Cuteri for Americans.
          </p>
        </div>
      )}
    </>
  );
}
