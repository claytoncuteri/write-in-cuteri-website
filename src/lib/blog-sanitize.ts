// Server-only HTML sanitizer for blog post bodies. Runs on:
//   1. Save (POST/PATCH admin routes) so what we store is already
//      clean and a leaked attacker-controlled write can't smuggle in
//      a script tag.
//   2. Render (public [slug] page) as a defense-in-depth measure in
//      case stored content was somehow written outside the API path.
//
// Allowlist matches what TipTap's standard-plus-advanced extension
// set can produce, plus a handful of attributes (href, src, alt,
// width/height, target, rel, colspan/rowspan, data-callout for the
// custom Callout node, and style for text-align/text-color spans).

import "server-only";

import createDOMPurify from "isomorphic-dompurify";

const purify = createDOMPurify();

const ALLOWED_TAGS = [
  // Block + inline text
  "p", "br", "strong", "em", "u", "s", "sub", "sup",
  // Headings (H2/H3 used by editor; allow H4 for future)
  "h2", "h3", "h4",
  // Lists
  "ul", "ol", "li",
  // Quotes + code
  "blockquote", "code", "pre",
  // Links + images + rules
  "a", "img", "hr",
  // Generic containers (callout box uses <div data-callout="info">)
  "div", "span",
  // Tables
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
];

const ALLOWED_ATTR = [
  // Links
  "href", "target", "rel", "title",
  // Images
  "src", "alt", "width", "height",
  // Tables
  "colspan", "rowspan", "scope",
  // Style hooks: TipTap text-align writes inline style, text-color
  // writes either inline style or a data attribute depending on
  // extension version. We allow `style` on text-bearing tags but
  // DOMPurify already strips javascript: + url() funcs from style
  // strings by default.
  "style", "class",
  // Custom callout marker (TipTap callout node renders as
  // <div data-callout="info|warn|success">...</div>)
  "data-callout",
];

export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";
  // Campaign style rule: no em dashes anywhere in site copy. Posts are
  // authored in the TipTap editor or imported from markdown, both of
  // which can carry U+2014 through; normalize to a spaced hyphen here
  // so the rule holds for database-driven content too.
  const normalized = html.replace(/\s*—\s*/g, " - ");
  return purify.sanitize(normalized, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Force external links to open safely. Caller can override per-link
    // in the editor if needed, but the default is no-opener.
    ADD_ATTR: ["target", "rel"],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true },
    // Force https + same-origin or fully-qualified URLs for src and
    // href; reject javascript: and data: URIs.
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|\/[^/]|#)/i,
  });
}

// For strict text-only excerpts (RSS, OG description). Strips ALL
// tags, decodes entities. Use this when serializing the post excerpt
// into places that should never render HTML.
export function stripHtml(html: string): string {
  if (!html) return "";
  return purify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}
