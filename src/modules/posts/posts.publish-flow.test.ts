import { beforeEach, describe, expect, it, vi } from "vitest";

const { findPostByIdMock, updatePostByIdMock, insertPostMock, insertPostRevisionMock } = vi.hoisted(() => ({
  findPostByIdMock: vi.fn(),
  updatePostByIdMock: vi.fn(),
  insertPostMock: vi.fn(),
  insertPostRevisionMock: vi.fn(),
}));

vi.mock("@/modules/posts/posts.repository", () => ({
  findPostById: findPostByIdMock,
  updatePostById: updatePostByIdMock,
  insertPost: insertPostMock,
  insertPostRevision: insertPostRevisionMock,
  slugExists: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/modules/posts/post-tags.repository", () => ({
  syncPostTags: vi.fn(),
  getTagIdsForPost: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/modules/markdown/markdown-renderer", () => ({
  renderMarkdownToHtml: vi.fn().mockResolvedValue("<p>html</p>"),
}));

vi.mock("@/modules/redirects/redirects.service", () => ({
  createRedirect: vi.fn(),
}));

import { publishPost, updateDraft } from "@/modules/posts/posts.service";

const postId = "post-123";
const userId = "user-123";

function makePost(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: postId,
    title: "Title",
    slug: "title",
    excerpt: null,
    contentMarkdown: "Body",
    contentHtmlCache: null,
    coverAssetId: "cover-1",
    ogAssetId: "og-1",
    status: "draft",
    featured: false,
    pinned: false,
    pinnedPriority: 0,
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

describe("posts service publish flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findPostByIdMock.mockResolvedValue(makePost());
    updatePostByIdMock.mockImplementation(async (id, values) => ({ ...makePost(), ...values, id }));
    insertPostRevisionMock.mockResolvedValue({});
  });

  it("publishPost updates the existing row and does not insert a new post", async () => {
    await publishPost(postId, userId);

    expect(insertPostMock).not.toHaveBeenCalled();
    expect(updatePostByIdMock).toHaveBeenCalledWith(
      postId,
      expect.objectContaining({
        status: "published",
      })
    );
  });

  it("updateDraft preserves cover and og asset ids when they are omitted", async () => {
    await updateDraft(postId, { title: "Updated title", contentMarkdown: "Updated body" }, userId);

    expect(updatePostByIdMock).toHaveBeenCalledWith(
      postId,
      expect.objectContaining({
        title: "Updated title",
        contentMarkdown: "Updated body",
      })
    );
    expect(updatePostByIdMock).toHaveBeenCalledWith(
      postId,
      expect.not.objectContaining({
        coverAssetId: null,
        ogAssetId: null,
      })
    );
  });

  it("publishPost rejects empty markdown", async () => {
    findPostByIdMock.mockResolvedValue(makePost({ contentMarkdown: "   " }));

    await expect(publishPost(postId, userId)).rejects.toThrow(/content/i);
    expect(updatePostByIdMock).not.toHaveBeenCalled();
  });
});
