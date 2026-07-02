// Full post renderer for /blog/[slug]. Server component.
//
// Reads a pre-sanitized BlogPost from the DB and dangerouslySets the
// body HTML into a prose-styled container. Defense in depth: even
// though the API path sanitizes on save, we run the body through
// blog-sanitize a SECOND time at render so stored content that
// pre-dates the sanitizer (or was inserted out-of-band) still gets
// scrubbed before reaching the browser.

import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPost as BlogPostType } from "@/lib/db";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";

interface Props {
  post: BlogPostType;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogPost({ post }: Props) {
  const dateIso = post.publishDate ?? post.createdAt;
  const safeBody = sanitizeBlogHtml(post.bodyHtml ?? "");

  return (
    <article className="bg-white">
      {/* Header */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        {post.category && (
          <p className="text-red-accent font-semibold text-xs uppercase tracking-wider mb-3">
            {post.category}
          </p>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold text-charcoal font-serif leading-tight">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="mt-4 text-xl text-charcoal/70 leading-relaxed">
            {post.subtitle}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-charcoal/60">
          <span className="inline-flex items-center gap-1.5">
            <User size={14} />
            {post.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(dateIso)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {post.readingTimeMinutes} min read
          </span>
        </div>
      </header>

      {/* Featured image */}
      {post.featuredImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-cream">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt ?? post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Body. The `prose` plugin from tailwindcss-typography isn't
          installed; the custom overrides below match its conventions
          using utility classes scoped to the blog-body container so
          we keep one styling source for both the editor and the
          public render. */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div
          className="blog-body text-charcoal"
          // Body is double-sanitized: once on save, again here. Any
          // stored content that pre-dates sanitization gets cleaned
          // before reaching the DOM.
          dangerouslySetInnerHTML={{ __html: safeBody }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-xs uppercase tracking-wider text-charcoal/70 mb-2">
              Tags
            </p>
            <ul className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-block px-3 py-1 rounded-full text-xs bg-cream text-charcoal/70 border border-gray-200"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
