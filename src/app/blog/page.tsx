// /blog -- public blog index. Grid of published posts, newest first,
// 12 per page. Pagination via the ?page= search param. Server
// component; reads from Postgres on each request.

import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata, BLOG_OG_IMAGE } from "@/lib/og";
import { listPublishedPosts } from "@/lib/db";
import { BlogCard } from "@/components/blog/BlogCard";

export const metadata: Metadata = pageMetadata({
  path: "/blog",
  title:
    "The Campaign Blog | Clayton Cuteri for U.S. House of Representatives, District 1 (SC)",
  description:
    "Lowcountry-focused commentary, national platform updates, and campaign news from Clayton Cuteri and the American Congress Party, South Carolina District 1.",
  ogTitle: "The Campaign Blog | Clayton Cuteri, SC-01",
  ogDescription:
    "Lowcountry stories, platform deep dives and news from Clayton Cuteri and the American Congress Party, SC District 1.",
  image: BLOG_OG_IMAGE,
});

// Force dynamic so the build doesn't try to statically prerender the
// page in environments without DATABASE_URL (Replit local builds,
// CI without secrets). Reads still benefit from per-request caching
// once deployed.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, total } = await listPublishedPosts({
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
              The Campaign Blog
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
              Where Clayton breaks down what is happening in SC-01 and across America
            </h1>
            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Lowcountry stories, national platform updates, press
              releases, and news from Clayton and the American Congress
              Party.
            </p>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-16">
              <h2 className="text-2xl font-bold text-charcoal font-serif">
                No posts yet
              </h2>
              <p className="mt-3 text-charcoal/70">
                Clayton is just getting started. Check back soon, or
                <Link
                  href="/get-involved"
                  className="text-red-accent font-medium ml-1 hover:underline"
                >
                  join the email list
                </Link>{" "}
                to hear about the first post.
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  {page > 1 && (
                    <Link
                      href={`/blog?page=${page - 1}`}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-navy border border-navy hover:bg-navy hover:text-white transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="text-sm text-charcoal/60">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/blog?page=${page + 1}`}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-navy border border-navy hover:bg-navy hover:text-white transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
