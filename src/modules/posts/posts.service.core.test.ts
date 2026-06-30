import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findPostByIdMock,
  findPostBySlugMock,
  findPublishedPostBySlugMock,
  updatePostByIdMock,
  insertPostRevisionMock,
  insertPostMock,
  slugExistsMock,
  countPostsByStatusMock,
  countAllPostsMock,
  listAdminPostsMock,
  listAdminPostsWithTotalMock,
  countAdminPostsMock,
  findCategoryByIdMock,
  getTagIdsForPostMock,
  syncPostTagsMock,
  listPublishedPostsWithPublicOrderMock,
  listPublishedPostsMock,
} = vi.hoisted(() => ({
  findPostByIdMock: vi.fn(),
  findPostBySlugMock: vi.fn(),
  findPublishedPostBySlugMock: vi.fn(),
  updatePostByIdMock: vi.fn(),
  insertPostRevisionMock: vi.fn(),
  insertPostMock: vi.fn(),
  slugExistsMock: vi.fn(),
  countPostsByStatusMock: vi.fn(),
  countAllPostsMock: vi.fn(),
  listAdminPostsMock: vi.fn(),
  listAdminPostsWithTotalMock: vi.fn(),
  countAdminPostsMock: vi.fn(),
  findCategoryByIdMock: vi.fn(),
  getTagIdsForPostMock: vi.fn(),
  syncPostTagsMock: vi.fn(),
  listPublishedPostsWithPublicOrderMock: vi.fn(),
  listPublishedPostsMock: vi.fn(),
}));

vi.mock("@/modules/posts/posts.repository", () => ({
  findPostById: findPostByIdMock,
  findPostBySlug: findPostBySlugMock,
  findPublishedPostBySlug: findPublishedPostBySlugMock,
  updatePostById: updatePostByIdMock,
  insertPostRevision: insertPostRevisionMock,
  insertPost: insertPostMock,
  slugExists: slugExistsMock,
  countPostsByStatus: countPostsByStatusMock,
  countAllPosts: countAllPostsMock,
  listAdminPosts: listAdminPostsMock,
  listAdminPostsWithTotal: listAdminPostsWithTotalMock,
  countAdminPosts: countAdminPostsMock,
  findCategoryById: findCategoryByIdMock,
  listPublishedPostsWithPublicOrder: listPublishedPostsWithPublicOrderMock,
  listPublishedPosts: listPublishedPostsMock,
}));

vi.mock("@/modules/posts/post-tags.repository", () => ({
  syncPostTags: (...args: unknown[]) => syncPostTagsMock(...args),
  getTagIdsForPost: getTagIdsForPostMock,
}));

vi.mock("@/modules/redirects/redirects.service", () => ({
  createRedirect: vi.fn(),
}));

vi.mock("@/modules/assets/assets.service", () => ({
  assertAssetBelongsToPost: vi.fn(),
}));

vi.mock("@/modules/markdown/markdown-renderer", () => ({
  renderMarkdownToHtml: vi.fn(async (markdown: string) => `<p>${markdown}</p>`),
}));

import { NotFoundError } from "@/lib/errors";
import {
  archivePost,
  clearPostPublicOrder,
  countAdminPosts,
  createDraft,
  duplicatePost,
  getAdminPostBundle,
  getById,
  getBySlug,
  getDashboardStats,
  getPublishedBySlug,
  listAdminPosts,
  listAdminPostsWithTotal,
  listPublishedPosts,
  listPublishedPostsWithPublicOrder,
  markFeatured,
  movePostPublicOrder,
  pinPost,
  publishPost,
  schedulePost,
  setPostPublicOrder,
  unmarkFeatured,
  unpublishPost,
  unpinPost,
  updateDraft,
} from "./posts.service";

const postId = "550e8400-e29b-41d4-a716-446655440000";
const userId = "660e8400-e29b-41d4-a716-446655440001";

