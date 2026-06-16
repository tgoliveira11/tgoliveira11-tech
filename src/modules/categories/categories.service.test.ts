import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  countCategoryUsageMock,
  deleteCategoryByIdMock,
  findCategoryByNameCaseInsensitiveMock,
  findCategoryBySlugMock,
  insertCategoryMock,
} = vi.hoisted(() => ({
  countCategoryUsageMock: vi.fn(),
  deleteCategoryByIdMock: vi.fn(),
  findCategoryByNameCaseInsensitiveMock: vi.fn(),
  findCategoryBySlugMock: vi.fn(),
  insertCategoryMock: vi.fn(),
}));

vi.mock("./categories.repository", () => ({
  countCategoryUsage: countCategoryUsageMock,
  deleteCategoryById: deleteCategoryByIdMock,
  findCategoryByNameCaseInsensitive: findCategoryByNameCaseInsensitiveMock,
  findCategoryBySlug: findCategoryBySlugMock,
  insertCategory: insertCategoryMock,
  listCategories: vi.fn(),
  listAdminCategories: vi.fn(),
  updateCategoryById: vi.fn(),
  findCategoryById: vi.fn(),
}));

import { ConflictError } from "@/lib/errors";
import { createCategory, deleteCategory } from "./categories.service";

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
});
