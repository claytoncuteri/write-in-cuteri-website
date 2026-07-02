// Estimate reading time in minutes from a HTML body. Used at save
// time by the admin upload routes and rendered next to the byline
// on every post page.
//
// 200 wpm is the widely cited average adult reading speed for prose
// (Brysbaert 2019 meta-analysis: ~238 wpm for non-fiction with
// comprehension; 200 is a conservative public-facing number that
// matches Medium's published default). Underestimates slightly,
// which is the right direction for setting expectations.

const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(html: string): number {
  if (!html) return 1;
  // Strip tags inline (avoid importing DOMPurify here to keep this
  // module loadable from client components if ever needed).
  const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
