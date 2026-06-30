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
  countTagUsage,
  deleteTagById,
  findTagById,
  findTagByNameCaseInsensitive,
  findTagBySlug,
  insertTag,
  listAdminTags,
  listTags,
  searchTagsByName,
  updateTagById,
} from "./tags.repository";

const sampleTag = {
  id: "tag-1",
  name: "News",
  slug: "news",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("tags repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockImplementation(() => ({
      values: () => ({
        returning: () => Promise.resolve([sampleTag]),
      }),
    }));
    updateMock.mockImplementation(() => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([sampleTag]),
        }),
      }),
    }));
    deleteMock.mockImplementation(() => ({
      where: () => ({
        returning: () => Promise.resolve([{ id: "tag-1" }]),
      }),
    }));
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([sampleTag]),
    }));
  });

  it("inserts and updates tags", async () => {
    await expect(insertTag({ name: "News", slug: "news" })).resolves.toEqual(sampleTag);
    await expect(updateTagById("tag-1", { name: "Breaking" })).resolves.toEqual(sampleTag);
  });

  it("finds tags by id, slug, and case-insensitive name", async () => {
    await expect(findTagById("tag-1")).resolves.toEqual(sampleTag);
    await expect(findTagBySlug("news")).resolves.toEqual(sampleTag);
    await expect(findTagByNameCaseInsensitive("NEWS")).resolves.toEqual(sampleTag);
  });

  it("returns undefined when tag is not found", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([]),
    }));
    await expect(findTagById("missing")).resolves.toBeUndefined();
  });

  it("searches tags by name and skips blank queries", async () => {
    await expect(searchTagsByName("   ")).resolves.toEqual([]);
    await expect(searchTagsByName("new")).resolves.toEqual([sampleTag]);
  });

  it("lists tags and admin tag rows", async () => {
    await expect(listTags()).resolves.toEqual([sampleTag]);

    const adminRow = {
      ...sampleTag,
      totalPostCount: 2,
      publishedPostCount: 1,
    };
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        leftJoin: () => ({
          leftJoin: () => ({
            groupBy: () => ({
              orderBy: () => Promise.resolve([adminRow]),
            }),
          }),
        }),
      }),
    }));
    await expect(listAdminTags()).resolves.toEqual([
      { ...adminRow, totalPostCount: 2, publishedPostCount: 1 },
    ]);
  });

  it("counts usage and deletes tags", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([{ count: 3 }]),
    }));
    await expect(countTagUsage("tag-1")).resolves.toBe(3);

    await expect(deleteTagById("tag-1")).resolves.toBe(true);
    deleteMock.mockImplementationOnce(() => ({
      where: () => ({
        returning: () => Promise.resolve([]),
      }),
    }));
    await expect(deleteTagById("missing")).resolves.toBe(false);
  });
});
