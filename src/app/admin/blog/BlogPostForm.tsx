"use client";

// Shared new-post / edit-post form. Wraps the TipTap editor with the
// metadata fields (title, slug, subtitle, excerpt, category, tags,
// featured image, alt text, SEO keywords) and the save / publish /
// delete actions.
//
// Auto-save: on draft posts, PATCHes the server every 30s of editor
// inactivity. Skipped on published posts to avoid accidentally
// updating live content while the author is still typing.
//
// Markdown import: a one-shot button that takes pasted Markdown or a
// .md file and converts it to HTML via /api/admin/blog/markdown-to-html,
// then drops the result into the editor.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Send, Trash2, Upload, FileText } from "lucide-react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import type { BlogPost, BlogCategory } from "@/lib/db";
import { slugify } from "@/lib/slug";

const AUTO_SAVE_INTERVAL_MS = 30_000;

interface Props {
  post?: BlogPost; // present on edit; undefined on new
}

type FormState = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  category: BlogCategory | "";
  tags: string;
  featuredImage: string;
  featuredImageAlt: string;
  seoKeywords: string;
  bodyHtml: string;
  status: "draft" | "published" | "scheduled";
};

function fromPost(post: BlogPost | undefined): FormState {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    subtitle: post?.subtitle ?? "",
    excerpt: post?.excerpt ?? "",
    category: post?.category ?? "",
    tags: (post?.tags ?? []).join(", "),
    featuredImage: post?.featuredImage ?? "",
    featuredImageAlt: post?.featuredImageAlt ?? "",
    seoKeywords: post?.seoKeywords ?? "",
    bodyHtml: post?.bodyHtml ?? "",
    status: (post?.status as FormState["status"]) ?? "draft",
  };
}

