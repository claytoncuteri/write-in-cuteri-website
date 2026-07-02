// /admin/blog/[id]
//
// Edit an existing post. Preloads the post server-side, hands it to
// the shared BlogPostForm client component. 404s on a bad id rather
// than rendering an empty form (the URL is admin-only, so a bad id
// is most often a stale link or a delete race).

import { notFound, redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getBlogPostById } from "@/lib/db";
import { BlogPostForm } from "../BlogPostForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBlogEditPage({ params }: PageProps) {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }
  const { id } = await params;
  const post = await getBlogPostById(decodeURIComponent(id));
  if (!post) notFound();
  return <BlogPostForm post={post} />;
}
