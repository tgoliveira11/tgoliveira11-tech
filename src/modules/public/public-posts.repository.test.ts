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

const postId = "550e8400-e29b-41d4-a716-446655440000";
const categoryId = "660e8400-e29b-41d4-a716-446655440001";
const assetId = "770e8400-e29b-41d4-a716-446655440002";

const samplePost = {
  id: postId,
  slug: "hello-world",
  title: "Hello",
  excerpt: "Excerpt",
  contentMarkdown: "Body",
  categoryId,
  coverAssetId: assetId,
  status: "published",
  publishedAt: new Date("2024-01-01"),
} as const;

const sampleCategory = {
  id: categoryId,
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

const sampleAsset = {
  id: assetId,
  postId,
  storageProvider: "local",
  storageKey: "posts/hello/photo.jpg",
  publicUrl: "/uploads/photo.jpg",
  originalFilename: "photo.jpg",
  safeFilename: "photo.jpg",
  mimeType: "image/jpeg",
  fileSizeBytes: 100,
  altText: null,
  caption: null,
  hash: null,
  createdBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock("@/db/get-db", () => ({
  db: {
    select: selectMock,
  },
}));

import {
  countPublishedPosts,
  findAssetById,
  getPublishedPostBundleBySlug,
  listPopularTags,
  listPublishedPostBundles,
  searchPublishedPostBundles,
} from "./public-posts.repository";

describe("public posts repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([samplePost]),
    }));
  });

  it("counts published posts with optional exclusion", async () => {
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([{ count: 5 }]),
    }));
    await expect(countPublishedPosts()).resolves.toBe(5);
    await expect(countPublishedPosts({ excludePostId: postId })).resolves.toBe(5);
  });

  it("returns empty search results for blank queries", async () => {
    await expect(searchPublishedPostBundles("   ")).resolves.toEqual([]);
  });

  it("hydrates published post bundles", async () => {
    selectMock
      .mockImplementationOnce(() => ({
        from: () => drizzleResult([samplePost]),
      }))
      .mockImplementationOnce(() => ({
        from: () => drizzleResult([sampleCategory]),
      }))
      .mockImplementationOnce(() => ({
        from: () => ({
          innerJoin: () => drizzleResult([{ tag: sampleTag }]),
        }),
      }))
      .mockImplementationOnce(() => ({
        from: () => drizzleResult([sampleAsset]),
      }));

    const bundles = await listPublishedPostBundles({ limit: 1 });
    expect(bundles[0]?.post.id).toBe(postId);
    expect(bundles[0]?.category?.slug).toBe("engineering");
    expect(bundles[0]?.tags).toEqual([sampleTag]);
    expect(bundles[0]?.coverAsset?.id).toBe(assetId);
  });

  it("returns null when slug is not found", async () => {
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([]),
    }));
    await expect(getPublishedPostBundleBySlug("missing")).resolves.toBeNull();
  });

  it("slices popular tags to the requested limit", async () => {
    const popularTags = Array.from({ length: 5 }, (_, index) => ({
      ...sampleTag,
      id: `${index}`,
      postCount: 10 - index,
    }));

    selectMock.mockImplementation(() => ({
      from: () => ({
        innerJoin: () => ({
          innerJoin: () => ({
            where: () => ({
              groupBy: () => ({
                orderBy: () => Promise.resolve(popularTags),
              }),
            }),
          }),
        }),
      }),
    }));

    await expect(listPopularTags(3)).resolves.toHaveLength(3);
  });

  it("finds assets by id", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([sampleAsset]),
    }));
    await expect(findAssetById(assetId)).resolves.toEqual(sampleAsset);

    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([]),
    }));
    await expect(findAssetById("missing")).resolves.toBeNull();
  });
});
