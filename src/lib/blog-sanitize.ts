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

// isomorphic-dompurify's default export is an already-initialised
// DOMPurify instance (bound to a jsdom window on the server). It is
// NOT a factory: calling it with no window returns an unsupported
// instance that has no `sanitize` method, which is what crashed every
// /blog/[slug] page and the RSS feed with "sanitize is not a function".
import DOMPurify from "isomorphic-dompurify";

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
  // Style hooks: TipTap text-align and text-color write inline style.
  // DOMPurify does NOT inspect style values, so the hook below limits
  // style to the two properties the editor actually emits.
  "style", "class",
  // Custom callout marker (TipTap callout node renders as
  // <div data-callout="info|warn|success">...</div>)
  "data-callout",
];

// DOMPurify runs every allowed attribute value that is not on its
// "URI safe" list through ALLOWED_URI_REGEXP. Our regexp below is
// deliberately strict (scheme or site-absolute path only), so plain
// values like target="_blank", colspan="2" or data-callout="info"
// would be stripped unless we mark those attributes as inert here.
// href and src are intentionally left off so they stay URL-checked.
const INERT_ATTR = [
  "target", "rel", "width", "height", "colspan", "rowspan", "scope",
  "data-callout",
];

// Inline style allowlist. The editor only ever emits text-align (from
// @tiptap/extension-text-align) and color (from the Color mark). Any
// other declaration, including url(...) values, is dropped so a leaked
// write cannot use CSS for overlays, tracking pixels or data exfil.
const STYLE_PROP_VALUE: Record<string, RegExp> = {
  "text-align": /^(left|center|right|justify)$/i,
  color: /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i,
};

function filterStyle(style: string): string {
  return style
    .split(";")
    .map((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return null;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const value = decl.slice(idx + 1).trim();
      const pattern = STYLE_PROP_VALUE[prop];
      return pattern && pattern.test(value) ? `${prop}: ${value}` : null;
    })
    .filter((d): d is string => d !== null)
    .join("; ");
}

// Hooks are registered once per process on the shared instance. The
// hook only touches `style`; every other attribute is left to the
// allowlist + URI checks in the config.
DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
  if (data.attrName !== "style") return;
  const kept = filterStyle(data.attrValue);
  if (kept) {
    data.attrValue = kept;
  } else {
    data.keepAttr = false;
  }
});

export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";
  // Campaign style rule: no em dashes anywhere in site copy. Posts are
  // authored in the TipTap editor or imported from markdown, both of
  // which can carry U+2014 through; normalize to a spaced hyphen here
  // so the rule holds for database-driven content too.
  const normalized = html.replace(/\s*—\s*/g, " - ");
  return DOMPurify.sanitize(normalized, {
    // Note: do NOT add USE_PROFILES here. When a profile is set,
    // DOMPurify replaces ALLOWED_TAGS/ALLOWED_ATTR with the profile's
    // full HTML set, which silently let forms, inputs, h1 and every
    // standard attribute through.
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_URI_SAFE_ATTR: INERT_ATTR,
    // Only the explicitly listed data-callout attribute is allowed;
    // every other data-* attribute is dropped.
    ALLOW_DATA_ATTR: false,
    // href/src must be https?, mailto:, tel:, a site-absolute path or
    // a fragment. Rejects javascript:, data: and protocol-relative
    // (//evil.example) URLs.
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|\/[^/]|#)/i,
  });
}

// For strict text-only excerpts (RSS, OG description). Strips ALL
// tags, decodes entities. Use this when serializing the post excerpt
// into places that should never render HTML.
export function stripHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}
