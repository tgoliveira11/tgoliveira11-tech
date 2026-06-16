import { NotFoundError, ValidationError } from "@/lib/errors";
import { assertAssetBelongsToPost } from "@/modules/assets/assets.service";
import { renderMarkdownToHtml } from "@/modules/markdown/markdown-renderer";
import * as redirectsService from "@/modules/redirects/redirects.service";
import { calculateReadingTimeMinutes } from "./reading-time";
import * as postTagsRepo from "./post-tags.repository";
import * as repo from "./posts.repository";
import { isValidSlug, normalizeSlug, publicPostPath, slugFromTitle } from "./slug";
import type {
  AdminPostBundle,
  AdminPostListFilters,
  AdminPostListResult,
  Post,
  PublishedPostListOptions,
} from "./posts.types";
import {
  assertPublishablePost,
  assertScheduleDate,
  createPostSchema,
  pinPostSchema,
  publicOrderSchema,
  publishPostSchema,
  schedulePostSchema,
  updatePostSchema,
  type CreatePostInput,
  type PinPostInput,
  type PublicOrderInput,
  type PublishPostInput,
  type SchedulePostInput,
  type UpdatePostInput,
} from "./posts.validation";

async function ensureUniqueSlug(baseSlug: string, excludePostId?: string): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while (await repo.slugExists(candidate, excludePostId)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function renderAndMeasure(markdown: string) {
  const [contentHtmlCache, readingTimeMinutes] = await Promise.all([
    renderMarkdownToHtml(markdown),
    Promise.resolve(calculateReadingTimeMinutes(markdown)),
  ]);

  return { contentHtmlCache, readingTimeMinutes };
}

async function maybeCreateSlugRedirect(oldSlug: string, newSlug: string, wasPublished: boolean) {
  if (!wasPublished || oldSlug === newSlug) {
    return;
  }

  await redirectsService.createRedirect({
    sourcePath: publicPostPath(oldSlug),
    targetPath: publicPostPath(newSlug),
    statusCode: 301,
  });
}

export async function createDraft(input: CreatePostInput, userId: string): Promise<Post> {
  const parsed = createPostSchema.parse(input);
  const title = parsed.title ?? "Untitled";
  const baseSlug = parsed.slug ?? slugFromTitle(title);
  const slug = await ensureUniqueSlug(baseSlug);

  const post = await repo.insertPost({
    title,
    slug,
    excerpt: parsed.excerpt ?? null,
    contentMarkdown: parsed.contentMarkdown ?? "",
    categoryId: parsed.categoryId ?? null,
    status: "draft",
    publicOrder: null,
    createdBy: userId,
    updatedBy: userId,
  });

  if (parsed.tagIds) {
    await postTagsRepo.syncPostTags(post.id, parsed.tagIds);
  }

  return post;
}

export async function updateDraft(
  id: string,
  input: UpdatePostInput,
  userId: string
): Promise<Post> {
  const parsed = updatePostSchema.parse(input);
  const existing = await repo.findPostById(id);

  if (!existing) {
    throw new NotFoundError("Post not found");
  }

  const updates: Partial<Post> = {
    updatedBy: userId,
  };

  if (parsed.title !== undefined) updates.title = parsed.title;
  if (parsed.excerpt !== undefined) updates.excerpt = parsed.excerpt;
  if (parsed.categoryId !== undefined) updates.categoryId = parsed.categoryId;
  if (parsed.coverAssetId !== undefined) updates.coverAssetId = parsed.coverAssetId;
  if (parsed.ogAssetId !== undefined) updates.ogAssetId = parsed.ogAssetId;
  if (parsed.seoTitle !== undefined) updates.seoTitle = parsed.seoTitle;
  if (parsed.seoDescription !== undefined) updates.seoDescription = parsed.seoDescription;
  if (parsed.canonicalUrl !== undefined) updates.canonicalUrl = parsed.canonicalUrl;
  if (parsed.ogTitle !== undefined) updates.ogTitle = parsed.ogTitle;
  if (parsed.ogDescription !== undefined) updates.ogDescription = parsed.ogDescription;
  if (parsed.featured !== undefined) updates.featured = parsed.featured;
  if (parsed.pinned !== undefined) updates.pinned = parsed.pinned;
  if (parsed.pinnedPriority !== undefined) updates.pinnedPriority = parsed.pinnedPriority;
  if (parsed.pinned === false) updates.pinnedPriority = 0;

  if (parsed.coverAssetId !== undefined && parsed.coverAssetId) {
    await assertAssetBelongsToPost(parsed.coverAssetId, id);
  }
  if (parsed.ogAssetId !== undefined && parsed.ogAssetId) {
    await assertAssetBelongsToPost(parsed.ogAssetId, id);
  }

  let nextSlug = existing.slug;
  if (parsed.slug !== undefined) {
    const normalized = normalizeSlug(parsed.slug);
    if (!isValidSlug(normalized)) {
      throw new ValidationError("Invalid slug");
    }
    nextSlug = await ensureUniqueSlug(normalized, id);
    updates.slug = nextSlug;
  }

  if (parsed.contentMarkdown !== undefined) {
    updates.contentMarkdown = parsed.contentMarkdown;
    const rendered = await renderAndMeasure(parsed.contentMarkdown);
    updates.contentHtmlCache = rendered.contentHtmlCache;
    updates.readingTimeMinutes = rendered.readingTimeMinutes;
  }

  const updated = await repo.updatePostById(id, updates);
  if (!updated) {
    throw new NotFoundError("Post not found");
  }

  await maybeCreateSlugRedirect(existing.slug, nextSlug, existing.status === "published");

  if (parsed.createRevision) {
    await repo.insertPostRevision({
      postId: updated.id,
      title: updated.title,
      slug: updated.slug,
      excerpt: updated.excerpt,
      contentMarkdown: updated.contentMarkdown,
      revisionType: "manual_save",
      createdBy: userId,
    });
  }

  if (parsed.tagIds !== undefined) {
    try {
      await postTagsRepo.syncPostTags(updated.id, parsed.tagIds);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "Invalid tags");
    }
  }

  // Autosave revisions are deferred to Phase 3 editor work.
  return updated;
}

