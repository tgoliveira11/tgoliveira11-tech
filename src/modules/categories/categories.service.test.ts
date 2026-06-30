import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  countCategoryUsageMock,
  deleteCategoryByIdMock,
  findCategoryByNameCaseInsensitiveMock,
  findCategoryBySlugMock,
  insertCategoryMock,
  findCategoryByIdMock,
  updateCategoryByIdMock,
  listCategoriesMock,
  listAdminCategoriesMock,
} = vi.hoisted(() => ({
  countCategoryUsageMock: vi.fn(),
  deleteCategoryByIdMock: vi.fn(),
  findCategoryByNameCaseInsensitiveMock: vi.fn(),
  findCategoryBySlugMock: vi.fn(),
  insertCategoryMock: vi.fn(),
  findCategoryByIdMock: vi.fn(),
  updateCategoryByIdMock: vi.fn(),
  listCategoriesMock: vi.fn(),
  listAdminCategoriesMock: vi.fn(),
}));

vi.mock("./categories.repository", () => ({
  countCategoryUsage: countCategoryUsageMock,
  deleteCategoryById: deleteCategoryByIdMock,
  findCategoryByNameCaseInsensitive: findCategoryByNameCaseInsensitiveMock,
  findCategoryBySlug: findCategoryBySlugMock,
  insertCategory: insertCategoryMock,
  listCategories: listCategoriesMock,
  listAdminCategories: listAdminCategoriesMock,
  updateCategoryById: updateCategoryByIdMock,
  findCategoryById: findCategoryByIdMock,
}));

import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  createCategory,
  deleteCategory,
  getCategoryBySlug,
  getCategoryUsageCount,
  listAdminCategories,
  listCategories,
  updateCategory,
} from "./categories.service";

describe("categories service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findCategoryByNameCaseInsensitiveMock.mockResolvedValue(undefined);
    findCategoryBySlugMock.mockResolvedValue(undefined);
    insertCategoryMock.mockResolvedValue({
      id: "category-1",
      name: "Engineering",
      slug: "engineering",
      description: null,
    });
  });

  it("rejects duplicate category names", async () => {
    findCategoryByNameCaseInsensitiveMock.mockResolvedValue({
      id: "existing",
      name: "Engineering",
      slug: "engineering",
      description: null,
    });

    await expect(createCategory({ name: "Engineering" })).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks deleting categories used by posts", async () => {
    countCategoryUsageMock.mockResolvedValue(1);

    await expect(deleteCategory("category-1")).rejects.toThrow(/used by posts/i);
    expect(deleteCategoryByIdMock).not.toHaveBeenCalled();
  });

  it("rejects invalid slug on create", async () => {
    await expect(createCategory({ name: "Engineering", slug: "!!!" })).rejects.toThrow(
      /Invalid category slug/
    );
  });

  it("rejects duplicate slug on create", async () => {
    findCategoryBySlugMock.mockResolvedValue({
      id: "existing",
      name: "Engineering",
      slug: "engineering",
      description: null,
    });

    await expect(
      createCategory({ name: "Eng", slug: "engineering" })
    ).rejects.toThrow(/slug already exists/i);
  });

  it("creates category with description", async () => {
    await createCategory({ name: "Engineering", description: "Tech posts" });
    expect(insertCategoryMock).toHaveBeenCalledWith({
      name: "Engineering",
      slug: "engineering",
      description: "Tech posts",
    });
  });

  it("updates category", async () => {
    findCategoryByIdMock.mockResolvedValue({
      id: "category-1",
      name: "Engineering",
      slug: "engineering",
      description: null,
    });
    updateCategoryByIdMock.mockResolvedValue({
      id: "category-1",
      name: "Engineering",
      slug: "eng",
      description: "Updated",
    });

    const updated = await updateCategory("category-1", {
      name: "Engineering",
      slug: "eng",
      description: "Updated",
    });
    expect(updated.slug).toBe("eng");
  });

  it("rejects update when category is missing", async () => {
    findCategoryByIdMock.mockResolvedValue(undefined);
    await expect(updateCategory("missing", { name: "X" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("gets category by slug", async () => {
    findCategoryBySlugMock.mockResolvedValue({
      id: "category-1",
      name: "Engineering",
      slug: "engineering",
      description: null,
    });
    await expect(getCategoryBySlug("engineering")).resolves.toMatchObject({ slug: "engineering" });
  });

  it("lists categories and admin categories", async () => {
    listCategoriesMock.mockResolvedValue([]);
    listAdminCategoriesMock.mockResolvedValue([]);
    await expect(listCategories()).resolves.toEqual([]);
    await expect(listAdminCategories()).resolves.toEqual([]);
  });

  it("returns usage count and deletes unused category", async () => {
    countCategoryUsageMock.mockResolvedValue(2);
    await expect(getCategoryUsageCount("category-1")).resolves.toBe(2);

    countCategoryUsageMock.mockResolvedValue(0);
    deleteCategoryByIdMock.mockResolvedValue(true);
    await deleteCategory("category-1");
    expect(deleteCategoryByIdMock).toHaveBeenCalled();
  });

  it("throws when deleting missing category", async () => {
    countCategoryUsageMock.mockResolvedValue(0);
    deleteCategoryByIdMock.mockResolvedValue(false);
    await expect(deleteCategory("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
