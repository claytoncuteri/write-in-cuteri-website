// /blog/[slug] -- single blog post. Server component, dynamic.
//
// Renders metadata (Open Graph + Twitter card + JSON-LD BlogPosting
// schema), the BlogPost component for the article body, and the
// BlogPostFooter (share buttons + related + newsletter + donate +
// post-scoped FEC disclosure).
//
// 404s on missing slug OR draft status -- drafts only render in
// /admin/blog.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, listRelatedPosts } from "@/lib/db";
import { BlogPost } from "@/components/blog/BlogPost";
import { BlogPostFooter } from "@/components/blog/BlogPostFooter";
import { stripHtml } from "@/lib/blog-sanitize";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_OG_IMAGE = "/logo_a_star_divider/digital_og_image/navy.png";
const SITE_ORIGIN = "https://writeincuteri.com";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Post not found | Clayton Cuteri for Congress",
    };
  }
  const description =
    post.excerpt ||
    stripHtml(post.bodyHtml).slice(0, 160).replace(/\s+/g, " ").trim();
  const ogImage = post.featuredImage ?? DEFAULT_OG_IMAGE;
  const ogImageAlt = post.featuredImageAlt ?? post.title;
  const canonical = `${SITE_ORIGIN}/blog/${post.slug}`;
  return {
    title: `${post.title} | Clayton Cuteri for U.S. House, District 1 (SC)`,
    description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      siteName: "Clayton Cuteri for Congress",
      type: "article",
      publishedTime: post.publishDate ?? post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [
        {
          url: ogImage,
          alt: ogImageAlt,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
    keywords: post.seoKeywords,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await listRelatedPosts(post, 3);

  const dateIso = post.publishDate ?? post.createdAt;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage
      ? `${SITE_ORIGIN}${post.featuredImage}`
      : `${SITE_ORIGIN}${DEFAULT_OG_IMAGE}`,
    datePublished: dateIso,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
      url: `${SITE_ORIGIN}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Cuteri for Americans",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/images/ACP_Eagle_white_outline.png`,
      },
    },
    mainEntityOfPage: `${SITE_ORIGIN}/blog/${post.slug}`,
    articleSection: post.category,
    keywords: post.seoKeywords,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPost post={post} />
      <BlogPostFooter post={post} related={related} />
    </>
  );
}
