import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  insertPostMock,
  findPostByIdMock,
  slugExistsMock,
  syncPostTagsMock,
  getTagIdsForPostMock,
  updatePostByIdMock,
} = vi.hoisted(() => ({
  insertPostMock: vi.fn(),
  findPostByIdMock: vi.fn(),
  slugExistsMock: vi.fn(),
  syncPostTagsMock: vi.fn(),
  getTagIdsForPostMock: vi.fn(),
  updatePostByIdMock: vi.fn(),
}));

vi.mock("@/modules/posts/posts.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/posts/posts.repository")>();
  return {
    ...actual,
    insertPost: insertPostMock,
    findPostById: findPostByIdMock,
    slugExists: slugExistsMock,
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
    publicOrder: 0,
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

  it("creates drafts with publicOrder 0", async () => {
    await createDraft({}, userId);

    expect(insertPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        publicOrder: 0,
        status: "draft",
      })
    );
  });

  it("duplicates posts with publicOrder 0", async () => {
    findPostByIdMock.mockResolvedValue(makePost({ id: "source", publicOrder: 3, status: "published" }));

    const copy = await duplicatePost("source", userId);

    expect(insertPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        publicOrder: 0,
      })
    );
    expect(copy.publicOrder).toBe(0);
  });
});

describe("movePostPublicOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findPostByIdMock.mockReset();
    updatePostByIdMock.mockReset();
  });

  it("decrements publicOrder when moving up but not below 0", async () => {
    findPostByIdMock
      .mockResolvedValueOnce(makePost({ id: "a", status: "published", publicOrder: 2 }))
      .mockResolvedValueOnce(makePost({ id: "a", status: "published", publicOrder: 1 }));
    updatePostByIdMock.mockResolvedValue(makePost({ id: "a", status: "published", publicOrder: 1 }));

    await movePostPublicOrder("a", userId, "up");

    expect(updatePostByIdMock).toHaveBeenCalledWith("a", { publicOrder: 1, updatedBy: userId });
  });

  it("does not move below publicOrder 0", async () => {
    const first = makePost({ id: "a", status: "published", publicOrder: 0 });
    findPostByIdMock.mockResolvedValue(first);

    const result = await movePostPublicOrder("a", userId, "up");

    expect(updatePostByIdMock).not.toHaveBeenCalled();
    expect(result).toEqual(first);
  });

  it("increments publicOrder when moving down", async () => {
    findPostByIdMock
      .mockResolvedValueOnce(makePost({ id: "a", status: "published", publicOrder: 1 }))
      .mockResolvedValueOnce(makePost({ id: "a", status: "published", publicOrder: 2 }));
    updatePostByIdMock.mockResolvedValue(makePost({ id: "a", status: "published", publicOrder: 2 }));

    await movePostPublicOrder("a", userId, "down");

    expect(updatePostByIdMock).toHaveBeenCalledWith("a", { publicOrder: 2, updatedBy: userId });
  });
});
