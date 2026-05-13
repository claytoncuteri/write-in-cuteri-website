// Single source of truth for blog post categories. Used by:
//   - Admin form select widget
//   - Public /blog/category/[name] route generation
//   - Validation on the POST /api/admin/blog endpoint
//
// The /admin/blog editor constrains writes to this list, but reads
// stay permissive (db.ts BlogCategory type) so legacy rows with stale
// category strings continue to render rather than 500ing.

import type { BlogCategory } from "@/lib/db";

export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  "Lowcountry",
  "National",
  "Platform",
  "Campaign",
  "Press",
] as const;

export function isBlogCategory(value: unknown): value is BlogCategory {
  return (
    typeof value === "string" &&
    (BLOG_CATEGORIES as readonly string[]).includes(value)
  );
}

// Display labels can diverge from the canonical name later (e.g. a
// translation pass). For now the canonical name is the display name.
export function categoryLabel(category: BlogCategory): string {
  return category;
}