export function BlogPostForm({ post }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => fromPost(post));
  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    post?.updatedAt ?? null,
  );
  const [dirty, setDirty] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const lastSavedSnapshotRef = useRef<string>(JSON.stringify(state));

  // Auto-slug as title is typed, BUT only when the slug field hasn't
  // been hand-edited by the user yet (or is empty).
  const slugWasManual = useRef<boolean>(
    post ? post.slug !== slugify(post.title) : false,
  );

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }

  function handleTitleChange(value: string) {
    setState((s) => {
      const next: FormState = { ...s, title: value };
      if (!slugWasManual.current && !post) {
        next.slug = slugify(value);
      }
      return next;
    });
    setDirty(true);
  }

  function handleSlugChange(value: string) {
    slugWasManual.current = value.trim().length > 0;
    patch("slug", slugify(value));
  }

  async function uploadFeatured(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/blog/upload-image", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({ error: "Upload failed" }));
      alert(`Image upload failed: ${j.error ?? res.status}`);
      return;
    }
    const json = (await res.json()) as { url?: string };
    if (json.url) {
      setState((s) => ({
        ...s,
        featuredImage: json.url!,
        featuredImageAlt: s.featuredImageAlt || file.name,
      }));
      setDirty(true);
    }
  }

  const buildPayload = useCallback(
    (overrideStatus?: FormState["status"]) => ({
      title: state.title.trim(),
      slug: state.slug.trim() || slugify(state.title),
      subtitle: state.subtitle.trim() || undefined,
      excerpt: state.excerpt.trim(),
      bodyHtml: state.bodyHtml,
      category: state.category || undefined,
      tags: state.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featuredImage: state.featuredImage || undefined,
      featuredImageAlt: state.featuredImageAlt || undefined,
      seoKeywords: state.seoKeywords || undefined,
      status: overrideStatus ?? state.status,
    }),
    [state],
  );

  const save = useCallback(
    async (
      overrideStatus?: FormState["status"],
    ): Promise<{ ok: boolean; id?: string; slug?: string }> => {
      if (saving) return { ok: false };
      if (!state.title.trim()) {
        alert("Title is required.");
        return { ok: false };
      }
      setSaving(true);
      try {
        const payload = buildPayload(overrideStatus);
        const url = postId ? `/api/admin/blog/${encodeURIComponent(postId)}` : "/api/admin/blog";
        const method = postId ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          alert(`Save failed: ${json.error ?? res.status}`);
          return { ok: false };
        }
        const saved = json.post as BlogPost;
        if (!postId) setPostId(saved.id);
        setState((s) => ({ ...s, status: saved.status as FormState["status"] }));
        setLastSavedAt(saved.updatedAt);
        setDirty(false);
        lastSavedSnapshotRef.current = JSON.stringify(state);
        return { ok: true, id: saved.id, slug: saved.slug };
      } finally {
        setSaving(false);
      }
    },
    [buildPayload, postId, saving, state],
  );

  // Auto-save loop. Only runs on drafts (the most common state during
  // composition). On published posts, require an explicit Save click
  // so authors don't accidentally update live content mid-edit.
  useEffect(() => {
    if (state.status !== "draft") return;
    const timer = setInterval(() => {
      const snap = JSON.stringify(state);
      if (snap !== lastSavedSnapshotRef.current && state.title.trim()) {
        save().catch(() => undefined);
      }
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [save, state]);

  async function handleSaveDraft() {
    await save("draft");
  }

  async function handlePublish() {
    if (!postId) {
      // Save first to get an id, then publish.
      const res = await save("draft");
      if (!res.ok || !res.id) return;
      const pub = await fetch(`/api/admin/blog/${encodeURIComponent(res.id)}/publish`, {
        method: "POST",
      });
      const pubJson = await pub.json().catch(() => ({}));
      if (!pub.ok || !pubJson.success) {
        alert(`Publish failed: ${pubJson.error ?? pub.status}`);
        return;
      }
      router.push(`/admin/blog/${encodeURIComponent(res.id)}`);
      return;
    }
    // Save current edits first so the published version reflects them.
    const saved = await save();
    if (!saved.ok) return;
    const pub = await fetch(`/api/admin/blog/${encodeURIComponent(postId)}/publish`, {
      method: "POST",
    });
    const pubJson = await pub.json().catch(() => ({}));
    if (!pub.ok || !pubJson.success) {
      alert(`Publish failed: ${pubJson.error ?? pub.status}`);
      return;
    }
    setState((s) => ({ ...s, status: "published" }));
  }

  async function handleDelete() {
    if (!postId) return;
    if (!window.confirm(`Delete "${state.title}"? This is permanent.`)) return;
    const res = await fetch(`/api/admin/blog/${encodeURIComponent(postId)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({ error: "Delete failed" }));
      alert(`Delete failed: ${j.error ?? res.status}`);
      return;
    }
    router.push("/admin/blog");
  }

  async function handleImportMarkdown() {
    if (!importText.trim()) {
      setImportOpen(false);
      return;
    }
    const res = await fetch("/api/admin/blog/markdown-to-html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown: importText }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      alert(`Import failed: ${json.error ?? res.status}`);
      return;
    }
    setState((s) => ({ ...s, bodyHtml: json.html as string }));
    setDirty(true);
    setImportOpen(false);
    setImportText("");
  }

  const excerptCount = state.excerpt.length;
  const excerptWarn = excerptCount > 240;
  const excerptOver = excerptCount > 300;

  const liveUrl = useMemo(() => {
    if (state.status !== "published" || !state.slug) return null;
    return `/blog/${state.slug}`;
  }, [state.slug, state.status]);

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/admin/blog"
              className="text-sm text-navy hover:text-navy-dark transition-colors"
            >
              &larr; All posts
            </Link>
            <h1 className="text-3xl font-bold text-charcoal font-serif mt-2">
              {post ? "Edit post" : "New post"}
            </h1>
            <p className="text-sm text-charcoal/60 mt-1">
              Status: <span className="font-medium">{state.status}</span>
              {lastSavedAt && (
                <span className="ml-2">
                  &middot; Saved {new Date(lastSavedAt).toLocaleString()}
                </span>
              )}
              {dirty && (
                <span className="ml-2 text-red-accent">&middot; unsaved changes</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {liveUrl && (
              <Link
                href={liveUrl}
                target="_blank"
                className="px-3 py-2 text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-colors"
              >
                View live
              </Link>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-colors disabled:opacity-40"
            >
              <Save size={14} />
              Save draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-accent rounded-lg hover:bg-red-accent-dark transition-colors disabled:opacity-40"
            >
              <Send size={14} />
              {state.status === "published" ? "Update live" : "Publish"}
            </button>
            {postId && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-accent border-2 border-red-accent rounded-lg hover:bg-red-accent hover:text-white transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Metadata grid */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                Title *
              </label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                Slug
              </label>
              <input
                type="text"
                value={state.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-from-title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              />
              <p className="text-[11px] text-charcoal/50 mt-1">
                /blog/{state.slug || slugify(state.title) || "<slug>"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={state.category}
                onChange={(e) => patch("category", e.target.value as BlogCategory | "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="">(none)</option>
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={state.subtitle}
                onChange={(e) => patch("subtitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                Excerpt
                <span
                  className={
                    "ml-2 font-mono text-[10px] " +
                    (excerptOver
                      ? "text-red-accent"
                      : excerptWarn
                        ? "text-orange-600"
                        : "text-charcoal/50")
                  }
                >
                  {excerptCount}/300
                </span>
              </label>
              <textarea
                value={state.excerpt}
                onChange={(e) => patch("excerpt", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy resize-none"
              />
              <p className="text-[11px] text-charcoal/50 mt-1">
                Shown on cards and in search results.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={state.tags}
                onChange={(e) => patch("tags", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                SEO keywords
              </label>
              <input
                type="text"
                value={state.seoKeywords}
                onChange={(e) => patch("seoKeywords", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
                Featured image
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {state.featuredImage && (
                  <img
                    src={state.featuredImage}
                    alt={state.featuredImageAlt}
                    className="h-16 w-24 object-cover rounded border border-gray-200"
                  />
                )}
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-navy border border-navy rounded-lg cursor-pointer hover:bg-navy hover:text-white transition-colors">
                  <Upload size={14} />
                  {state.featuredImage ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFeatured(f);
                    }}
                  />
                </label>
                {state.featuredImage && (
                  <button
                    type="button"
                    onClick={() => {
                      patch("featuredImage", "");
                      patch("featuredImageAlt", "");
                    }}
                    className="text-xs text-red-accent hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              {state.featuredImage && (
                <input
                  type="text"
                  value={state.featuredImageAlt}
                  onChange={(e) => patch("featuredImageAlt", e.target.value)}
                  placeholder="Alt text (describe the image)"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
              )}
            </div>
          </div>
        </div>

        {/* Markdown import (only on new posts; once content exists,
            re-importing would clobber the editor's body). */}
        {!post && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setImportOpen((v) => !v)}
              className="inline-flex items-center gap-2 text-sm text-navy hover:text-navy-dark transition-colors"
            >
              <FileText size={14} />
              {importOpen ? "Cancel import" : "Import from Markdown"}
            </button>
            {importOpen && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-charcoal/60 mb-2">
                  Paste Markdown below. Headings, bold, italic, links,
                  lists, code blocks, and tables convert. Click Import
                  to drop the converted HTML into the editor.
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-charcoal text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy resize-y"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportMarkdown}
                    className="px-3 py-2 text-sm font-semibold text-white bg-navy rounded-lg hover:bg-navy-dark transition-colors"
                  >
                    Import
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Body editor */}
        <BlogEditor
          initialHtml={state.bodyHtml}
          onChange={(html) => patch("bodyHtml", html)}
        />
      </div>
    </div>
  );
}
