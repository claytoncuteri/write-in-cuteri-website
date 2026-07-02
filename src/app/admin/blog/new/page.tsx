// /admin/blog/new
//
// Empty post-creation form. Auth-gated. The first save persists the
// post and the form transitions to edit mode by routing to
// /admin/blog/<id>.

import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { BlogPostForm } from "../BlogPostForm";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }
  return <BlogPostForm />;
}
