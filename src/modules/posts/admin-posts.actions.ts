"use server";

import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors";
import { requireAdminSession } from "@/modules/admin/authorization";
import { revalidatePublicPaths } from "@/modules/admin/revalidate-public";
import { renderMarkdownToHtml } from "@/modules/markdown/markdown-renderer";
import * as postsService from "@/modules/posts/posts.service";
import {
  publishPostSchema,
  schedulePostSchema,
  updatePostSchema,
} from "@/modules/posts/posts.validation";
import { publicPostPath } from "@/modules/posts/slug";

export type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

function mapActionError(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function parseTagIds(formData: FormData): string[] {
  return formData
    .getAll("tagIds")
    .map((value) => String(value))
    .filter(Boolean);
}

function nullableField(formData: FormData, key: string): string | null | undefined {
  if (!formData.has(key)) return undefined;
  const value = formData.get(key);
  if (value === null || value === "") return null;
  return String(value);
}

function optionalBoolean(formData: FormData, key: string): boolean | undefined {
  if (!formData.has(key)) return undefined;
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function createDraftAction(): Promise<void> {
  const session = await requireAdminSession();
  const post = await postsService.createDraft({}, session.user.id);
  redirect(`/admin/posts/${post.id}/edit`);
}

export async function updatePostAction(
  postId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    const existing = await postsService.getById(postId);

    const input = updatePostSchema.parse({
      title: formData.get("title") ?? undefined,
      slug: formData.get("slug") ?? undefined,
      excerpt: nullableField(formData, "excerpt"),
      contentMarkdown: formData.get("contentMarkdown") ?? undefined,
      categoryId: nullableField(formData, "categoryId"),
      tagIds: parseTagIds(formData),
      seoTitle: nullableField(formData, "seoTitle"),
      seoDescription: nullableField(formData, "seoDescription"),
      canonicalUrl: nullableField(formData, "canonicalUrl"),
      ogTitle: nullableField(formData, "ogTitle"),
      ogDescription: nullableField(formData, "ogDescription"),
      featured: optionalBoolean(formData, "featured"),
      pinned: optionalBoolean(formData, "pinned"),
      pinnedPriority: formData.get("pinnedPriority")
        ? Number(formData.get("pinnedPriority"))
        : undefined,
      createRevision: formData.get("createRevision") === "true",
    });

    const updated = await postsService.updateDraft(postId, input, session.user.id);

    if (existing.status === "published" || updated.status === "published") {
      revalidatePublicPaths(existing.slug);
      if (updated.slug !== existing.slug) {
        revalidatePublicPaths(updated.slug);
      }
    }

    return { ok: true, message: "Draft saved" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function publishPostAction(postId: string): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    const existing = await postsService.getById(postId);
    const updated = await postsService.publishPost(postId, session.user.id, publishPostSchema.parse({}));
    revalidatePublicPaths(existing.slug);
    if (updated.slug !== existing.slug) {
      revalidatePublicPaths(updated.slug);
    }
    return { ok: true, message: `Published at ${publicPostPath(updated.slug)}` };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function unpublishPostAction(postId: string): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    const existing = await postsService.getById(postId);
    await postsService.unpublishPost(postId, session.user.id);
    revalidatePublicPaths(existing.slug);
    return { ok: true, message: "Post unpublished" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function schedulePostAction(
  postId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    const input = schedulePostSchema.parse({
      scheduledAt: formData.get("scheduledAt"),
    });
    await postsService.schedulePost(postId, session.user.id, input);
    return { ok: true, message: "Post scheduled" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function archivePostAction(postId: string): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    const existing = await postsService.getById(postId);
    await postsService.archivePost(postId, session.user.id);
    revalidatePublicPaths(existing.slug);
    return { ok: true, message: "Post archived" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function duplicatePostAction(postId: string): Promise<void> {
  const session = await requireAdminSession();
  const post = await postsService.duplicatePost(postId, session.user.id);
  redirect(`/admin/posts/${post.id}/edit`);
}

export async function markFeaturedAction(postId: string, featured: boolean): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    const existing = await postsService.getById(postId);
    if (featured) {
      await postsService.markFeatured(postId, session.user.id);
    } else {
      await postsService.unmarkFeatured(postId, session.user.id);
    }
    if (existing.status === "published") {
      revalidatePublicPaths(existing.slug);
    }
    return { ok: true, message: featured ? "Marked featured" : "Unmarked featured" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function pinPostAction(
  postId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession();
    const existing = await postsService.getById(postId);
    const pinned = formData.get("pinned") === "true";
    const pinnedPriority = Number(formData.get("pinnedPriority") ?? 0);

    if (pinned) {
      await postsService.pinPost(postId, session.user.id, { pinnedPriority });
    } else {
      await postsService.unpinPost(postId, session.user.id);
    }

    if (existing.status === "published") {
      revalidatePublicPaths(existing.slug);
    }

    return { ok: true, message: pinned ? "Post pinned" : "Post unpinned" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function previewMarkdownAction(markdown: string): Promise<{ html: string }> {
  await requireAdminSession();
  const html = await renderMarkdownToHtml(markdown);
  return { html };
}
