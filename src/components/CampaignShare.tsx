"use client";

// Share-the-campaign block. Replaces the previous two-button (X +
// Facebook only) section on /get-involved with a fuller set:
//
//   Row 1: dedicated buttons for platforms that DO have a working
//          web-share intent URL  -  X, Facebook, LinkedIn, Threads.
//   Row 2: native Web Share API button (mobile) + Copy link (always).
//
// Why no dedicated Instagram or TikTok buttons: neither platform
// exposes a public web-share intent URL. The OS share sheet
// (navigator.share) is the only working path; on mobile that includes
// IG Stories, IG DMs, TikTok DMs, WhatsApp, Signal, AirDrop, Telegram,
// SMS, and anything else the user has installed. So one "Share..."
// button covers the apps that lack web URLs.

import { useEffect, useState } from "react";
import { Share2, ClipboardCopy, Check } from "lucide-react";

const SHARE_URL = "https://writeincuteri.com";
const SHARE_TEXT =
  "I'm writing in Clayton Cuteri for U.S. House of Representatives, District 1 (SC).";

const ENCODED_URL = encodeURIComponent(SHARE_URL);
const ENCODED_TEXT = encodeURIComponent(SHARE_TEXT);
const ENCODED_TEXT_PLUS_URL = encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`);

// lucide-react v1.x ships no brand icons; inline SVG paths from
// Simple Icons (CC0). Same approach as the Footer's social row.
type BrandIconProps = { className?: string };
const XIcon = ({ className }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FbIcon = ({ className }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const LinkedInIcon = ({ className }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const ThreadsIcon = ({ className }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M17.953 11.106c-.085-.041-.171-.08-.258-.117-.152-2.808-1.683-4.416-4.255-4.432h-.035c-1.539 0-2.819.657-3.606 1.853l1.415.971c.589-.893 1.512-1.083 2.191-1.083h.024c.846.005 1.485.252 1.899.732.302.349.504.832.605 1.439-.762-.13-1.587-.169-2.469-.117-2.484.143-4.081 1.592-3.974 3.605.054 1.021.563 1.9 1.434 2.475.736.486 1.685.724 2.671.67 1.302-.071 2.323-.567 3.035-1.475.541-.69.883-1.583 1.034-2.708.621.375 1.082.867 1.337 1.46.434 1.006.46 2.66-.886 4.005-1.18 1.179-2.598 1.689-4.738 1.704-2.374-.018-4.17-.78-5.341-2.265C7.965 16.42 7.397 14.658 7.376 12c.021-2.658.589-4.42 1.685-5.823 1.171-1.485 2.967-2.247 5.34-2.265 2.391.018 4.219.783 5.43 2.276.594.733 1.042 1.654 1.336 2.728l1.731-.46c-.357-1.323-.92-2.462-1.683-3.402C19.703 2.992 17.396 2.022 14.413 2H14.4C11.423 2.02 9.142 2.992 7.624 4.892c-1.35 1.694-2.046 4.05-2.069 7.1V12.013c.023 3.05.72 5.406 2.069 7.1C9.142 21.013 11.423 21.985 14.4 22.005h.013c2.65-.018 4.516-.71 6.052-2.246 2.011-2.01 1.95-4.523 1.288-6.07-.475-1.114-1.38-2.018-2.62-2.61zm-4.413 4.42c-1.078.061-2.197-.428-2.252-1.434-.041-.748.532-1.583 2.319-1.685.205-.012.406-.018.604-.018.65 0 1.258.063 1.811.184-.207 2.587-1.42 2.881-2.482 2.953z" />
  </svg>
);

// Common pill-button styling so all four platform links look like a
// single set. Brand colors via inline style instead of arbitrary
// Tailwind hex classes (cleaner build output).
const PILL_BASE =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

export function CampaignShare() {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // navigator.share is only defined on mobile + recent desktop browsers.
  // Detect after mount so SSR doesn't render the button when the API
  // isn't actually available (and so we don't trigger a hydration
  // mismatch by reading navigator during render).
  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" &&
        typeof navigator.share === "function",
    );
  }, []);

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: "Clayton Cuteri for Congress",
        text: SHARE_TEXT,
        url: SHARE_URL,
      });
    } catch (err) {
      // AbortError just means the user cancelled the share sheet; not
      // worth surfacing. Other errors (rare) silently fail.
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[share] navigator.share failed", err);
      }
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API can be blocked in some browser configs; fall
      // back to a window.prompt so the URL is still selectable.
      if (typeof window !== "undefined") {
        window.prompt("Copy this link", SHARE_URL);
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      <p className="text-charcoal/70 text-lg mb-6">
        The biggest challenge for any write-in candidate is name recognition.
        Every share helps.
      </p>

      {/* Row 1: dedicated platform buttons. Wrapped layout so the four
          pills sit on a single row at >=sm and stack cleanly on
          phones. */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=${ENCODED_TEXT}%20${ENCODED_URL}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={`${PILL_BASE} bg-charcoal hover:bg-charcoal/80 focus:ring-charcoal`}
        >
          <XIcon className="h-4 w-4" />
          <span>X</span>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${ENCODED_URL}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={`${PILL_BASE} bg-[#1877F2] hover:bg-[#1877F2]/85 focus:ring-[#1877F2]`}
        >
          <FbIcon className="h-4 w-4" />
          <span>Facebook</span>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${ENCODED_URL}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={`${PILL_BASE} bg-[#0A66C2] hover:bg-[#0A66C2]/85 focus:ring-[#0A66C2]`}
        >
          <LinkedInIcon className="h-4 w-4" />
          <span>LinkedIn</span>
        </a>
        <a
          href={`https://www.threads.net/intent/post?text=${ENCODED_TEXT_PLUS_URL}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Threads"
          className={`${PILL_BASE} bg-charcoal hover:bg-charcoal/80 focus:ring-charcoal`}
        >
          <ThreadsIcon className="h-4 w-4" />
          <span>Threads</span>
        </a>
      </div>

      {/* Row 2: native share (when available) + copy link. The native
          share button is the path to Instagram, TikTok, WhatsApp,
          Signal, AirDrop, etc.  -  apps that don't have web-share
          intent URLs. Copy link is the universal fallback. */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-navy border-2 border-navy hover:bg-navy hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
          >
            <Share2 size={16} />
            <span>Share via app...</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-navy border-2 border-navy hover:bg-navy hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
        >
          {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
          <span>{copied ? "Copied!" : "Copy link"}</span>
        </button>
      </div>

      <p className="mt-4 text-xs text-charcoal/60">
        Use &ldquo;Share via app&rdquo; on mobile to send through Instagram,
        TikTok, WhatsApp, AirDrop, or any other app on your phone.
      </p>
    </div>
  );
}
