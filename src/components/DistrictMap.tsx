"use client";

import dynamic from "next/dynamic";

const DistrictMapLeaflet = dynamic(
  () => import("./DistrictMapLeaflet").then((m) => m.DistrictMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-cream rounded-xl">
        <div className="text-center text-charcoal/50 text-sm">
          <div className="w-8 h-8 border-2 border-navy/30 border-t-navy rounded-full animate-spin mx-auto mb-2" />
          Loading map…
        </div>
      </div>
    ),
  }
);

export function DistrictMap() {
  return (
    <div className="w-full h-[420px] sm:h-[480px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <DistrictMapLeaflet />
    </div>
  );
}
