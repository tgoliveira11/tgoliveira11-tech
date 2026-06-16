import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getNextPublicOrderMock,
  insertPostMock,
  findPostByIdMock,
  slugExistsMock,
  syncPostTagsMock,
  getTagIdsForPostMock,
  listPublishedPostsWithPublicOrderMock,
  updatePostByIdMock,
} = vi.hoisted(() => ({
  getNextPublicOrderMock: vi.fn(),
  insertPostMock: vi.fn(),
  findPostByIdMock: vi.fn(),
  slugExistsMock: vi.fn(),
  syncPostTagsMock: vi.fn(),
  getTagIdsForPostMock: vi.fn(),
  listPublishedPostsWithPublicOrderMock: vi.fn(),
  updatePostByIdMock: vi.fn(),
}));

vi.mock("@/modules/posts/posts.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/posts/posts.repository")>();
  return {
    ...actual,
    getNextPublicOrder: getNextPublicOrderMock,
    insertPost: insertPostMock,
    findPostById: findPostByIdMock,
    slugExists: slugExistsMock,
    listPublishedPostsWithPublicOrder: listPublishedPostsWithPublicOrderMock,
    updatePostById: updatePostByIdMock,
  };
});

vi.mock("@/modules/posts/post-tags.repository", () => ({
  syncPostTags: syncPostTagsMock,
  getTagIdsForPost: getTagIdsForPostMock,
}));

vi.mock("@/modules/markdown/markdown-renderer", () => ({
  renderMarkdownToHtml: vi.fn(),
}));

vi.mock("@/modules/redirects/redirects.service", () => ({
  createRedirect: vi.fn(),
}));

import { createDraft, duplicatePost, movePostPublicOrder } from "@/modules/posts/posts.service";

const userId = "user-123";

function makePost(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: "post-1",
    title: "Untitled",
    slug: "untitled",
    excerpt: null,
    contentMarkdown: "",
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
    readingTimeMinutes: null,
    createdBy: userId,
    updatedBy: userId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("publicOrder creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    slugExistsMock.mockResolvedValue(false);
    getTagIdsForPostMock.mockResolvedValue([]);
    syncPostTagsMock.mockResolvedValue(undefined);
    insertPostMock.mockImplementation(async (values) => makePost(values));
  });

  it("creates drafts with publicOrder null", async () => {
    await createDraft({}, userId);

    expect(getNextPublicOrderMock).not.toHaveBeenCalled();
    expect(insertPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        publicOrder: null,
        status: "draft",
      })
    );
  });

  it("duplicates posts with publicOrder null", async () => {
    findPostByIdMock.mockResolvedValue(makePost({ id: "source", publicOrder: 3, status: "published" }));

    const copy = await duplicatePost("source", userId);

    expect(getNextPublicOrderMock).not.toHaveBeenCalled();
    expect(insertPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        publicOrder: null,
      })
    );
    expect(copy.publicOrder).toBeNull();
  });
});

describe("movePostPublicOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("swaps publicOrder values when moving down", async () => {
    findPostByIdMock
      .mockResolvedValueOnce(makePost({ id: "a", status: "published", publicOrder: 1 }))
      .mockResolvedValueOnce(makePost({ id: "a", status: "published", publicOrder: 2 }));
    listPublishedPostsWithPublicOrderMock.mockResolvedValue([
      makePost({ id: "a", status: "published", publicOrder: 1 }),
      makePost({ id: "b", status: "published", publicOrder: 2 }),
    ]);

    await movePostPublicOrder("a", userId, "down");

    expect(updatePostByIdMock).toHaveBeenCalledWith("a", { publicOrder: 2, updatedBy: userId });
    expect(updatePostByIdMock).toHaveBeenCalledWith("b", { publicOrder: 1, updatedBy: userId });
  });

  it("does not move the first ordered post up", async () => {
    const first = makePost({ id: "a", status: "published", publicOrder: 1 });
    findPostByIdMock.mockResolvedValue(first);
    listPublishedPostsWithPublicOrderMock.mockResolvedValue([
      first,
      makePost({ id: "b", status: "published", publicOrder: 2 }),
    ]);

    const result = await movePostPublicOrder("a", userId, "up");

    expect(updatePostByIdMock).not.toHaveBeenCalled();
    expect(result).toEqual(first);
  });

  it("rejects moves when publicOrder is null", async () => {
    findPostByIdMock.mockResolvedValue(makePost({ status: "published", publicOrder: null }));

    await expect(movePostPublicOrder("post-1", userId, "up")).rejects.toThrow(
      "Set a public order before moving this post"
    );
  });
});
