import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createDraftMock,
  updateDraftMock,
  publishPostMock,
  getByIdMock,
  requireAdminSessionMock,
} = vi.hoisted(() => ({
  createDraftMock: vi.fn(),
  updateDraftMock: vi.fn(),
  publishPostMock: vi.fn(),
  getByIdMock: vi.fn(),
  requireAdminSessionMock: vi.fn(),
}));

vi.mock("@/modules/posts/posts.service", () => ({
  createDraft: createDraftMock,
  updateDraft: updateDraftMock,
  publishPost: publishPostMock,
  getById: getByIdMock,
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/admin/revalidate-public", () => ({
  revalidatePublicPaths: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { createDraftAction, publishPostAction, updatePostAction } from "@/modules/posts/admin-posts.actions";

const userId = "admin-user-id";
const postId = "post-123";

function makePost(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: postId,
    title: "Saved title",
    slug: "saved-title",
    excerpt: "Saved excerpt",
    contentMarkdown: "Saved body",
    contentHtmlCache: null,
    coverAssetId: "asset-cover",
    ogAssetId: "asset-og",
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

function editorForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("title", "Editor title");
  formData.set("slug", "editor-title");
  formData.set("excerpt", "Editor excerpt");
  formData.set("contentMarkdown", "# Editor content");
  formData.set("createRevision", "true");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

describe("admin post actions publishing flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: userId } });
    getByIdMock.mockResolvedValue(makePost());
    updateDraftMock.mockImplementation(async (_id, input) =>
      makePost({
        title: input.title ?? "Saved title",
        slug: input.slug ?? "saved-title",
        excerpt: input.excerpt ?? "Saved excerpt",
        contentMarkdown: input.contentMarkdown ?? "Saved body",
        coverAssetId: "asset-cover",
        ogAssetId: "asset-og",
      })
    );
    publishPostMock.mockImplementation(async () => makePost({ status: "published", publishedAt: new Date() }));
    createDraftMock.mockResolvedValue(makePost({ id: "new-post-id", title: "Untitled", slug: "untitled", contentMarkdown: "" }));
  });

  it("createDraftAction creates one draft per explicit call", async () => {
    await createDraftAction();
    expect(createDraftMock).toHaveBeenCalledTimes(1);
    expect(createDraftMock).toHaveBeenCalledWith({}, userId);
  });

  it("updatePostAction persists submitted editor fields", async () => {
    const result = await updatePostAction(postId, { ok: true }, editorForm({ intent: "save" }));

    expect(result.ok).toBe(true);
    expect(result.message).toBe("Draft saved");
    expect(updateDraftMock).toHaveBeenCalledTimes(1);
    expect(updateDraftMock).toHaveBeenCalledWith(
      postId,
      expect.objectContaining({
        title: "Editor title",
        slug: "editor-title",
        excerpt: "Editor excerpt",
        contentMarkdown: "# Editor content",
      }),
      userId
    );
    expect(publishPostMock).not.toHaveBeenCalled();
  });

  it("updatePostAction returns a published save message without changing status", async () => {
    getByIdMock.mockResolvedValue(makePost({ status: "published", publishedAt: new Date() }));
    updateDraftMock.mockResolvedValue(makePost({ status: "published", publishedAt: new Date() }));

    const result = await updatePostAction(postId, { ok: true }, editorForm({ intent: "save" }));

    expect(result.ok).toBe(true);
    expect(result.message).toBe("Published post updated");
    expect(publishPostMock).not.toHaveBeenCalled();
  });

  it("updatePostAction returns a scheduled save message", async () => {
    const scheduledAt = new Date("2030-01-01T12:00:00.000Z");
    getByIdMock.mockResolvedValue(makePost({ status: "scheduled", scheduledAt }));
    updateDraftMock.mockResolvedValue(makePost({ status: "scheduled", scheduledAt }));

    const result = await updatePostAction(postId, { ok: true }, editorForm({ intent: "save" }));

    expect(result.ok).toBe(true);
    expect(result.message).toBe("Scheduled post updated");
  });

  it("updatePostAction returns an unpublished save message", async () => {
    getByIdMock.mockResolvedValue(makePost({ status: "unpublished", unpublishedAt: new Date() }));
    updateDraftMock.mockResolvedValue(makePost({ status: "unpublished", unpublishedAt: new Date() }));

    const result = await updatePostAction(postId, { ok: true }, editorForm({ intent: "save" }));

    expect(result.ok).toBe(true);
    expect(result.message).toBe("Post updated");
  });

  it("save and publish updates the same post then publishes it", async () => {
    const result = await updatePostAction(postId, { ok: true }, editorForm({ intent: "publish" }));

    expect(result.ok).toBe(true);
    expect(updateDraftMock).toHaveBeenCalledTimes(1);
    expect(publishPostMock).toHaveBeenCalledTimes(1);
    expect(publishPostMock).toHaveBeenCalledWith(postId, userId, {});
    expect(createDraftMock).not.toHaveBeenCalled();
  });

  it("publishPostAction publishes the existing post without creating a new one", async () => {
    const result = await publishPostAction(postId);

    expect(result.ok).toBe(true);
    expect(publishPostMock).toHaveBeenCalledWith(postId, userId, {});
    expect(updateDraftMock).not.toHaveBeenCalled();
    expect(createDraftMock).not.toHaveBeenCalled();
  });

  it("publishPostAction refuses empty posts via service validation", async () => {
    publishPostMock.mockRejectedValueOnce(new Error("Publishing requires non-empty Markdown content"));

    const result = await publishPostAction(postId);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/content/i);
  });

  it("updatePostAction returns an error when post id is missing", async () => {
    const result = await updatePostAction("", { ok: true }, editorForm());
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/post id/i);
    expect(updateDraftMock).not.toHaveBeenCalled();
  });
});
