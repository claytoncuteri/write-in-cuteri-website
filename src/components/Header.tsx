"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

interface DropdownGroup {
  label: string;
  items: { label: string; href: string }[];
}

const navGroups: (DropdownGroup | { label: string; href: string })[] = [
  {
    label: "Issues",
    items: [
      { label: "Problems", href: "/problems" },
      { label: "Solutions", href: "/policies" },
    ],
  },
  {
    label: "About",
    items: [
      { label: "About Clayton", href: "/about" },
      { label: "Endorsements", href: "/endorsements" },
      { label: "Media", href: "/press" },
    ],
  },
  {
    label: "Get Involved",
    items: [
      { label: "Volunteer", href: "/get-involved" },
      { label: "Events", href: "/events" },
    ],
  },
  { label: "Write Me In", href: "/write-in" },
];

function isDropdown(
  item: DropdownGroup | { label: string; href: string }
): item is DropdownGroup {
  return "items" in item;
}

function DesktopDropdown({ group }: { group: DropdownGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href)
  );

  function handleEnter() {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  }

  function handleLeave() {
    timeout.current = setTimeout(() => setOpen(false), 150);
  }

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? "text-navy bg-navy/5"
            : "text-charcoal hover:text-navy hover:bg-gray-50"
        }`}
        aria-expanded={open}
      >
        {group.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {group.items.map((item) => {
            const itemActive =
              pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  itemActive
                    ? "text-navy bg-navy/5 font-medium"
                    : "text-charcoal hover:text-navy hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close mobile menu whenever the route changes. Covers the logo
  // link, back-button navigation, and any future links that forget to
  // wire up an explicit onClick close.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/ACP_logo_with_letters.png"
              alt="American Congress Party — Cuteri for US House SC-01"
              width={1080}
              height={1080}
              priority
              className="h-14 sm:h-16 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navGroups.map((item) =>
              isDropdown(item) ? (
                <DesktopDropdown key={item.label} group={item} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? "text-navy bg-navy/5"
                      : "text-charcoal hover:text-navy hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center">
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
            {navGroups.map((item) =>
              isDropdown(item) ? (
                <div key={item.label}>
                  <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                    {item.label}
                  </p>
                  {item.items.map((sub) => {
                    const subActive =
                      pathname === sub.href ||
                      pathname.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2.5 pl-6 text-base font-medium rounded-md transition-colors ${
                          subActive
                            ? "text-navy bg-navy/5"
                            : "text-charcoal hover:text-navy hover:bg-gray-50"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? "text-navy bg-navy/5"
                      : "text-charcoal hover:text-navy hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="pt-3">
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
