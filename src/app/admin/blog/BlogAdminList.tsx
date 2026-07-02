"use client";

// Client-side post table for /admin/blog. Hydrates with the server-
// rendered initial list, then refetches via /api/admin/blog after any
// delete so the UI reflects DB state without a hard reload.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink, Plus } from "lucide-react";
import type { BlogPost } from "@/lib/db";

interface Props {
  initialPosts: BlogPost[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-200 text-gray-700",
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
};

export function BlogAdminList({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [busy, setBusy] = useState<string | null>(null);

  async function handleDelete(post: BlogPost) {
    if (
      !window.confirm(
        `Delete "${post.title}"? This is permanent and cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(post.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Delete failed" }));
        alert(`Delete failed: ${j.error ?? res.status}`);
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/admin"
              className="text-sm text-navy hover:text-navy-dark transition-colors"
            >
              &larr; Back to dashboard
            </Link>
            <h1 className="text-3xl font-bold text-charcoal font-serif mt-2">
              Blog Posts
            </h1>
            <p className="text-sm text-charcoal/60 mt-1">
              {posts.length} {posts.length === 1 ? "post" : "posts"} total
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/blog/new")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-accent text-white font-semibold hover:bg-red-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-accent"
          >
            <Plus size={16} />
            New post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-charcoal/70">
              No posts yet. Click &ldquo;New post&rdquo; to write the first one.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-charcoal/60 uppercase text-xs">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal">{post.title}</div>
                      <div className="text-xs text-charcoal/70 mt-0.5 font-mono">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-block px-2 py-0.5 rounded text-xs font-medium " +
                          (STATUS_STYLES[post.status] ?? STATUS_STYLES.draft)
                        }
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {post.category ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-charcoal/70 whitespace-nowrap">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="inline-flex items-center justify-center h-8 w-8 rounded text-charcoal/60 hover:text-navy hover:bg-navy/10 transition-colors"
                            title="View live"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${encodeURIComponent(post.id)}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded text-charcoal/60 hover:text-navy hover:bg-navy/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          disabled={busy === post.id}
                          className="inline-flex items-center justify-center h-8 w-8 rounded text-charcoal/60 hover:text-red-accent hover:bg-red-accent/10 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
