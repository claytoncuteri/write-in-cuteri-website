"use client";

// When the URL carries a #hash on initial load (e.g. /#quiz from a shared
// tweet), the browser tries to scroll before Next.js hydrates and before
// hero images finish loading, which shifts layout and either under-scrolls
// or silently no-ops. This component re-runs the scroll after mount +
// a short delay so the target element is in its final position when we
// jump to it.
//
// Mount once at the top of the homepage (or any page that needs reliable
// deep-link anchors). Renders nothing.

import { useEffect } from "react";

export function HashScroller() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const id = hash.slice(1);
    // Give hero images and layout a beat to settle. 150ms is enough on
    // broadband, harmless on slower links  -  the target is already in the
    // DOM, we're just waiting for the viewport to match its final size.
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t1 = setTimeout(scroll, 150);
    // Second pass after images/fonts are more likely loaded.
    const t2 = setTimeout(scroll, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  return null;
}
