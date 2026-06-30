import { beforeEach, describe, expect, it, vi } from "vitest";

function drizzleResult<T>(value: T) {
  const promise = Promise.resolve(value);
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return promise.then.bind(promise);
        }
        return () => drizzleResult(value);
      },
    }
  );
}

const { insertMock, selectMock, updateMock, deleteMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/db/get-db", () => ({
  db: {
    insert: insertMock,
    select: selectMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

import {
  countCategoryUsage,
  deleteCategoryById,
  findCategoryById,
  findCategoryByNameCaseInsensitive,
  findCategoryBySlug,
  insertCategory,
  listAdminCategories,
  listCategories,
  searchCategoriesByName,
  updateCategoryById,
} from "./categories.repository";

const sampleCategory = {
  id: "category-1",
  name: "Engineering",
  slug: "engineering",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("categories repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockImplementation(() => ({
      values: () => ({
        returning: () => Promise.resolve([sampleCategory]),
      }),
    }));
    updateMock.mockImplementation(() => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([sampleCategory]),
        }),
      }),
    }));
    deleteMock.mockImplementation(() => ({
      where: () => ({
        returning: () => Promise.resolve([{ id: "category-1" }]),
      }),
    }));
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([sampleCategory]),
    }));
  });

  it("inserts and updates categories", async () => {
    await expect(
      insertCategory({ name: "Engineering", slug: "engineering", description: null })
    ).resolves.toEqual(sampleCategory);
    await expect(updateCategoryById("category-1", { name: "Eng" })).resolves.toEqual(sampleCategory);
  });

  it("finds categories by id, slug, and name", async () => {
    await expect(findCategoryById("category-1")).resolves.toEqual(sampleCategory);
    await expect(findCategoryBySlug("engineering")).resolves.toEqual(sampleCategory);
    await expect(findCategoryByNameCaseInsensitive("ENGINEERING")).resolves.toEqual(sampleCategory);
  });

  it("searches categories and lists them", async () => {
    await expect(searchCategoriesByName("   ")).resolves.toEqual([]);
    await expect(searchCategoriesByName("eng")).resolves.toEqual([sampleCategory]);
    await expect(listCategories()).resolves.toEqual([sampleCategory]);
  });

  it("lists admin categories with counts", async () => {
    const adminRow = {
      ...sampleCategory,
      totalPostCount: 4,
      publishedPostCount: 2,
    };
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        leftJoin: () => ({
          groupBy: () => ({
            orderBy: () => Promise.resolve([adminRow]),
          }),
        }),
      }),
    }));
    await expect(listAdminCategories()).resolves.toEqual([
      { ...adminRow, totalPostCount: 4, publishedPostCount: 2 },
    ]);
  });

  it("counts usage and deletes categories", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([{ count: 2 }]),
    }));
    await expect(countCategoryUsage("category-1")).resolves.toBe(2);
    await expect(deleteCategoryById("category-1")).resolves.toBe(true);
  });
});
