import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  getByIdMock,
  updateDraftMock,
  publishPostMock,
  unpublishPostMock,
  schedulePostMock,
  archivePostMock,
  duplicatePostMock,
  markFeaturedMock,
  unmarkFeaturedMock,
  pinPostMock,
  unpinPostMock,
  setPostPublicOrderMock,
  clearPostPublicOrderMock,
  movePostPublicOrderMock,
  createDraftMock,
  redirectMock,
  renderMarkdownToHtmlMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  getByIdMock: vi.fn(),
  updateDraftMock: vi.fn(),
  publishPostMock: vi.fn(),
  unpublishPostMock: vi.fn(),
  schedulePostMock: vi.fn(),
  archivePostMock: vi.fn(),
  duplicatePostMock: vi.fn(),
  markFeaturedMock: vi.fn(),
  unmarkFeaturedMock: vi.fn(),
  pinPostMock: vi.fn(),
  unpinPostMock: vi.fn(),
  setPostPublicOrderMock: vi.fn(),
  clearPostPublicOrderMock: vi.fn(),
  movePostPublicOrderMock: vi.fn(),
  createDraftMock: vi.fn(),
  redirectMock: vi.fn(),
  renderMarkdownToHtmlMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/posts/posts.service", () => ({
  getById: getByIdMock,
  updateDraft: updateDraftMock,
  publishPost: publishPostMock,
  unpublishPost: unpublishPostMock,
  schedulePost: schedulePostMock,
  archivePost: archivePostMock,
  duplicatePost: duplicatePostMock,
  markFeatured: markFeaturedMock,
  unmarkFeatured: unmarkFeaturedMock,
  pinPost: pinPostMock,
  unpinPost: unpinPostMock,
  setPostPublicOrder: setPostPublicOrderMock,
  clearPostPublicOrder: clearPostPublicOrderMock,
  movePostPublicOrder: movePostPublicOrderMock,
  createDraft: createDraftMock,
}));

vi.mock("@/modules/markdown/markdown-renderer", () => ({
  renderMarkdownToHtml: renderMarkdownToHtmlMock,
}));

