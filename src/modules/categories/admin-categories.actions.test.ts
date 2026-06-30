import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  createCategoryMock,
  updateCategoryMock,
  deleteCategoryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  createCategoryMock: vi.fn(),
  updateCategoryMock: vi.fn(),
  deleteCategoryMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/categories/categories.service", () => ({
  createCategory: createCategoryMock,
  updateCategory: updateCategoryMock,
  deleteCategory: deleteCategoryMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "./admin-categories.actions";

describe("admin-categories actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" } });
    createCategoryMock.mockResolvedValue({
      id: "category-1",
      name: "Engineering",
      slug: "engineering",
      description: null,
    });
    updateCategoryMock.mockResolvedValue({
      id: "category-1",
      name: "Engineering",
      slug: "engineering",
      description: "Updated",
    });
    deleteCategoryMock.mockResolvedValue(undefined);
  });

  it("creates category with optional description", async () => {
    const formData = new FormData();
    formData.set("name", "Engineering");
    formData.set("description", "Tech posts");

    const result = await createCategoryAction({ ok: false }, formData);
    expect(result).toEqual({ ok: true, message: "Category created" });
    expect(createCategoryMock).toHaveBeenCalledWith({
      name: "Engineering",
      slug: undefined,
      description: "Tech posts",
    });
  });

  it("updates category and omits description when field is absent", async () => {
    const formData = new FormData();
    formData.set("name", "Engineering");

    const result = await updateCategoryAction("category-1", { ok: false }, formData);
    expect(result.ok).toBe(true);
    expect(updateCategoryMock).toHaveBeenCalledWith("category-1", {
      name: "Engineering",
      slug: undefined,
      description: undefined,
    });
  });

  it("deletes category", async () => {
    await expect(deleteCategoryAction("category-1")).resolves.toEqual({
      ok: true,
      message: "Category deleted",
    });
  });
});
