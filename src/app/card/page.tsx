// /card  -  candidate-personal NFC + QR business-card landing page.
//
// This page is intentionally hidden from the global nav. It exists so
// Clayton can NFC-tag his phone case, AirDrop the URL to people he
// meets in person, and hand out a single short link that lands on the
// most condensed possible identity block. Voters won't stumble onto
// it; the homepage and quiz are the funnels for them. /card is a tool
// for the candidate.
//
// What's intentionally NOT here:
//   - vCard / Save Contact button (removed from spec)
//   - Add-Contact QR (removed from spec)
//   - Email signup form (this page is about offline-to-online handoff,
//     not capture; the homepage does capture)
//   - PostHog event wiring (static landing only)

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/Section";
import { Smartphone, Share2, Radio, Mail, Globe } from "lucide-react";

export const metadata: Metadata = {
  // Title intentionally pairs Clayton's name with the exact ballot
  // phrase voters will see on the Nov 3 ExpressVote screen, per the
  // mere-exposure / Zajonc rationale in the April 2026 plan.
  title:
    "Clayton Cuteri | U.S. House of Representatives, District 1 (SC) | Campaign Card",
  description:
    "Clayton A. Cuteri, write-in candidate for U.S. House of Representatives, District 1 (South Carolina). Scan or tap to share the campaign.",
};

export default function CardPage() {
  return (
    <Section bgColor="cream">
      <div className="max-w-xl mx-auto">
        {/* Identity block. Subhead 1 + Subhead 2 together render the
            full official ballot phrase ("U.S. House of Representatives"
            + "District 1") on two lines so it reads cleanly on a
            phone screen without wrapping. */}
        <div className="text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
            Write-In  ·  November 3, 2026
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-charcoal font-serif leading-tight">
            Clayton A. Cuteri
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-charcoal/80 font-medium">
            Candidate, U.S. House of Representatives
          </p>
          <p className="text-lg sm:text-xl text-charcoal/80 font-medium">
            South Carolina, District 1
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-6 text-sm">
            <a
              href="mailto:info@writeincuteri.com"
              className="inline-flex items-center justify-center gap-2 text-navy hover:text-navy-dark font-medium transition-colors"
            >
              <Mail size={16} aria-hidden />
              info@writeincuteri.com
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-navy hover:text-navy-dark font-medium transition-colors"
            >
              <Globe size={16} aria-hidden />
              writeincuteri.com
            </Link>
          </div>
        </div>

        {/* Website QR card. Centered single QR; sized for arm's-length
            scanning from another phone (~200px square renders crisp
            on retina + roughly 1.5 inches at typical phone DPR). */}
        <div className="mt-10 mx-auto max-w-xs bg-white rounded-lg p-6 border border-gray-200 text-center">
          <Image
            src="/qr/QR_Website.png"
            alt="QR code linking to writeincuteri.com"
            width={200}
            height={200}
            className="mx-auto h-auto w-full max-w-[200px]"
            priority
          />
          <p className="mt-3 text-sm font-medium text-charcoal">
            Scan to visit writeincuteri.com
          </p>
        </div>

        {/* Three short instructional rows  -  give the holder of this
            card three ways to spread the link without overwhelming
            them. Lucide icons match the rest of the site. */}
        <ul className="mt-10 space-y-4 max-w-md mx-auto">
          <li className="flex items-start gap-3">
            <Smartphone
              size={20}
              className="text-navy shrink-0 mt-0.5"
              aria-hidden
            />
            <span className="text-sm text-charcoal/80 leading-relaxed">
              Tap the link or scan the QR with any phone camera.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Share2
              size={20}
              className="text-navy shrink-0 mt-0.5"
              aria-hidden
            />
            <span className="text-sm text-charcoal/80 leading-relaxed">
              AirDrop or text this page so a friend can do the same.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Radio
              size={20}
              className="text-navy shrink-0 mt-0.5"
              aria-hidden
            />
            <span className="text-sm text-charcoal/80 leading-relaxed">
              Got an NFC sticker? Encode this URL:{" "}
              <span className="font-mono text-navy">
                writeincuteri.com/card
              </span>
            </span>
          </li>
        </ul>
      </div>
    </Section>
  );
}
