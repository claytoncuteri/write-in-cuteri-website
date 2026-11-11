"use client";

// Tells visitors why they landed on the home page when an old link sent
// them here. next.config.ts redirects retired post-election pages
// (/write-in) to "/?from=<slug>". Read from window.location in an effect
// so the home page stays statically rendered (useSearchParams would need
// a Suspense boundary and opt the page into client rendering).

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const MESSAGES: Record<string, string> = {
  "write-in":
    "You followed a link to our write-in instructions. The November 3, 2026 election is over, so that page is gone. Thank you for wanting to write me in.",
};

export function RedirectNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    if (from && MESSAGES[from]) setMessage(MESSAGES[from]);
  }, []);

  if (!message) return null;

  return (
    <div role="status" className="bg-gold text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
        <p className="flex-1 text-sm sm:text-base font-medium leading-snug">{message}</p>
        <button
          type="button"
          onClick={() => setMessage(null)}
          aria-label="Close this message"
          className="p-2 -m-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
