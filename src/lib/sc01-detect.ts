// Best-effort detector for "this subscriber lives in or near SC-01."
//
// Used to gate the `C26-SC01-Resident` tag in convertkit.ts. False
// positives are preferred to false negatives because:
//   (a) The downstream cost of a false positive is sending a
//       district-targeted Kit email to someone who can't vote here
//       (annoying but cheap).
//   (b) The cost of a false negative is missing a real SC-01 voter in
//       the GOTV segment (election-relevant).
//
// Signals, in order of trust:
//   1. ZIP starts with a Lowcountry prefix (294, 295, 299). These
//      cover the bulk of SC-01: Charleston (294xx), Berkeley +
//      Dorchester (294xx-295xx), Beaufort + Jasper (299xx), with some
//      Colleton in 294xx. Permissive: 295xx and 299xx include some
//      ZIPs technically outside SC-01, but a Bluffton or
//      Hilton Head adjacent worker who commutes into the district
//      should still get the SC01-tagged content.
//   2. Cloudflare / Vercel geo-IP reports state = SC. ~60% accurate
//      on mobile (per existing db.ts comment), but where it IS right
//      it confirms the district at the state level. Pair with the
//      ZIP check; trust either signal independently.
//
// Anything else (out-of-state ZIP, non-SC IP and no ZIP) is treated
// as "no SC-01 signal" and the tag isn't applied. Subscribers can
// still be re-tagged later via Kit segment rules or the admin UI.

import "server-only";

// Lowcountry ZIP prefixes. 294 = Charleston/Berkeley/Dorchester/
// parts of Colleton. 295 = parts of Berkeley/Dorchester. 299 =
// Beaufort/Jasper/Hilton Head/Bluffton.
const SC01_ZIP_PREFIXES = ["294", "295", "299"] as const;

export function looksLikeSC01(opts: {
  ipRegion?: string;
  zip?: string;
}): boolean {
  const { ipRegion, zip } = opts;
  // ZIP signal wins if present  -  user-supplied is more trustworthy
  // than geo-IP, especially on mobile.
  if (zip) {
    const digits = zip.replace(/\D/g, "");
    if (digits.length >= 3) {
      const prefix = digits.slice(0, 3);
      if ((SC01_ZIP_PREFIXES as readonly string[]).includes(prefix)) {
        return true;
      }
      // Explicit non-SC ZIP: don't claim SC-01 even if the IP looks SC
      // (e.g. SC office IP for a voter who actually lives in NC). The
      // user told us their ZIP; respect it.
      const isScZip = /^29\d{3}$/.test(digits);
      if (!isScZip) return false;
    }
  }
  // No ZIP supplied, fall back to IP geo. Permissive: anywhere in SC,
  // not just the district, because IP geo can't reliably resolve
  // sub-state regions.
  if (ipRegion && ipRegion.toUpperCase() === "SC") {
    return true;
  }
  return false;
}
