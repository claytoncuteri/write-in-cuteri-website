// Preview card for a blog post. Used in:
//   - /blog index grid
//   - /blog/category/[name] grid
//   - Homepage <HomeBlogTeaser /> (3 most-recent)
//   - End-of-post related-posts row
//
// Variants are intentionally minimal; the same visual structure
// reads correctly in every placement, just inheriting the parent
// grid's column width.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/db";

interface Props {
  post: BlogPost;
}

const DEFAULT_IMAGE = "/logo_a_star_divider/digital_og_image/navy.png";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogCard({ post }: Props) {
  const dateIso = post.publishDate ?? post.createdAt;
  const image = post.featuredImage ?? DEFAULT_IMAGE;
  const imageAlt = post.featuredImageAlt ?? `Cover image for ${post.title}`;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-navy"
    >
      <div className="relative aspect-[16/9] bg-cream">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col flex-1 p-5">
        {post.category && (
          <span className="self-start inline-block px-2 py-0.5 mb-3 rounded text-[10px] font-semibold uppercase tracking-wider bg-navy/10 text-navy">
            {post.category}
          </span>
        )}
        <h3 className="text-lg font-bold text-charcoal font-serif leading-snug line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-charcoal/70 line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-charcoal/60">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(dateIso)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} />
            {post.readingTimeMinutes} min read
          </span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-accent group-hover:gap-2 transition-all">
          Read more
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
