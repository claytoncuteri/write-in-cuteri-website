import Image from "next/image";
import Link from "next/link";
import { footerNavItems } from "@/data/navigation";
import { imageBlur } from "@/data/imageBlur";

// Clayton's social profiles. Lucide 1.x in this project dropped brand
// icons, so we inline SVG paths for each platform to avoid adding a
// second icon dependency. Paths sourced from Simple Icons (CC0).
type SocialIconProps = { className?: string };
const IgIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.334 3.608 1.308.974.975 1.246 2.242 1.308 3.608.058 1.266.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.062 1.366-.334 2.633-1.308 3.608-.975.974-2.242 1.246-3.608 1.308-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.975-1.246-2.242-1.308-3.608C2.175 15.747 2.163 15.368 2.163 12s.012-3.584.07-4.849c.062-1.366.334-2.633 1.308-3.608.975-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.141 0-3.497.011-4.73.068-1.044.048-1.612.222-1.99.369-.5.194-.857.426-1.232.8-.375.376-.607.733-.8 1.233-.147.378-.32.946-.37 1.99-.056 1.233-.067 1.589-.067 4.73s.011 3.497.067 4.73c.05 1.044.223 1.612.37 1.99.193.5.425.857.8 1.232.375.375.732.607 1.232.8.378.147.946.32 1.99.37 1.233.056 1.589.067 4.73.067s3.497-.011 4.73-.067c1.044-.05 1.612-.223 1.99-.37.5-.193.857-.425 1.232-.8.375-.375.607-.732.8-1.232.147-.378.32-.946.37-1.99.056-1.233.067-1.589.067-4.73s-.011-3.497-.067-4.73c-.05-1.044-.223-1.612-.37-1.99-.193-.5-.425-.857-.8-1.232-.375-.375-.732-.607-1.232-.8-.378-.147-.946-.32-1.99-.37-1.233-.056-1.589-.067-4.73-.067zm0 3.063a5.137 5.137 0 1 1 0 10.274 5.137 5.137 0 0 1 0-10.274zm0 8.468a3.331 3.331 0 1 0 0-6.662 3.331 3.331 0 0 0 0 6.662zm6.538-8.675a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
  </svg>
);
const FbIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const YtIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const XIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/claytoncuteri/", Icon: IgIcon },
  { label: "Facebook", href: "https://www.facebook.com/clayton.cuteri.2025/", Icon: FbIcon },
  { label: "YouTube", href: "https://www.youtube.com/@ClaytonCuteriACP", Icon: YtIcon },
  { label: "X / Twitter", href: "https://x.com/ClaytonCuteri", Icon: XIcon },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* White-outline eagle reads cleanly on the navy footer
                background; the plain transparent eagle leaves a dark
                halo of pixels that bites into the navy. The outline
                variant only ships for dark backgrounds; light
                placements (homepage About card, etc.) keep the plain
                eagle. */}
            <Image
              src="/images/ACP_Eagle_white_outline.png"
              alt="American Congress Party eagle emblem"
              width={2869}
              height={2869}
              placeholder="blur"
              blurDataURL={imageBlur["/images/ACP_Eagle_white_outline.png"]}
              className="h-16 w-auto mb-4"
            />
            {/* Brand line uses the full ballot phrase verbatim so every
                page footer reinforces the Clayton -> race-title pair
                that voters need to recognize on the Nov 3 ExpressVote
                screen. */}
            <p className="text-white/80 text-sm leading-relaxed">
              Clayton A. Cuteri, Write-In Candidate for U.S. House of
              Representatives, District 1 (South Carolina). American
              Congress Party.
            </p>
          </div>

          {/* Site links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/60">
              Explore
            </h3>
            <ul className="space-y-2">
              {footerNavItems.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/60">
              More
            </h3>
            <ul className="space-y-2">
              {footerNavItems.slice(5).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/60">
              Connect
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a
                  href="https://americancongressparty.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  American Congress Party
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@writeincuteri.com"
                  className="hover:text-white transition-colors"
                >
                  info@writeincuteri.com
                </a>
              </li>
            </ul>

            {/* Clayton's social profiles. Icon-only row keeps the
                footer column compact; the press page still lists
                follower counts and labels for earned-media audits. */}
            <div className="mt-6">
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-white/60">
                Follow Clayton
              </h4>
              <ul className="flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <s.Icon className="h-4 w-4 text-white" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FEC Disclaimer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          {/* Cuteri for Americans IS Clayton's authorized principal
              campaign committee, so the boilerplate "Not authorized
              by any other candidate or candidate's committee" clause
              that PACs use does NOT belong here  -  that disclosure is
              for unauthorized independent-expenditure committees, not
              the candidate's own committee. Removing it removes a
              factual error. */}
          <p className="text-xs text-white/50 leading-relaxed max-w-3xl">
            Paid for by Cuteri for Americans (FEC ID C00947259).
            Contributions to Cuteri for Americans are not tax deductible.
            Federal law requires us to use our best efforts to collect and
            report the name, mailing address, occupation, and employer of
            individuals whose contributions exceed $200 in an election cycle.
          </p>
          <p className="text-xs text-white/40 mt-4">
            &copy; {new Date().getFullYear()} Cuteri for Americans. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
