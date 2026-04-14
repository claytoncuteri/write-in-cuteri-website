"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: "navy" | "red";
}

export function ExpandableCard({
  id,
  title,
  subtitle,
  summary,
  children,
  defaultOpen = false,
  accentColor = "navy",
}: ExpandableCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = id ? `${id}-panel` : undefined;
  const triggerId = id ? `${id}-trigger` : undefined;

  // Auto-open and scroll into view when URL hash matches this card's id
  useEffect(() => {
    if (!id) return;

    function checkHash() {
      const hash = window.location.hash.replace("#", "");
      if (hash === id) {
        setOpen(true);
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 150);
      }
    }

    // Check on mount
    checkHash();

    // Also listen for hash changes (covers client-side navigation)
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [id]);

  const accentBorder = accentColor === "red" ? "border-l-red-accent" : "border-l-navy";

  return (
    <div
      id={id}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden border-l-4 ${accentBorder} transition-shadow hover:shadow-md`}
    >
      {/* Always visible */}
      <div className="p-5 sm:p-6">
        {subtitle && (
          <span className="text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1 block">
            {subtitle}
          </span>
        )}
        <h3 className="text-lg sm:text-xl font-bold text-charcoal font-serif">
          {title}
        </h3>
        <div className="mt-2 text-charcoal/80 text-sm sm:text-base leading-relaxed">
          {summary}
        </div>

        {/* Toggle button */}
        <button
          id={triggerId}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(!open);
            }
          }}
          aria-expanded={open}
          aria-controls={panelId}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-navy-dark transition-colors"
        >
          {open ? "Show less" : "Learn more"}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expandable content */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100 pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
