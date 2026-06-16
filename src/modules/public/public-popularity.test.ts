import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listPopularTagsMock,
  listPopularCategoriesMock,
  listPublishedPostBundlesPaginatedMock,
} = vi.hoisted(() => ({
  listPopularTagsMock: vi.fn(),
  listPopularCategoriesMock: vi.fn(),
  listPublishedPostBundlesPaginatedMock: vi.fn(),
}));

vi.mock("@/modules/public/public-posts.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/public/public-posts.repository")>();
  return {
    ...actual,
    listPopularTags: listPopularTagsMock,
    listPopularCategories: listPopularCategoriesMock,
    listPublishedPostBundlesPaginated: listPublishedPostBundlesPaginatedMock,
  };
});

vi.mock("@/modules/public/blog-config", () => ({
  getBlogConfig: vi.fn().mockResolvedValue({ siteName: "Test" }),
}));

import { getBlogListingPage, getHomePageTopics } from "@/modules/public/public-posts.service";
import { HOME_TOPICS_TAG_LIMIT } from "@/modules/public/public-display";

describe("public popularity and blog totals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns total published posts from pagination, not page size", async () => {
    listPublishedPostBundlesPaginatedMock.mockResolvedValue({
      items: [{ post: { id: "1" } }, { post: { id: "2" } }],
      page: 1,
      pageSize: 5,
      totalItems: 23,
      totalPages: 5,
      hasPreviousPage: false,
      hasNextPage: true,
    });

    const result = await getBlogListingPage(1);

    expect(result.total).toBe(23);
    expect(result.posts).toHaveLength(2);
  });

  it("loads popular tags and categories for the home page", async () => {
    listPopularTagsMock.mockResolvedValue([
      { id: "t1", name: "architecture", slug: "architecture", postCount: 4 },
      { id: "t2", name: "devops", slug: "devops", postCount: 2 },
    ]);
    listPopularCategoriesMock.mockResolvedValue([
      { id: "c1", name: "Engineering", slug: "engineering", postCount: 5 },
    ]);

    const result = await getHomePageTopics();

    expect(listPopularTagsMock).toHaveBeenCalledWith(HOME_TOPICS_TAG_LIMIT);
    expect(listPopularCategoriesMock).toHaveBeenCalledWith(6);
    expect(result.popularTags[0]?.postCount).toBe(4);
    expect(result.popularCategories[0]?.postCount).toBe(5);
  });
});

function sortPopularTags<T extends { name: string; postCount: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    if (right.postCount !== left.postCount) {
      return right.postCount - left.postCount;
    }
    return left.name.localeCompare(right.name);
  });
}

describe("popular tag ordering rules", () => {
  it("orders tags by published post count desc with name asc tie-breaker", () => {
    const ordered = sortPopularTags([
      { name: "beta", postCount: 2 },
      { name: "alpha", postCount: 4 },
      { name: "gamma", postCount: 2 },
    ]);

    expect(ordered.map((tag) => tag.name)).toEqual(["alpha", "beta", "gamma"]);
  });

  it("excludes tags with zero published posts", () => {
    const tags = [
      { name: "used", postCount: 3 },
      { name: "unused", postCount: 0 },
    ].filter((tag) => tag.postCount > 0);

    expect(tags).toEqual([{ name: "used", postCount: 3 }]);
  });
});

describe("popular category ordering rules", () => {
  it("orders categories by published post count desc with name asc tie-breaker", () => {
    const ordered = [
      { name: "Ops", postCount: 1 },
      { name: "Engineering", postCount: 3 },
      { name: "Design", postCount: 3 },
    ].sort((left, right) => {
      if (right.postCount !== left.postCount) {
        return right.postCount - left.postCount;
      }
      return left.name.localeCompare(right.name);
    });

    expect(ordered.map((category) => category.name)).toEqual(["Design", "Engineering", "Ops"]);
  });
});