export async function getById(id: string): Promise<Post> {
  const post = await repo.findPostById(id);
  if (!post) {
    throw new NotFoundError("Post not found");
  }
  return post;
}

export async function getBySlug(slug: string): Promise<Post> {
  const post = await repo.findPostBySlug(slug);
  if (!post) {
    throw new NotFoundError("Post not found");
  }
  return post;
}

export async function getPublishedBySlug(slug: string): Promise<Post> {
  const post = await repo.findPublishedPostBySlug(slug);
  if (!post) {
    throw new NotFoundError("Published post not found");
  }
  return post;
}

export async function listAdminPosts(filters?: AdminPostListFilters): Promise<Post[]> {
  return repo.listAdminPosts(filters);
}

export async function listAdminPostsWithTotal(
  filters?: AdminPostListFilters
): Promise<AdminPostListResult> {
  return repo.listAdminPostsWithTotal(filters);
}

export async function countAdminPosts(filters?: AdminPostListFilters): Promise<number> {
  return repo.countAdminPosts(filters);
}

export async function getAdminPostBundle(id: string): Promise<AdminPostBundle> {
  const post = await repo.findPostById(id);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const [category, tagIds] = await Promise.all([
    post.categoryId ? repo.findCategoryById(post.categoryId) : Promise.resolve(undefined),
    postTagsRepo.getTagIdsForPost(post.id),
  ]);

  return {
    post,
    category: category ?? null,
    tagIds,
  };
}

export async function getDashboardStats() {
  const [counts, total, recent] = await Promise.all([
    repo.countPostsByStatus(),
    repo.countAllPosts(),
    repo.listAdminPosts({ limit: 8 }),
  ]);

  return { counts, total, recent };
}

export async function listPublishedPosts(options?: PublishedPostListOptions): Promise<Post[]> {
  return repo.listPublishedPosts(options);
}

