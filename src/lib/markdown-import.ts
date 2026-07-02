// One-shot Markdown -> HTML converter for the admin's "Import from
// Markdown" button. Lets Clayton paste a Markdown source (or the body
// of a .md file) into the editor and have it converted to the
// TipTap-compatible HTML the editor expects.
//
// Used exclusively by the admin /blog/new page. NOT used at render
// time (posts are stored as sanitized HTML and rendered straight).
//
// marked is the simplest choice for one-shot conversion. We pass
// gfm: true so tables, strikethrough, task lists, and autolinks all
// round-trip. The output then flows through blog-sanitize.ts before
// it lands in Postgres, so anything weird in the Markdown source
// gets stripped.

import "server-only";

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function markdownToHtml(md: string): string {
  if (!md.trim()) return "";
  return marked.parse(md, { async: false }) as string;
}