function makePost(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: postId,
    title: "Title",
    slug: "title",
    excerpt: "Excerpt",
    contentMarkdown: "Body",
    contentHtmlCache: null,
    coverAssetId: null,
    ogAssetId: null,
    status: "draft",
    featured: false,
    pinned: false,
    pinnedPriority: 0,
    publicOrder: null,
    categoryId: null,
    publishedAt: null,
    scheduledAt: null,
    unpublishedAt: null,
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    readingTimeMinutes: 1,
    createdBy: userId,
    updatedBy: userId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("posts service core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findPostByIdMock.mockResolvedValue(makePost());
    findPostBySlugMock.mockResolvedValue(makePost());
    findPublishedPostBySlugMock.mockResolvedValue(makePost({ status: "published", publishedAt: new Date() }));
    updatePostByIdMock.mockImplementation(async (_id, values) => ({ ...makePost(), ...values }));
    insertPostRevisionMock.mockResolvedValue({});
    insertPostMock.mockImplementation(async (values) => ({ ...makePost(), ...values, id: postId }));
    slugExistsMock.mockResolvedValue(false);
    getTagIdsForPostMock.mockResolvedValue(["tag-1"]);
    syncPostTagsMock.mockResolvedValue(undefined);
    listPublishedPostsWithPublicOrderMock.mockResolvedValue([makePost({ publicOrder: 1 })]);
    listPublishedPostsMock.mockResolvedValue([makePost({ status: "published" })]);
    listAdminPostsMock.mockResolvedValue([makePost()]);
    listAdminPostsWithTotalMock.mockResolvedValue({ posts: [makePost()], total: 1 });
    countAdminPostsMock.mockResolvedValue(2);
    findCategoryByIdMock.mockResolvedValue({
      id: "cat-1",
      name: "Engineering",
      slug: "engineering",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("loads posts by id, slug, and published slug", async () => {
    await expect(getById(postId)).resolves.toMatchObject({ id: postId });
    await expect(getBySlug("title")).resolves.toMatchObject({ slug: "title" });
    await expect(getPublishedBySlug("title")).resolves.toMatchObject({ status: "published" });
  });

  it("throws when posts are missing", async () => {
    findPostByIdMock.mockResolvedValue(undefined);
    await expect(getById("missing")).rejects.toBeInstanceOf(NotFoundError);

    findPostBySlugMock.mockResolvedValue(undefined);
    await expect(getBySlug("missing")).rejects.toBeInstanceOf(NotFoundError);

    findPublishedPostBySlugMock.mockResolvedValue(undefined);
    await expect(getPublishedBySlug("missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("builds admin post bundle", async () => {
    findPostByIdMock.mockResolvedValue(makePost({ categoryId: "cat-1" }));
    const bundle = await getAdminPostBundle(postId);
    expect(bundle.post.id).toBe(postId);
    expect(bundle.category?.slug).toBe("engineering");
    expect(bundle.tagIds).toEqual(["tag-1"]);
  });

  it("returns dashboard stats", async () => {
    countPostsByStatusMock.mockResolvedValue({ draft: 1 });
    countAllPostsMock.mockResolvedValue(3);
    listAdminPostsMock.mockResolvedValue([makePost()]);

    await expect(getDashboardStats()).resolves.toEqual({
      counts: { draft: 1 },
      total: 3,
      recent: [expect.objectContaining({ id: postId })],
    });
  });

  it("unpublishes and archives posts", async () => {
    await expect(unpublishPost(postId, userId)).resolves.toMatchObject({ status: "unpublished" });
    await expect(archivePost(postId, userId)).resolves.toMatchObject({ status: "archived" });
    expect(insertPostRevisionMock).toHaveBeenCalled();
  });

  it("schedules publishable posts", async () => {
    const scheduledAt = new Date(Date.now() + 60_000);
    await expect(schedulePost(postId, userId, { scheduledAt })).resolves.toMatchObject({
      status: "scheduled",
      scheduledAt,
    });
  });

  it("toggles featured flag", async () => {
    await expect(markFeatured(postId, userId)).resolves.toMatchObject({ featured: true });
    await expect(unmarkFeatured(postId, userId)).resolves.toMatchObject({ featured: false });
  });

  it("creates drafts and updates content", async () => {
    const created = await createDraft({ title: "New post" }, userId);
    expect(created.title).toBe("New post");
    expect(insertPostMock).toHaveBeenCalled();

    const updated = await updateDraft(
      postId,
      { title: "Updated", contentMarkdown: "New body", createRevision: true },
      userId
    );
    expect(updated.title).toBe("Updated");
    expect(insertPostRevisionMock).toHaveBeenCalled();
  });

  it("pins posts and manages public order", async () => {
    await expect(pinPost(postId, userId, { pinnedPriority: 2 })).resolves.toMatchObject({
      pinned: true,
    });

    findPostByIdMock.mockResolvedValue(
      makePost({ status: "published", publishedAt: new Date(), publicOrder: 1 })
    );
    await expect(setPostPublicOrder(postId, userId, { publicOrder: 2 })).resolves.toMatchObject({
      publicOrder: 2,
    });
    await expect(clearPostPublicOrder(postId, userId)).resolves.toMatchObject({ publicOrder: 0 });

    listPublishedPostsWithPublicOrderMock.mockResolvedValue([
      makePost({ id: postId, status: "published", publishedAt: new Date(), publicOrder: 1 }),
      makePost({ id: "other", status: "published", publishedAt: new Date(), publicOrder: 2 }),
    ]);
    await expect(movePostPublicOrder(postId, userId, "down")).resolves.toBeTruthy();
  });

  it("duplicates posts as drafts", async () => {
    const copy = await duplicatePost(postId, userId);
    expect(copy.status).toBe("draft");
    expect(insertPostMock).toHaveBeenCalled();
  });

  it("publishes posts and validates publishable content", async () => {
    findPostByIdMock.mockResolvedValue(makePost({ title: "Ready", contentMarkdown: "Body" }));
    const published = await publishPost(postId, userId, {});
    expect(published.status).toBe("published");
    expect(insertPostRevisionMock).toHaveBeenCalledWith(
      expect.objectContaining({ revisionType: "publish" })
    );

    const publishedAt = new Date("2026-06-01T12:00:00.000Z");
    await publishPost(postId, userId, { publishedAt });
    expect(updatePostByIdMock).toHaveBeenCalledWith(
      postId,
      expect.objectContaining({ publishedAt })
    );
  });

  it("lists admin and published posts", async () => {
    listAdminPostsMock.mockResolvedValue([makePost()]);
    await expect(listAdminPosts({ status: "draft" })).resolves.toHaveLength(1);
    await expect(listAdminPostsWithTotal({ status: "draft" })).resolves.toEqual({
      posts: [expect.objectContaining({ id: postId })],
      total: 1,
    });
    countAllPostsMock.mockResolvedValue(2);
    await expect(countAdminPosts({ status: "draft" })).resolves.toBe(2);
    await expect(listPublishedPosts({ limit: 5 })).resolves.toHaveLength(1);
    await expect(listPublishedPostsWithPublicOrder()).resolves.toHaveLength(1);
  });

  it("unpins posts and handles public order edge cases", async () => {
    await expect(unpinPost(postId, userId)).resolves.toMatchObject({ pinned: false });

    findPostByIdMock.mockResolvedValue(
      makePost({ status: "published", publishedAt: new Date(), publicOrder: 0 })
    );
    await expect(movePostPublicOrder(postId, userId, "up")).resolves.toMatchObject({ publicOrder: 0 });

    findPostByIdMock.mockResolvedValue(
      makePost({ status: "published", publishedAt: new Date(), publicOrder: 9999 })
    );
    updatePostByIdMock.mockImplementation(async (_id, values) => ({ ...makePost(), ...values }));
    await expect(movePostPublicOrder(postId, userId, "down")).resolves.toMatchObject({
      publicOrder: 9999,
    });
  });

  it("syncs tags when duplicating posts with tags", async () => {
    getTagIdsForPostMock.mockResolvedValue(["tag-1", "tag-2"]);
    await duplicatePost(postId, userId);
    expect(syncPostTagsMock).toHaveBeenCalledWith(postId, ["tag-1", "tag-2"]);
  });

  it("creates drafts with tags and custom slug", async () => {
    slugExistsMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const created = await createDraft(
      {
        title: "Tagged",
        slug: "custom-slug",
        tagIds: ["550e8400-e29b-41d4-a716-446655440002"],
      },
      userId
    );
    expect(created.slug).toContain("custom-slug");
    expect(syncPostTagsMock).toHaveBeenCalled();
  });

  it("validates slug, assets, and tag sync failures when updating drafts", async () => {
    const { assertAssetBelongsToPost } = await import("@/modules/assets/assets.service");
    const { createRedirect } = await import("@/modules/redirects/redirects.service");

    findPostByIdMock.mockResolvedValue(
      makePost({ status: "published", slug: "old-slug", publishedAt: new Date() })
    );
    await updateDraft(postId, { slug: "new-slug" }, userId);
    expect(createRedirect).toHaveBeenCalled();

    await expect(updateDraft(postId, { slug: "!!!" }, userId)).rejects.toThrow(/slug/i);

    vi.mocked(assertAssetBelongsToPost).mockRejectedValueOnce(new Error("Asset mismatch"));
    await expect(
      updateDraft(postId, { coverAssetId: "550e8400-e29b-41d4-a716-446655440003" }, userId)
    ).rejects.toThrow(/Asset mismatch/);

    syncPostTagsMock.mockRejectedValueOnce(new Error("Invalid tags"));
    await expect(
      updateDraft(postId, { tagIds: ["550e8400-e29b-41d4-a716-446655440004"] }, userId)
    ).rejects.toThrow(/Invalid tags/);
  });
});
