"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AdminPostBundle } from "@/modules/posts/posts.types";
import type { Category } from "@/modules/categories/categories.types";
import type { Tag } from "@/modules/tags/tags.types";
import {
  type ActionResult,
  updatePostAction,
} from "@/modules/posts/admin-posts.actions";
import { AdminStatusBadge } from "../admin-status-badge";
import { MarkdownEditor } from "./markdown-editor";
import { PublishControls } from "./publish-controls";
import { ScheduleControls } from "./schedule-controls";
import { FeaturedControls } from "./featured-controls";
import { PinnedControls } from "./pinned-controls";
import { AdminDangerZone } from "../admin-danger-zone";
import { ArchiveButton } from "./archive-button";

const initialState: ActionResult = { ok: true };

export function PostEditorForm({
  bundle,
  categories,
  tags,
}: {
  bundle: AdminPostBundle;
  categories: Category[];
  tags: Tag[];
}) {
  const { post, tagIds } = bundle;
  const boundAction = updatePostAction.bind(null, post.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <AdminStatusBadge status={post.status} />
        {post.readingTimeMinutes ? (
          <span className="text-sm text-[var(--muted)]">{post.readingTimeMinutes} min read</span>
        ) : null}
        <Link href={`/admin/posts/${post.id}/preview`} className="text-sm text-[var(--primary)] underline">
          Open preview
        </Link>
        {post.status === "published" ? (
          <Link href={`/blog/${post.slug}`} className="text-sm text-[var(--primary)] underline" target="_blank" rel="noreferrer">
            View public post ↗
          </Link>
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="createRevision" value="true" />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Title</span>
            <input
              name="title"
              defaultValue={post.title}
              required
              className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Slug</span>
            <input
              name="slug"
              defaultValue={post.slug}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 font-mono text-sm"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Excerpt</span>
          <textarea
            name="excerpt"
            defaultValue={post.excerpt ?? ""}
            rows={3}
            className="w-full rounded-md border border-[var(--border)] px-3 py-2"
          />
        </label>

        <MarkdownEditor name="contentMarkdown" defaultValue={post.contentMarkdown} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Category</span>
            <select
              name="categoryId"
              defaultValue={post.categoryId ?? ""}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="text-sm">
            <legend className="mb-1 font-medium">Tags</legend>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-[var(--border)] p-3">
              {tags.length === 0 ? (
                <p className="text-[var(--muted)]">No tags yet.</p>
              ) : (
                tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={tagIds.includes(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))
              )}
            </div>
          </fieldset>
        </div>

        <details className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <summary className="cursor-pointer font-medium">SEO settings</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block">SEO title</span>
              <input name="seoTitle" defaultValue={post.seoTitle ?? ""} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Canonical URL</span>
              <input name="canonicalUrl" defaultValue={post.canonicalUrl ?? ""} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block">SEO description</span>
              <textarea name="seoDescription" defaultValue={post.seoDescription ?? ""} rows={2} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">OG title</span>
              <input name="ogTitle" defaultValue={post.ogTitle ?? ""} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">OG description</span>
              <input name="ogDescription" defaultValue={post.ogDescription ?? ""} className="w-full rounded-md border px-3 py-2" />
            </label>
          </div>
        </details>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={post.featured} />
            Featured post
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="pinned" defaultChecked={post.pinned} />
            Pinned post
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Pinned priority</span>
            <input
              type="number"
              name="pinnedPriority"
              min={0}
              max={1000}
              defaultValue={post.pinnedPriority}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save draft"}
        </button>
      </form>

      <PublishControls postId={post.id} status={post.status} slug={post.slug} />
      <ScheduleControls postId={post.id} scheduledAt={post.scheduledAt} />
      <FeaturedControls postId={post.id} featured={post.featured} />
      <PinnedControls postId={post.id} pinned={post.pinned} pinnedPriority={post.pinnedPriority} />

      <AdminDangerZone
        title="Archive post"
        description="Archived posts are hidden from public surfaces but preserved in the admin."
      >
        <ArchiveButton postId={post.id} />
      </AdminDangerZone>
    </div>
  );
}
