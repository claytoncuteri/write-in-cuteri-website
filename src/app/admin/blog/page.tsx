// /admin/blog
//
// Lists every post (drafts + published). Edit / delete from here.
// Click "New post" to create. Same auth gate as /admin: the server
// component checks the cookie before rendering anything.

import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listAllPostsAdmin } from "@/lib/db";
import { BlogAdminList } from "./BlogAdminList";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin");
  }
  const posts = await listAllPostsAdmin();
  return <BlogAdminList initialPosts={posts} />;
}
