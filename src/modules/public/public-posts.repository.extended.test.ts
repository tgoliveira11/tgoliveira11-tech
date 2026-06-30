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

const sampleCategory = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  name: "Engineering",
  slug: "engineering",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleTag = {
  id: "880e8400-e29b-41d4-a716-446655440003",
  name: "News",
  slug: "news",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const samplePost = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "hello-world",
  title: "Hello",
  excerpt: "Excerpt",
  contentMarkdown: "Body",
  categoryId: sampleCategory.id,
  coverAssetId: null,
  status: "published",
  publishedAt: new Date("2024-01-01"),
} as const;

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock("@/db/get-db", () => ({
  db: {
    select: selectMock,
  },
}));

import {
  listPublishedPostBundlesByCategorySlug,
  listPublishedPostBundlesByTagSlug,
} from "./public-posts.repository";

describe("public posts repository extended", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when category slug is missing", async () => {
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([]),
    }));
    await expect(listPublishedPostBundlesByCategorySlug("missing")).resolves.toBeNull();
  });

  it("returns category posts when slug exists", async () => {
    selectMock
      .mockImplementationOnce(() => ({
        from: () => drizzleResult([sampleCategory]),
      }))
      .mockImplementationOnce(() => ({
        from: () => drizzleResult([samplePost]),
      }))
      .mockImplementationOnce(() => drizzleResult([]))
      .mockImplementationOnce(() => drizzleResult([]))
      .mockImplementationOnce(() => drizzleResult([]));

    const result = await listPublishedPostBundlesByCategorySlug("engineering");
    expect(result?.category.slug).toBe("engineering");
    expect(result?.posts).toHaveLength(1);
  });

  it("returns null when tag slug is missing", async () => {
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([]),
    }));
    await expect(listPublishedPostBundlesByTagSlug("missing")).resolves.toBeNull();
  });

  it("returns tag posts when slug exists", async () => {
    selectMock
      .mockImplementationOnce(() => ({
        from: () => drizzleResult([sampleTag]),
      }))
      .mockImplementationOnce(() => ({
        from: () => ({
          innerJoin: () => drizzleResult([{ post: samplePost }]),
        }),
      }))
      .mockImplementationOnce(() => drizzleResult([]))
      .mockImplementationOnce(() => drizzleResult([]))
      .mockImplementationOnce(() => drizzleResult([]));

    const result = await listPublishedPostBundlesByTagSlug("news");
    expect(result?.tag.slug).toBe("news");
    expect(result?.posts).toHaveLength(1);
  });
});
