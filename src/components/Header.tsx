"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { mainNavItems } from "@/data/navigation";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/images/ACP_logo_with_letters.png"
              alt="American Congress Party"
              className="h-14 sm:h-16 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-navy bg-navy/5"
                      : "text-charcoal hover:text-navy hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/write-in"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-navy rounded-full hover:bg-navy-dark transition-colors"
            >
              Write Me In
            </Link>
            <Link
              href="/donate"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-accent rounded-full hover:bg-red-accent-dark transition-colors"
            >
              Donate
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md text-charcoal hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-4 space-y-1">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-navy bg-navy/5"
                      : "text-charcoal hover:text-navy hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/write-in"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-5 py-3 text-base font-semibold text-white bg-navy rounded-lg hover:bg-navy-dark transition-colors"
              >
                Write Me In
              </Link>
              <Link
                href="/donate"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-5 py-3 text-base font-semibold text-white bg-red-accent rounded-lg hover:bg-red-accent-dark transition-colors"
              >
                Donate
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
