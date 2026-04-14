import Link from "next/link";
import { footerNavItems } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src="/images/ACP_Eagle_transparent_background.png"
              alt="American Congress Party Eagle"
              className="h-16 w-auto mb-4"
            />
            <p className="text-white/80 text-sm leading-relaxed">
              Clayton Cuteri for Congress. Write-in candidate, South Carolina
              District 1. American Congress Party.
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
          </div>
        </div>

        {/* FEC Disclaimer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-white/50 leading-relaxed max-w-3xl">
            Paid for by Cuteri for Americans. Not authorized by any other
            candidate or candidate&apos;s committee. Contributions to Cuteri for
            Americans are not tax deductible. Federal law requires us to use our
            best efforts to collect and report the name, mailing address,
            occupation, and employer of individuals whose contributions exceed
            $200 in an election cycle.
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
