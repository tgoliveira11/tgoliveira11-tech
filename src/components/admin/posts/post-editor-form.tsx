"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Asset } from "@/modules/assets/assets.types";
import type { AdminPostBundle } from "@/modules/posts/posts.types";
import type { Category } from "@/modules/categories/categories.types";
import type { Tag } from "@/modules/tags/tags.types";
import { type ActionResult, updatePostAction } from "@/modules/posts/admin-posts.actions";
import { getSaveButtonLabel } from "@/modules/posts/admin-posts.messages";
import { generateDatedSlugFromTitle } from "@/modules/posts/slug";
import { CompactPostAssetsPanel } from "@/components/admin/assets/compact-post-assets-panel";
import { EditorStickyHeader } from "./editor-sticky-header";
import { EDITOR_EXCERPT_CLASS, POST_EDITOR_FORM_ID } from "./editor-constants";
import { MarkdownEditor } from "./markdown-editor";
import { PostEditorDangerZone } from "./post-editor-danger-zone";
import { PostPromotionCard } from "./post-promotion-card";
import { PostPublishingCard } from "./post-publishing-card";
import { PostSeoCard } from "./post-seo-card";
import { PostStatusCard } from "./post-status-card";
import { PostTaxonomyCard } from "./post-taxonomy-card";

const initialState: ActionResult = { ok: true };

export function PostEditorForm({
  bundle,
  categories,
  tags,
  assets,
  uploadMaxFileSizeBytes,
}: {
  bundle: AdminPostBundle;
  categories: Category[];
  tags: Tag[];
  assets: Asset[];
  uploadMaxFileSizeBytes?: number;
}) {
  const { post, tagIds } = bundle;
  const router = useRouter();
  const boundAction = updatePostAction.bind(null, post.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [insertMarkdown, setInsertMarkdown] = useState<((markdown: string) => void) | null>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const slugTouchedRef = useRef(Boolean(post.slug.trim()));
  const registerInsert = useCallback((insert: (markdown: string) => void) => {
    setInsertMarkdown(() => insert);
  }, []);

  const editorKey = `${post.id}:${post.updatedAt.toISOString()}`;
  const fieldKey = editorKey;

  useEffect(() => {
    if (state.ok && state.message && !state.error) {
      router.refresh();
    }
  }, [router, state.error, state.message, state.ok]);

  useEffect(() => {
    slugTouchedRef.current = Boolean(post.slug.trim());
  }, [fieldKey, post.slug]);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouchedRef.current && slugInputRef.current) {
      slugInputRef.current.value = generateDatedSlugFromTitle(event.target.value);
    }
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    slugTouchedRef.current = event.target.value.trim().length > 0;
  }

  function handleSlugBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (!event.target.value.trim()) {
      slugTouchedRef.current = false;
      const titleInput = event.currentTarget.form?.elements.namedItem("title");
      const titleValue =
        titleInput instanceof HTMLInputElement ? titleInput.value.trim() : "";
      if (titleValue) {
        event.target.value = generateDatedSlugFromTitle(titleValue);
      }
    }
  }

  const saveLabel = getSaveButtonLabel(post.status);

  return (
    <div className="mx-auto max-w-7xl">
      <EditorStickyHeader
        post={post}
        pending={pending}
        saveLabel={saveLabel}
        publishLabel="Save and publish"
        lastMessage={state.ok ? state.message : undefined}
      />

      {state.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}
      {state.message && !state.error ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <form id={POST_EDITOR_FORM_ID} action={formAction} className="flex flex-col space-y-5">
          <input type="hidden" name="createRevision" value="true" />

          <label className="block text-sm">
            <span className="mb-1 block text-base font-semibold">Title</span>
            <input
              key={fieldKey}
              name="title"
              defaultValue={post.title}
              onChange={handleTitleChange}
              required
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Slug</span>
            <input
              key={fieldKey}
              ref={slugInputRef}
              name="slug"
              defaultValue={post.slug}
              onChange={handleSlugChange}
              onBlur={handleSlugBlur}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <span className="mt-1 block text-xs text-[var(--muted)]">Public URL: /blog/{post.slug}</span>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Excerpt</span>
            <textarea
              name="excerpt"
              defaultValue={post.excerpt ?? ""}
              className={EDITOR_EXCERPT_CLASS}
              placeholder="Short summary for listings and SEO"
            />
          </label>

          <div className="flex min-h-0 flex-1 flex-col">
            <MarkdownEditor
            key={editorKey}
            name="contentMarkdown"
            defaultValue={post.contentMarkdown}
            onRegisterInsert={registerInsert}
          />
          </div>
        </form>

        <aside className="space-y-4">
          <PostStatusCard post={post} />

          <CompactPostAssetsPanel
            postId={post.id}
            assets={assets}
            coverAssetId={post.coverAssetId}
            ogAssetId={post.ogAssetId}
            onInsertMarkdown={insertMarkdown ?? undefined}
            uploadMaxFileSizeBytes={uploadMaxFileSizeBytes}
          />

          <PostTaxonomyCard
            formId={POST_EDITOR_FORM_ID}
            categories={categories}
            tags={tags}
            categoryId={post.categoryId}
            tagIds={tagIds}
          />
          <PostPromotionCard
            formId={POST_EDITOR_FORM_ID}
            featured={post.featured}
            pinned={post.pinned}
            pinnedPriority={post.pinnedPriority}
          />
          <PostSeoCard formId={POST_EDITOR_FORM_ID} post={post} />

          <PostPublishingCard postId={post.id} scheduledAt={post.scheduledAt} />
          <PostEditorDangerZone postId={post.id} />
        </aside>
      </div>
    </div>
  );
}
