import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getNextPublicOrderMock,
  insertPostMock,
  findPostByIdMock,
  slugExistsMock,
  syncPostTagsMock,
  getTagIdsForPostMock,
} = vi.hoisted(() => ({
  getNextPublicOrderMock: vi.fn(),
  insertPostMock: vi.fn(),
  findPostByIdMock: vi.fn(),
  slugExistsMock: vi.fn(),
  syncPostTagsMock: vi.fn(),
  getTagIdsForPostMock: vi.fn(),
}));

vi.mock("@/modules/posts/posts.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/posts/posts.repository")>();
  return {
    ...actual,
    getNextPublicOrder: getNextPublicOrderMock,
    insertPost: insertPostMock,
    findPostById: findPostByIdMock,
    slugExists: slugExistsMock,
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

import { createDraft, duplicatePost } from "@/modules/posts/posts.service";

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
    publicOrder: 1,
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

describe("default publicOrder allocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    slugExistsMock.mockResolvedValue(false);
    getTagIdsForPostMock.mockResolvedValue([]);
    syncPostTagsMock.mockResolvedValue(undefined);
  });

  it("assigns publicOrder 1 to the first new post", async () => {
    getNextPublicOrderMock.mockResolvedValue(1);
    insertPostMock.mockImplementation(async (values) => makePost(values));

    await createDraft({}, userId);

    expect(getNextPublicOrderMock).toHaveBeenCalledTimes(1);
    expect(insertPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        publicOrder: 1,
        status: "draft",
      })
    );
  });

  it("assigns the next publicOrder to subsequent drafts", async () => {
    getNextPublicOrderMock.mockResolvedValue(2);
    insertPostMock.mockImplementation(async (values) => makePost({ ...values, publicOrder: 2 }));

    await createDraft({ title: "Second" }, userId);

    expect(insertPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        publicOrder: 2,
      })
    );
  });

  it("assigns a new publicOrder when duplicating, not the source value", async () => {
    findPostByIdMock.mockResolvedValue(makePost({ id: "source", publicOrder: 3 }));
    getNextPublicOrderMock.mockResolvedValue(4);
    insertPostMock.mockImplementation(async (values) =>
      makePost({ ...values, id: "copy-1", title: "Untitled (Copy)" })
    );

    const copy = await duplicatePost("source", userId);

    expect(getNextPublicOrderMock).toHaveBeenCalledTimes(1);
    expect(insertPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        publicOrder: 4,
      })
    );
    expect(copy.publicOrder).toBe(4);
  });
});
