// /blog/category/[name] -- category-filtered post index.
//
// generateStaticParams returns the 5 canonical categories so each
// gets a pre-rendered shell; the actual post list is fetched at
// request time (force-dynamic) so newly published posts appear
// immediately. URL casing matches the canonical category name
// (Lowcountry, National, ...). Anything else 404s.

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/db";
import { BLOG_CATEGORIES, isBlogCategory } from "@/lib/blog-categories";
import { BlogCard } from "@/components/blog/BlogCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((name) => ({ name }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  if (!isBlogCategory(name)) {
    return { title: "Category not found | Clayton Cuteri for Congress" };
  }
  return {
    title: `${name} | The Campaign Blog | Clayton Cuteri for U.S. House, District 1 (SC)`,
    description: `${name}-category posts from Clayton Cuteri's campaign blog. U.S. House of Representatives, District 1, South Carolina.`,
  };
}

const PAGE_SIZE = 12;

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  if (!isBlogCategory(name)) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, total } = await listPublishedPosts({
    page,
    pageSize: PAGE_SIZE,
    category: name,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <section className="bg-navy py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">
            Category
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight">
            {name}
          </h1>
          <Link
            href="/blog"
            className="inline-block mt-4 text-white/80 hover:text-white underline-offset-4 hover:underline"
          >
            &larr; All categories
          </Link>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <p className="text-center text-charcoal/70 py-16">
              No posts in this category yet.
            </p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  {page > 1 && (
                    <Link
                      href={`/blog/category/${name}?page=${page - 1}`}
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
                      href={`/blog/category/${name}?page=${page + 1}`}
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
