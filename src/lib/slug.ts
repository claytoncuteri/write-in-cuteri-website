// Generate a URL-safe slug from a string. Used by:
//   - The admin form when the user leaves the slug blank or types a
//     title and tabs through (auto-fill behavior)
//   - Server-side validation on the API to coerce client-side
//     accidentally-mistyped slugs into something we can route to
//
// Algorithm:
//   - Lowercase
//   - Strip diacritics (NFKD + remove combining marks)
//   - Replace any run of non-alphanumeric with a single hyphen
//   - Trim leading/trailing hyphens
//   - Cap at 80 chars (URL hygiene; longer is rarely useful)
//
// Examples:
//   "ACE Basin & Data Centers" -> "ace-basin-data-centers"
//   "What's next?"              -> "what-s-next"
//   "Café au lait"              -> "cafe-au-lait"

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