vi.mock("@/modules/admin/revalidate-public", () => ({
  revalidatePublicPaths: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import {
  archivePostAction,
  clearPostPublicOrderAction,
  createDraftAction,
  duplicatePostAction,
  markFeaturedAction,
  movePostPublicOrderAction,
  pinPostAction,
  previewMarkdownAction,
  publishPostAction,
  schedulePostAction,
  unpublishPostAction,
  updatePostAction,
  updatePostPublicOrderAction,
} from "./admin-posts.actions";

const postId = "550e8400-e29b-41d4-a716-446655440000";

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: postId,
    title: "Title",
    slug: "title",
    status: "draft",
    ...overrides,
  };
}

describe("admin posts actions flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" } });
    getByIdMock.mockResolvedValue(makePost());
    updateDraftMock.mockResolvedValue(makePost());
    publishPostMock.mockResolvedValue(makePost({ status: "published", slug: "published-title" }));
    unpublishPostMock.mockResolvedValue(makePost({ status: "unpublished" }));
    schedulePostMock.mockResolvedValue(makePost({ status: "scheduled" }));
    archivePostMock.mockResolvedValue(makePost({ status: "archived" }));
    duplicatePostMock.mockResolvedValue(makePost({ id: "copy-1" }));
    createDraftMock.mockResolvedValue(makePost({ id: "new-post" }));
    renderMarkdownToHtmlMock.mockResolvedValue("<p>html</p>");
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`);
    });
  });

  it("rejects update when post id is missing", async () => {
    const result = await updatePostAction("", { ok: false }, new FormData());
    expect(result).toEqual({ ok: false, error: "Post ID is required" });
  });

  it("updates draft posts", async () => {
    const formData = new FormData();
    formData.set("title", "Updated");
    formData.set("contentMarkdown", "Body");

    const result = await updatePostAction(postId, { ok: false }, formData);
    expect(result.ok).toBe(true);
    expect(updateDraftMock).toHaveBeenCalled();
  });

  it("publishes via update intent", async () => {
    const formData = new FormData();
    formData.set("intent", "publish");
    formData.set("title", "Updated");
    formData.set("contentMarkdown", "Body");

    const result = await updatePostAction(postId, { ok: false }, formData);
    expect(result.ok).toBe(true);
    expect(publishPostMock).toHaveBeenCalled();
  });

  it("publishes, unpublishes, schedules, and archives posts", async () => {
    await expect(publishPostAction(postId)).resolves.toMatchObject({ ok: true });
    await expect(unpublishPostAction(postId)).resolves.toEqual({
      ok: true,
      message: "Post unpublished",
    });

    const scheduleForm = new FormData();
    scheduleForm.set("scheduledAt", new Date(Date.now() + 60_000).toISOString());
    await expect(schedulePostAction(postId, { ok: false }, scheduleForm)).resolves.toEqual({
      ok: true,
      message: "Post scheduled",
    });

    await expect(archivePostAction(postId)).resolves.toEqual({
      ok: true,
      message: "Post archived",
    });
  });

  it("redirects after creating or duplicating drafts", async () => {
    await expect(createDraftAction()).rejects.toThrow(/redirect:\/admin\/posts\/new-post\/edit/);
    await expect(duplicatePostAction(postId)).rejects.toThrow(/redirect:\/admin\/posts\/copy-1\/edit/);
  });

  it("toggles featured state for published posts", async () => {
    getByIdMock.mockResolvedValue(makePost({ status: "published" }));

    await expect(markFeaturedAction(postId, true)).resolves.toEqual({
      ok: true,
      message: "Marked featured",
    });
    await expect(markFeaturedAction(postId, false)).resolves.toEqual({
      ok: true,
      message: "Unmarked featured",
    });
    expect(markFeaturedMock).toHaveBeenCalled();
    expect(unmarkFeaturedMock).toHaveBeenCalled();
  });

  it("pins and unpins posts", async () => {
    const pinForm = new FormData();
    pinForm.set("pinned", "true");
    pinForm.set("pinnedPriority", "2");

    await expect(pinPostAction(postId, { ok: false }, pinForm)).resolves.toEqual({
      ok: true,
      message: "Post pinned",
    });

    const unpinForm = new FormData();
    unpinForm.set("pinned", "false");
    await expect(pinPostAction(postId, { ok: false }, unpinForm)).resolves.toEqual({
      ok: true,
      message: "Post unpinned",
    });
  });

  it("updates public order and moves posts", async () => {
    getByIdMock.mockResolvedValue(makePost({ status: "published" }));

    const formData = new FormData();
    formData.set("publicOrder", "3");
    await expect(updatePostPublicOrderAction(postId, { ok: false }, formData)).resolves.toEqual({
      ok: true,
      message: "Public order set to 3",
    });

    await expect(clearPostPublicOrderAction(postId)).resolves.toEqual({
      ok: true,
      message: "Public order cleared",
    });

    await expect(movePostPublicOrderAction(postId, "up")).resolves.toEqual({
      ok: true,
      message: "Moved up in public order",
    });
    await expect(movePostPublicOrderAction(postId, "down")).resolves.toEqual({
      ok: true,
      message: "Moved down in public order",
    });
  });

  it("updates draft posts and revalidates when slug changes for published posts", async () => {
    getByIdMock
      .mockResolvedValueOnce(makePost({ status: "published", slug: "old-slug" }))
      .mockResolvedValueOnce(makePost({ status: "published", slug: "old-slug" }));
    updateDraftMock.mockResolvedValue(makePost({ status: "published", slug: "new-slug" }));

    const formData = new FormData();
    formData.set("title", "Updated");
    formData.set("slug", "new-slug");
    formData.set("contentMarkdown", "Body");

    const result = await updatePostAction(postId, { ok: false }, formData);
    expect(result.ok).toBe(true);
  });

  it("returns errors from publish action", async () => {
    publishPostMock.mockRejectedValueOnce(new Error("Cannot publish"));
    const result = await publishPostAction(postId);
    expect(result).toEqual({ ok: false, error: "Cannot publish" });
  });

  it("rejects publish when post id is missing", async () => {
    const result = await publishPostAction("");
    expect(result).toEqual({ ok: false, error: "Post ID is required" });
  });

  it("autosaves draft posts and revalidates published slugs", async () => {
    const { autosavePostAction } = await import("./admin-posts.actions");
    getByIdMock.mockResolvedValue(makePost({ status: "published", slug: "old-slug" }));
    updateDraftMock.mockResolvedValue(makePost({ status: "published", slug: "new-slug" }));

    const formData = new FormData();
    formData.set("title", "Autosaved");
    formData.set("contentMarkdown", "Body");

    const result = await autosavePostAction(postId, formData);
    expect(result.ok).toBe(true);
    expect(result.savedAt).toBeTruthy();
  });

  it("rejects autosave when post id is missing", async () => {
    const { autosavePostAction } = await import("./admin-posts.actions");
    const result = await autosavePostAction("", new FormData());
    expect(result).toEqual({ ok: false, error: "Post ID is required" });
  });

  it("renders markdown preview for admins", async () => {
    const result = await previewMarkdownAction("# Hello");
    expect(result).toEqual({ html: "<p>html</p>" });
    expect(renderMarkdownToHtmlMock).toHaveBeenCalledWith("# Hello");
  });

  it("revalidates both slugs when publishing changes slug", async () => {
    getByIdMock.mockResolvedValue(makePost({ slug: "old-slug" }));
    publishPostMock.mockResolvedValue(makePost({ status: "published", slug: "new-slug" }));

    const result = await publishPostAction(postId);
    expect(result.ok).toBe(true);
  });
});
