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
import { pageMetadata, BLOG_OG_IMAGE, SITE_URL } from "@/lib/og";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_ORIGIN = SITE_URL;

// og:description stays within ~155 chars so previews do not cut
// mid-word; the full excerpt still goes in <meta name="description">.
function clip(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}\u2026`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Post not found | Clayton Cuteri for Congress",
      robots: { index: false, follow: false },
    };
  }
  const description =
    post.excerpt ||
    stripHtml(post.bodyHtml).slice(0, 160).replace(/\s+/g, " ").trim();
  // The post's own featured image when it has one (any size; we do not
  // claim dimensions we have not checked), otherwise the blog card.
  const image = post.featuredImage
    ? { url: post.featuredImage, alt: post.featuredImageAlt ?? post.title }
    : BLOG_OG_IMAGE;
  return pageMetadata({
    path: `/blog/${post.slug}`,
    title: `${post.title} | Clayton Cuteri for U.S. House, District 1 (SC)`,
    description,
    ogTitle: post.title,
    ogDescription: clip(description),
    image,
    type: "article",
    publishedTime: post.publishDate ?? post.createdAt,
    modifiedTime: post.updatedAt,
    authors: [post.author],
    keywords: post.seoKeywords,
  });
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
      : `${SITE_ORIGIN}${BLOG_OG_IMAGE.url}`,
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
