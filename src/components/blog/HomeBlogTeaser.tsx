// Three-card row of the most recent published posts. Mounted on the
// homepage between the About teaser and the volunteer signup form.
// Hides itself entirely if there are no published posts yet (rather
// than showing an empty grid which would look broken).
//
// Server component -- reads directly from Postgres at request time.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listPublishedPosts } from "@/lib/db";
import { BlogCard } from "./BlogCard";

export async function HomeBlogTeaser() {
  // Defensive: at build time without DATABASE_URL the homepage is
  // statically pre-rendered, so a thrown error from the DB read
  // would kill the build. Catch and degrade to empty.
  let posts: Awaited<ReturnType<typeof listPublishedPosts>>["posts"] = [];
  try {
    posts = (await listPublishedPosts({ page: 1, pageSize: 3 })).posts;
  } catch (err) {
    console.error("[HomeBlogTeaser] could not load posts", err);
  }
  if (posts.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-red-accent font-semibold text-sm uppercase tracking-wider mb-2">
              Latest posts
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal font-serif">
              From the campaign blog
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-navy hover:text-navy-dark font-semibold text-sm group"
          >
            All posts
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
