import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  searchTagsMock,
  findOrCreateTagMock,
  searchCategoriesMock,
  findOrCreateCategoryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  searchTagsMock: vi.fn(),
  findOrCreateTagMock: vi.fn(),
  searchCategoriesMock: vi.fn(),
  findOrCreateCategoryMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/taxonomy/taxonomy.service", () => ({
  searchTags: searchTagsMock,
  findOrCreateTag: findOrCreateTagMock,
  searchCategories: searchCategoriesMock,
  findOrCreateCategory: findOrCreateCategoryMock,
}));

import {
  createOrFindCategoryAction,
  createOrFindTagAction,
  searchCategoriesAction,
  searchTagsAction,
} from "./admin-taxonomy.actions";

describe("admin-taxonomy actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" } });
    searchTagsMock.mockResolvedValue([{ id: "tag-1", name: "News", slug: "news" }]);
    findOrCreateTagMock.mockResolvedValue({
      item: { id: "tag-1", name: "News", slug: "news" },
      created: true,
    });
    searchCategoriesMock.mockResolvedValue([
      { id: "category-1", name: "Engineering", slug: "engineering", description: null },
    ]);
    findOrCreateCategoryMock.mockResolvedValue({
      item: { id: "category-1", name: "Engineering", slug: "engineering", description: null },
      created: false,
    });
  });

  it("searches tags for admin", async () => {
    const result = await searchTagsAction("new");
    expect(result).toEqual({
      ok: true,
      data: { tags: [{ id: "tag-1", name: "News", slug: "news" }] },
    });
  });

  it("creates or finds tag", async () => {
    const result = await createOrFindTagAction("News");
    expect(result).toEqual({
      ok: true,
      data: {
        tag: { id: "tag-1", name: "News", slug: "news" },
        created: true,
      },
    });
  });

  it("searches categories for admin", async () => {
    const result = await searchCategoriesAction("eng");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.categories).toHaveLength(1);
    }
  });

  it("creates or finds category", async () => {
    const result = await createOrFindCategoryAction("Engineering");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.created).toBe(false);
    }
  });

  it("returns error when admin session is missing", async () => {
    requireAdminSessionMock.mockRejectedValue(new Error("Forbidden"));
    const result = await searchTagsAction("new");
    expect(result).toEqual({ ok: false, error: "Forbidden" });
  });

  it("maps AppError and unknown failures", async () => {
    const { AppError } = await import("@/lib/errors");
    searchCategoriesMock.mockRejectedValue(new AppError("Invalid category"));
    await expect(searchCategoriesAction("eng")).resolves.toEqual({
      ok: false,
      error: "Invalid category",
    });

    findOrCreateTagMock.mockRejectedValue("broken");
    await expect(createOrFindTagAction("News")).resolves.toEqual({
      ok: false,
      error: "Something went wrong",
    });
  });
});