export async function publishPost(
  id: string,
  userId: string,
  input: PublishPostInput = {}
): Promise<Post> {
  const parsed = publishPostSchema.parse(input);
  const existing = await repo.findPostById(id);

  if (!existing) {
    throw new NotFoundError("Post not found");
  }

  try {
    assertPublishablePost({
      title: existing.title,
      slug: existing.slug,
      contentMarkdown: existing.contentMarkdown,
    });
  } catch (error) {
    throw new ValidationError(error instanceof Error ? error.message : "Invalid post");
  }

  const rendered = await renderAndMeasure(existing.contentMarkdown);
  const publishedAt = parsed.publishedAt ?? new Date();

  const updated = await repo.updatePostById(id, {
    status: "published",
    publishedAt,
    scheduledAt: null,
    unpublishedAt: null,
    contentHtmlCache: rendered.contentHtmlCache,
    readingTimeMinutes: rendered.readingTimeMinutes,
    updatedBy: userId,
  });

  if (!updated) {
    throw new NotFoundError("Post not found");
  }

  await repo.insertPostRevision({
    postId: updated.id,
    title: updated.title,
    slug: updated.slug,
    excerpt: updated.excerpt,
    contentMarkdown: updated.contentMarkdown,
    revisionType: "publish",
    createdBy: userId,
  });

  return updated;
}

export async function unpublishPost(id: string, userId: string): Promise<Post> {
  const existing = await repo.findPostById(id);
  if (!existing) {
    throw new NotFoundError("Post not found");
  }

  const updated = await repo.updatePostById(id, {
    status: "unpublished",
    unpublishedAt: new Date(),
    updatedBy: userId,
  });

  if (!updated) {
    throw new NotFoundError("Post not found");
  }

  await repo.insertPostRevision({
    postId: updated.id,
    title: updated.title,
    slug: updated.slug,
    excerpt: updated.excerpt,
    contentMarkdown: updated.contentMarkdown,
    revisionType: "unpublish",
    createdBy: userId,
  });

  return updated;
}

export async function schedulePost(
  id: string,
  userId: string,
  input: SchedulePostInput
): Promise<Post> {
  const parsed = schedulePostSchema.parse(input);

  try {
    assertScheduleDate(parsed.scheduledAt);
  } catch (error) {
    throw new ValidationError(error instanceof Error ? error.message : "Invalid schedule date");
  }

  const existing = await repo.findPostById(id);
  if (!existing) {
    throw new NotFoundError("Post not found");
  }

  try {
    assertPublishablePost({
      title: existing.title,
      slug: existing.slug,
      contentMarkdown: existing.contentMarkdown,
    });
  } catch (error) {
    throw new ValidationError(error instanceof Error ? error.message : "Invalid post");
  }

  const updated = await repo.updatePostById(id, {
    status: "scheduled",
    scheduledAt: parsed.scheduledAt,
    updatedBy: userId,
  });

  if (!updated) {
    throw new NotFoundError("Post not found");
  }

  return updated;
}

export async function archivePost(id: string, userId: string): Promise<Post> {
  const updated = await repo.updatePostById(id, {
    status: "archived",
    updatedBy: userId,
  });

  if (!updated) {
    throw new NotFoundError("Post not found");
  }

  return updated;
}

export async function duplicatePost(id: string, userId: string): Promise<Post> {
  const existing = await repo.findPostById(id);
  if (!existing) {
    throw new NotFoundError("Post not found");
  }

  const slug = await ensureUniqueSlug(`${existing.slug}-copy`);

  const post = await repo.insertPost({
    title: `${existing.title} (Copy)`,
    slug,
    excerpt: existing.excerpt,
    contentMarkdown: existing.contentMarkdown,
    contentHtmlCache: existing.contentHtmlCache,
    categoryId: existing.categoryId,
    seoTitle: existing.seoTitle,
    seoDescription: existing.seoDescription,
    canonicalUrl: null,
    ogTitle: existing.ogTitle,
    ogDescription: existing.ogDescription,
    readingTimeMinutes: existing.readingTimeMinutes,
    status: "draft",
    featured: false,
    pinned: false,
    pinnedPriority: 0,
    publicOrder: null,
    createdBy: userId,
    updatedBy: userId,
  });

  const tagIds = await postTagsRepo.getTagIdsForPost(existing.id);
  if (tagIds.length > 0) {
    await postTagsRepo.syncPostTags(post.id, tagIds);
  }

  return post;
}

