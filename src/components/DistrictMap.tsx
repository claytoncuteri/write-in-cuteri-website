"use client";

import { useState } from "react";
import { MapPin, ImageIcon } from "lucide-react";

export function DistrictMap() {
  const [interactive, setInteractive] = useState(false);

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl overflow-hidden shadow-lg">
        {interactive ? (
          <iframe
            width="100%"
            height="350"
            frameBorder="0"
            scrolling="no"
            src="https://www.govtrack.us/congress/members/embed/mapframe?state=sc&district=1"
            title="South Carolina Congressional District 1 interactive map"
          />
        ) : (
          <img
            src="/images/sc01-map.png"
            alt="South Carolina Congressional District 1 map showing Charleston, Beaufort, and surrounding coastal counties"
            className="w-full h-auto"
          />
        )}
      </div>
      <div className="flex justify-center mt-3">
        <button
          onClick={() => setInteractive(!interactive)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/60 hover:text-navy transition-colors"
        >
          {interactive ? (
            <>
              <ImageIcon size={14} />
              Show static map
            </>
          ) : (
            <>
              <MapPin size={14} />
              Show interactive map
            </>
          )}
        </button>
      </div>
    </div>
  );
}
