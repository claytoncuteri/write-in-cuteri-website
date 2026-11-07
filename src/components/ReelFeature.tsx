import Image from "next/image";
import { Play, ArrowRight } from "lucide-react";

// Post-election feature for Clayton's "We didn't win" reel
// (instagram.com/p/DfXqMWWAt7S, posted Nov 5, 2026).
//
// A still plus a link, not an embed and not a re-hosted copy: no
// Instagram script on the page, nothing to keep in sync if the reel
// changes. The still is a frame from the reel itself.
//
// Every number below was checked on 2026-11-06:
// - Votes: AP results shown in the reel (99% reporting, race not yet
//   called): Lacore 161,878; Honeycutt 158,570; Cuteri 218. Unofficial
//   until the state certifies.
// - Spending: FEC candidate totals (api.open.fec.gov). Lacore disbursed
//   $4,690,325 through Oct 14, 2026 ($28.97 per vote). Cuteri for
//   Americans disbursed $228.82 through Sept 30, 2026 ($1.05 per vote;
//   the reel says $1.02). Both will rise when post-election reports
//   are filed, so the copy says "about".
export const REEL_URL = "https://www.instagram.com/p/DfXqMWWAt7S/";

export function ReelFeature() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <a
            href={REEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block rounded-2xl overflow-hidden shadow-xl aspect-[5/4] bg-navy"
            aria-label="Watch Clayton's video on Instagram (opens in a new tab)"
          >
            <Image
              src="/images/reel-win-or-learn.jpg"
              alt="Clayton Cuteri speaking to camera in front of a painting of Washington, D.C."
              fill
              quality={85}
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center 40%" }}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
              <span className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 text-navy shadow-lg group-hover:scale-105 transition-transform">
                <Play size={34} className="ml-1" fill="currentColor" />
              </span>
            </span>
          </a>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-red-accent">
              The video you shared
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-charcoal font-serif leading-tight">
              You either win or you learn.
            </h2>
            <p className="mt-4 text-charcoal/80 text-lg leading-relaxed">
              We didn&rsquo;t win. But we learned a lot. With almost no
              money and no place on the debate stage, more than 200 of
              you wrote my name in by hand.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-cream p-4">
                <dt className="text-xs text-charcoal/70 leading-snug">People who wrote in Clayton</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-bold text-navy font-serif">200+</dd>
              </div>
              <div className="rounded-lg bg-cream p-4">
                <dt className="text-xs text-charcoal/70 leading-snug">Top vote-getter&rsquo;s spending per vote</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-bold text-charcoal font-serif">~$29</dd>
              </div>
              <div className="rounded-lg bg-cream p-4">
                <dt className="text-xs text-charcoal/70 leading-snug">Our spending per vote</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-bold text-red-accent font-serif">~$1</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-charcoal/60 leading-relaxed">
              Votes: Associated Press, unofficial, 99% reporting. Spending:
              FEC reports through Oct.&nbsp;14 (top vote-getter) and
              Sept.&nbsp;30 (our campaign). Final reports will be higher.
            </p>

            <a
              href={REEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-navy text-white font-semibold hover:bg-navy-dark transition-colors"
            >
              Watch the video on Instagram <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
