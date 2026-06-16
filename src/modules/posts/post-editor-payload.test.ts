import { describe, expect, it, vi, beforeEach } from "vitest";
import { serializePostEditorPayload, shouldRunAutosave } from "@/modules/posts/post-editor-payload";

const {
  requireAdminSessionMock,
  getByIdMock,
  updateDraftMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  getByIdMock: vi.fn(),
  updateDraftMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/posts/posts.service", () => ({
  getById: getByIdMock,
  updateDraft: updateDraftMock,
}));

vi.mock("@/modules/admin/revalidate-public", () => ({
  revalidatePublicPaths: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { autosavePostAction } from "@/modules/posts/admin-posts.actions";

describe("post editor autosave payload helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serializePostEditorPayload excludes intent/createRevision and includes editor fields", () => {
    const formData = new FormData();
    formData.set("title", "T");
    formData.set("slug", "s");
    formData.set("excerpt", "E");
    formData.set("contentMarkdown", "Body");
    formData.set("intent", "save");
    formData.set("createRevision", "true");
    formData.set("tagIds", "11111111-1111-1111-1111-111111111111");
    formData.set("featured", "true");
    formData.set("pinned", "false");
    formData.set("pinnedPriority", "3");

    const payload = JSON.parse(serializePostEditorPayload(formData));
    const keys = payload.map((entry: [string, string]) => entry[0]);

    expect(keys).not.toContain("intent");
    expect(keys).not.toContain("createRevision");
    expect(keys).toContain("title");
    expect(keys).toContain("contentMarkdown");
  });

  it("shouldRunAutosave returns false when userEdited is false", () => {
    expect(
      shouldRunAutosave({
        userEdited: false,
        paused: false,
        payload: "x",
        lastSavedPayload: null,
      })
    ).toBe(false);
  });

  it("shouldRunAutosave dedupes unchanged payloads", () => {
    expect(
      shouldRunAutosave({
        userEdited: true,
        paused: false,
        payload: "x",
        lastSavedPayload: "x",
      })
    ).toBe(false);
  });

  it("shouldRunAutosave returns true when userEdited and payload changed", () => {
    expect(
      shouldRunAutosave({
        userEdited: true,
        paused: false,
        payload: "x",
        lastSavedPayload: "y",
      })
    ).toBe(true);
  });
});

describe("autosavePostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" } });
    getByIdMock.mockResolvedValue({
      id: "post-1",
      status: "draft",
      slug: "my-post",
    });
    updateDraftMock.mockResolvedValue({
      id: "post-1",
      status: "draft",
      slug: "my-post",
    });
  });

  it("does not create revisions and does not publish", async () => {
    const formData = new FormData();
    formData.set("title", "New title");
    formData.set("slug", "new-title");
    formData.set("contentMarkdown", "Body");
    formData.set("createRevision", "true");

    const result = await autosavePostAction("post-1", formData);

    expect(result.ok).toBe(true);
    expect(updateDraftMock).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        createRevision: false,
        title: "New title",
        slug: "new-title",
        contentMarkdown: "Body",
      }),
      "admin-1"
    );
  });

  it("returns ok:false when updateDraft throws", async () => {
    updateDraftMock.mockRejectedValueOnce(new Error("Boom"));

    const formData = new FormData();
    formData.set("title", "New title");
    formData.set("contentMarkdown", "Body");
    formData.set("createRevision", "true");

    const result = await autosavePostAction("post-1", formData);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Boom");
  });
});

