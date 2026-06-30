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

const { insertMock, selectMock, updateMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@/db/get-db", () => ({
  db: {
    insert: insertMock,
    select: selectMock,
    update: updateMock,
  },
}));

import {
  countAllPosts,
  countPostsByStatus,
  findCategoryById,
  findPostById,
  findPostBySlug,
  findPublishedPostBySlug,
  getMaxPublicOrder,
  getNextPublicOrder,
  insertPost,
  insertPostRevision,
  listCategoriesByIds,
  listPublishedPosts,
  listPublishedPostsWithPublicOrder,
  publishedPostFilter,
  slugExists,
  updatePostById,
} from "./posts.repository";

const postId = "550e8400-e29b-41d4-a716-446655440000";

const samplePost = {
  id: postId,
  title: "Title",
  slug: "title",
  excerpt: null,
  contentMarkdown: "Body",
  contentHtmlCache: null,
  coverAssetId: null,
  ogAssetId: null,
  status: "draft",
  featured: false,
  pinned: false,
  pinnedPriority: 0,
  publicOrder: null,
  categoryId: null,
  publishedAt: null,
  scheduledAt: null,
  unpublishedAt: null,
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
  ogTitle: null,
  ogDescription: null,
  readingTimeMinutes: null,
  createdBy: "user-1",
  updatedBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("posts repository core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockImplementation(() => ({
      values: () => ({
        returning: () => Promise.resolve([samplePost]),
      }),
    }));
    updateMock.mockImplementation(() => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([samplePost]),
        }),
      }),
    }));
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([samplePost]),
    }));
  });

  it("inserts and updates posts", async () => {
    await expect(insertPost(samplePost)).resolves.toEqual(samplePost);
    await expect(updatePostById(postId, { title: "Updated" })).resolves.toEqual(samplePost);
  });

  it("finds posts by id, slug, and published slug", async () => {
    await expect(findPostById(postId)).resolves.toEqual(samplePost);
    await expect(findPostBySlug("title")).resolves.toEqual(samplePost);
    await expect(findPublishedPostBySlug("title")).resolves.toEqual(samplePost);
  });

  it("checks slug existence with optional exclusion", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([{ id: postId }]),
    }));
    await expect(slugExists("title")).resolves.toBe(true);

    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([]),
    }));
    await expect(slugExists("title", postId)).resolves.toBe(false);
  });

  it("counts posts by status and total posts", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        groupBy: () =>
          drizzleResult([
            { status: "draft", count: 2 },
            { status: "published", count: 3 },
          ]),
      }),
    }));
    await expect(countPostsByStatus()).resolves.toEqual({
      draft: 2,
      scheduled: 0,
      published: 3,
      unpublished: 0,
      archived: 0,
    });

    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([{ count: 5 }]),
    }));
    await expect(countAllPosts()).resolves.toBe(5);
  });

  it("lists published posts and categories", async () => {
    await expect(listPublishedPosts({ limit: 5 })).resolves.toEqual([samplePost]);
    await expect(listPublishedPostsWithPublicOrder()).resolves.toEqual([samplePost]);
    await expect(listCategoriesByIds([])).resolves.toEqual([]);

    const category = {
      id: "cat-1",
      name: "Engineering",
      slug: "engineering",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([category]),
    }));
    await expect(findCategoryById("cat-1")).resolves.toEqual(category);
  });

  it("inserts post revisions", async () => {
    const revision = {
      id: "rev-1",
      postId,
      title: "Title",
      slug: "title",
      excerpt: null,
      contentMarkdown: "Body",
      metadataSnapshot: null,
      revisionType: "manual_save" as const,
      createdBy: "user-1",
      createdAt: new Date(),
    };
    insertMock.mockImplementationOnce(() => ({
      values: () => ({
        returning: () => Promise.resolve([revision]),
      }),
    }));

    await expect(
      insertPostRevision({
        postId,
        title: "Title",
        slug: "title",
        excerpt: null,
        contentMarkdown: "Body",
        revisionType: "manual_save",
        createdBy: "user-1",
      })
    ).resolves.toEqual(revision);
  });

  it("builds published post filter", () => {
    expect(publishedPostFilter()).toBeTruthy();
  });

  it("reads max and next public order values", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ max: 4 }]),
      }),
    }));
    await expect(getMaxPublicOrder()).resolves.toBe(4);

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ max: null }]),
      }),
    }));
    await expect(getMaxPublicOrder()).resolves.toBeNull();

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ max: null }]),
      }),
    }));
    await expect(getNextPublicOrder()).resolves.toBe(1);

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ max: 4 }]),
      }),
    }));
    await expect(getNextPublicOrder()).resolves.toBe(5);
  });
});
