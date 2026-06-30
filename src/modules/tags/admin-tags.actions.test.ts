import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminSessionMock, createTagMock, updateTagMock, deleteTagMock } = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  createTagMock: vi.fn(),
  updateTagMock: vi.fn(),
  deleteTagMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/tags/tags.service", () => ({
  createTag: createTagMock,
  updateTag: updateTagMock,
  deleteTag: deleteTagMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { AppError } from "@/lib/errors";
import { createTagAction, deleteTagAction, updateTagAction } from "./admin-tags.actions";

describe("admin-tags actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" } });
    createTagMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "news" });
    updateTagMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "news" });
    deleteTagMock.mockResolvedValue(undefined);
  });

  it("creates tag on valid form data", async () => {
    const formData = new FormData();
    formData.set("name", "News");
    formData.set("slug", "news");

    const result = await createTagAction({ ok: false }, formData);
    expect(result).toEqual({ ok: true, message: "Tag created" });
  });

  it("returns mapped AppError message on failure", async () => {
    createTagMock.mockRejectedValue(new AppError("Duplicate", 409));
    const formData = new FormData();
    formData.set("name", "News");

    const result = await createTagAction({ ok: false }, formData);
    expect(result).toEqual({ ok: false, error: "Duplicate" });
  });

  it("returns generic message for unknown errors", async () => {
    createTagMock.mockRejectedValue("boom");
    const formData = new FormData();
    formData.set("name", "News");

    const result = await createTagAction({ ok: false }, formData);
    expect(result).toEqual({ ok: false, error: "Something went wrong" });
  });

  it("updates and deletes tags", async () => {
    const formData = new FormData();
    formData.set("name", "News");

    await expect(updateTagAction("tag-1", { ok: false }, formData)).resolves.toEqual({
      ok: true,
      message: "Tag updated",
    });
    await expect(deleteTagAction("tag-1")).resolves.toEqual({
      ok: true,
      message: "Tag deleted",
    });
  });

  it("rejects unauthenticated actions", async () => {
    requireAdminSessionMock.mockRejectedValue(new Error("Forbidden"));
    const formData = new FormData();
    formData.set("name", "News");

    const result = await createTagAction({ ok: false }, formData);
    expect(result.ok).toBe(false);
  });
});
