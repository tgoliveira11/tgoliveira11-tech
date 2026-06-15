"use client";

import { useActionState, useCallback, useState } from "react";
import Link from "next/link";
import type { Asset } from "@/modules/assets/assets.types";
import type { AdminPostBundle } from "@/modules/posts/posts.types";
import type { Category } from "@/modules/categories/categories.types";
import type { Tag } from "@/modules/tags/tags.types";
import {
  type ActionResult,
  unpublishPostAction,
  updatePostAction,
} from "@/modules/posts/admin-posts.actions";
import { publicPostPath } from "@/modules/posts/slug";
import { PostAssetsPanel } from "@/components/admin/assets/post-assets-panel";
import { AdminStatusBadge } from "../admin-status-badge";
import { MarkdownEditor } from "./markdown-editor";
import { ScheduleControls } from "./schedule-controls";
import { FeaturedControls } from "./featured-controls";
import { PinnedControls } from "./pinned-controls";
import { AdminDangerZone } from "../admin-danger-zone";
import { ArchiveButton } from "./archive-button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const initialState: ActionResult = { ok: true };

export function PostEditorForm({
  bundle,
  categories,
  tags,
  assets,
}: {
  bundle: AdminPostBundle;
  categories: Category[];
  tags: Tag[];
  assets: Asset[];
}) {
  const { post, tagIds } = bundle;
  const router = useRouter();
  const boundAction = updatePostAction.bind(null, post.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [unpublishPending, startUnpublish] = useTransition();
  const [insertMarkdown, setInsertMarkdown] = useState<((markdown: string) => void) | null>(null);
  const registerInsert = useCallback((insert: (markdown: string) => void) => {
    setInsertMarkdown(() => insert);
  }, []);

  const editorKey = `${post.id}:${post.updatedAt.toISOString()}`;

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
        <Link href={`/admin/posts/${post.id}/assets`} className="text-sm text-[var(--primary)] underline">
          Manage assets
        </Link>
        {post.status === "published" ? (
          <Link href={publicPostPath(post.slug)} className="text-sm text-[var(--primary)] underline" target="_blank" rel="noreferrer">
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

      <PostAssetsPanel
        postId={post.id}
        postTitle={post.title}
        assets={assets}
        coverAssetId={post.coverAssetId}
        ogAssetId={post.ogAssetId}
        onInsertMarkdown={insertMarkdown ?? undefined}
      />

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

        <MarkdownEditor
          key={editorKey}
          name="contentMarkdown"
          defaultValue={post.contentMarkdown}
          onRegisterInsert={registerInsert}
        />

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

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-semibold">Save and publish</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {post.status === "published"
              ? "Save changes to update the live post. Cover and OG images are managed above and are not cleared when saving."
              : "Publish saves the current editor fields first, then publishes this same post."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save draft"}
            </button>
            {post.status !== "published" ? (
              <button
                type="submit"
                name="intent"
                value="publish"
                disabled={pending}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "Publishing…" : "Save and publish"}
              </button>
            ) : (
              <button
                type="button"
                disabled={unpublishPending}
                onClick={() => {
                  startUnpublish(async () => {
                    const result = await unpublishPostAction(post.id);
                    if (!result.ok) {
                      window.alert(result.error ?? "Could not unpublish");
                      return;
                    }
                    router.refresh();
                  });
                }}
                className="rounded-md border border-orange-300 px-4 py-2 text-sm text-orange-800 disabled:opacity-50"
              >
                Unpublish
              </button>
            )}
          </div>
        </section>
      </form>

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