export async function markFeatured(id: string, userId: string): Promise<Post> {
  const updated = await repo.updatePostById(id, { featured: true, updatedBy: userId });
  if (!updated) throw new NotFoundError("Post not found");
  return updated;
}

export async function unmarkFeatured(id: string, userId: string): Promise<Post> {
  const updated = await repo.updatePostById(id, { featured: false, updatedBy: userId });
  if (!updated) throw new NotFoundError("Post not found");
  return updated;
}

export async function pinPost(id: string, userId: string, input: PinPostInput = { pinnedPriority: 0 }): Promise<Post> {
  const parsed = pinPostSchema.parse(input);
  const updated = await repo.updatePostById(id, {
    pinned: true,
    pinnedPriority: parsed.pinnedPriority,
    updatedBy: userId,
  });
  if (!updated) throw new NotFoundError("Post not found");
  return updated;
}

export async function unpinPost(id: string, userId: string): Promise<Post> {
  const updated = await repo.updatePostById(id, {
    pinned: false,
    pinnedPriority: 0,
    updatedBy: userId,
  });
  if (!updated) throw new NotFoundError("Post not found");
  return updated;
}

function assertPublishedForPublicOrder(post: Post) {
  if (post.status !== "published") {
    throw new ValidationError("Only published posts can have a manual public order");
  }
}

export async function setPostPublicOrder(
  id: string,
  userId: string,
  input: PublicOrderInput
): Promise<Post> {
  const parsed = publicOrderSchema.parse(input);
  const existing = await repo.findPostById(id);
  if (!existing) {
    throw new NotFoundError("Post not found");
  }
  assertPublishedForPublicOrder(existing);

  const updated = await repo.updatePostById(id, {
    publicOrder: parsed.publicOrder,
    updatedBy: userId,
  });
  if (!updated) throw new NotFoundError("Post not found");
  return updated;
}

export async function clearPostPublicOrder(id: string, userId: string): Promise<Post> {
  const existing = await repo.findPostById(id);
  if (!existing) {
    throw new NotFoundError("Post not found");
  }

  const updated = await repo.updatePostById(id, {
    publicOrder: null,
    updatedBy: userId,
  });
  if (!updated) throw new NotFoundError("Post not found");
  return updated;
}

export async function movePostPublicOrder(
  id: string,
  userId: string,
  direction: "up" | "down"
): Promise<Post> {
  const existing = await repo.findPostById(id);
  if (!existing) {
    throw new NotFoundError("Post not found");
  }
  assertPublishedForPublicOrder(existing);
  if (existing.publicOrder == null) {
    throw new ValidationError("Set a public order before moving this post");
  }

  const ordered = await repo.listPublishedPostsWithPublicOrder();
  const index = ordered.findIndex((post) => post.id === id);
  if (index === -1) {
    throw new NotFoundError("Post not found in public order list");
  }

  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= ordered.length) {
    return existing;
  }

  const neighbor = ordered[neighborIndex]!;
  const currentOrder = existing.publicOrder;
  const neighborOrder = neighbor.publicOrder;

  if (neighborOrder == null) {
    return existing;
  }

  await repo.updatePostById(id, { publicOrder: neighborOrder, updatedBy: userId });
  await repo.updatePostById(neighbor.id, { publicOrder: currentOrder, updatedBy: userId });

  const updated = await repo.findPostById(id);
  if (!updated) throw new NotFoundError("Post not found");
  return updated;
}

export async function listPublishedPostsWithPublicOrder(): Promise<Post[]> {
  return repo.listPublishedPostsWithPublicOrder();
}

export { isPublicPost } from "./posts.visibility";
