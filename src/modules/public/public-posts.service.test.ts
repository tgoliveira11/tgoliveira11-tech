import { beforeEach, describe, expect, it, vi } from "vitest";
import { pickFeaturedPost, splitHomePosts } from "@/modules/public/public-display";
import { comparePublicPostOrder, sortPublicPostOrder } from "@/modules/public/public-post-order";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

const { listPublishedPostBundlesMock, readHomeRecentPostsLimitMock } = vi.hoisted(() => ({
  listPublishedPostBundlesMock: vi.fn(),
  readHomeRecentPostsLimitMock: vi.fn(),
}));

vi.mock("@/modules/public/public-posts.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/public/public-posts.repository")>();
  return {
    ...actual,
    listPublishedPostBundles: listPublishedPostBundlesMock,
  };
});

vi.mock("@/modules/public/blog-config", () => ({
  getBlogConfig: vi.fn().mockResolvedValue({ title: "Test", description: "Blog" }),
}));

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();
  return {
    ...actual,
    readHomeRecentPostsLimit: readHomeRecentPostsLimitMock,
  };
});

import { getHomePagePosts } from "@/modules/public/public-posts.service";

function makeBundle(
  id: string,
  overrides: Partial<PublicPostBundle["post"]> = {}
): PublicPostBundle {
  const now = new Date("2026-01-01T12:00:00.000Z");
  return {
    post: {
      id,
      title: `Post ${id}`,
      slug: `post-${id}`,
      excerpt: "Excerpt",
      contentMarkdown: "Body",
      contentHtmlCache: null,
      coverAssetId: null,
      ogAssetId: null,
      status: "published",
      featured: false,
      pinned: false,
      pinnedPriority: 0,
      publicOrder: null,
      categoryId: null,
      publishedAt: now,
      scheduledAt: null,
      unpublishedAt: null,
      seoTitle: null,
      seoDescription: null,
      canonicalUrl: null,
      ogTitle: null,
      ogDescription: null,
      readingTimeMinutes: 3,
      createdBy: "user-1",
      updatedBy: "user-1",
      createdAt: now,
      updatedAt: now,
      ...overrides,
    },
    category: null,
    tags: [],
    coverAsset: null,
  };
}

function sortBundlesByPublicOrder(bundles: PublicPostBundle[]): PublicPostBundle[] {
  return [...bundles].sort((left, right) => comparePublicPostOrder(left.post, right.post));
}

function getBlogListingOrder(bundles: PublicPostBundle[]): PublicPostBundle[] {
  return sortBundlesByPublicOrder(bundles);
}

describe("getHomePagePosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readHomeRecentPostsLimitMock.mockReturnValue(3);
  });

  it("loads published bundles via listPublishedPostBundles with limit buffer for featured exclusion", async () => {
    const bundles = [
      makeBundle("post-a", { publicOrder: 0, publishedAt: new Date("2026-06-16T12:00:00.000Z") }),
      makeBundle("post-b", { publicOrder: 0, publishedAt: new Date("2026-06-15T12:00:00.000Z") }),
      makeBundle("post-c", { publicOrder: 1, publishedAt: new Date("2026-06-20T12:00:00.000Z") }),
    ];
    listPublishedPostBundlesMock.mockResolvedValue(bundles);

    const result = await getHomePagePosts();

    expect(listPublishedPostBundlesMock).toHaveBeenCalledWith({ limit: 8 });
    expect(result.featuredPost?.post.id).toBe("post-a");
    expect(result.recent.map((bundle) => bundle.post.id)).toEqual(["post-b", "post-c"]);
  });

  it("respects HOME_RECENT_POSTS_LIMIT when slicing recent posts", async () => {
    readHomeRecentPostsLimitMock.mockReturnValue(2);
    const bundles = [
      makeBundle("1", { publicOrder: 0 }),
      makeBundle("2", { publicOrder: 1 }),
      makeBundle("3", { publicOrder: 2 }),
      makeBundle("4", { publicOrder: 3 }),
    ];
    listPublishedPostBundlesMock.mockResolvedValue(bundles);

    const result = await getHomePagePosts();

    expect(listPublishedPostBundlesMock).toHaveBeenCalledWith({ limit: 7 });
    expect(result.recent).toHaveLength(2);
    expect(result.recent.map((bundle) => bundle.post.id)).toEqual(["2", "3"]);
  });
});

describe("home recent posts with manual order", () => {
  const postA = makeBundle("post-a", {
    publicOrder: 0,
    publishedAt: new Date("2026-06-16T12:00:00.000Z"),
    updatedAt: new Date("2026-06-16T12:00:00.000Z"),
  });
  const postB = makeBundle("post-b", {
    publicOrder: 0,
    publishedAt: new Date("2026-06-15T12:00:00.000Z"),
    updatedAt: new Date("2026-06-15T12:00:00.000Z"),
  });
  const postC = makeBundle("post-c", {
    publicOrder: 1,
    publishedAt: new Date("2026-06-20T12:00:00.000Z"),
    updatedAt: new Date("2026-06-20T12:00:00.000Z"),
  });
  const postD = makeBundle("post-d", {
    publicOrder: 0,
    publishedAt: new Date("2026-06-17T12:00:00.000Z"),
    status: "draft",
  });

  it("uses the same shared public ordering as /blog", () => {
    const unsorted = [postC, postB, postA];
    const blogOrder = getBlogListingOrder(unsorted).map((bundle) => bundle.post.id);
    const homeOrder = sortBundlesByPublicOrder(unsorted).map((bundle) => bundle.post.id);

    expect(blogOrder).toEqual(["post-a", "post-b", "post-c"]);
    expect(homeOrder).toEqual(blogOrder);
  });

  it("orders by publicOrder ASC", () => {
    const ordered = sortPublicPostOrder([postC.post, postA.post, postB.post]).map((post) => post.id);
    expect(ordered).toEqual(["post-a", "post-b", "post-c"]);
  });

  it("orders same publicOrder by COALESCE(publishedAt, updatedAt) DESC", () => {
    expect(comparePublicPostOrder(postA.post, postB.post)).toBeLessThan(0);
    expect(comparePublicPostOrder(postB.post, postA.post)).toBeGreaterThan(0);
  });

  it("excludes draft posts from the published-only home feed", () => {
    const publishedOnly = [postA, postB, postC, postD].filter(
      (bundle) => bundle.post.status === "published"
    );
    const ordered = sortBundlesByPublicOrder(publishedOnly).map((bundle) => bundle.post.id);

    expect(ordered).toEqual(["post-a", "post-b", "post-c"]);
    expect(ordered).not.toContain("post-d");
  });

  it("matches /blog listing order after featured exclusion", () => {
    const publishedOnly = [postA, postB, postC];
    const blogFirstN = getBlogListingOrder(publishedOnly)
      .map((bundle) => bundle.post.id)
      .slice(0, 3);
    const { featuredPost, recent } = splitHomePosts(publishedOnly, 12);

    expect(blogFirstN).toEqual(["post-a", "post-b", "post-c"]);
    expect(featuredPost?.post.id).toBe("post-a");
    expect(recent.map((bundle) => bundle.post.id)).toEqual(
      blogFirstN.filter((id) => id !== featuredPost?.post.id)
    );
  });

  it("does not duplicate featured post in recent list", () => {
    const bundles = [
      makeBundle("featured", { featured: true, publicOrder: 5 }),
      makeBundle("one", { publicOrder: 1 }),
      makeBundle("two", { publicOrder: 2 }),
      makeBundle("three"),
      makeBundle("four"),
      makeBundle("five"),
      makeBundle("six"),
    ];

    const { featuredPost, recent } = splitHomePosts(bundles, 5);

    expect(featuredPost?.post.id).toBe("featured");
    expect(recent.map((bundle) => bundle.post.id)).toEqual(["one", "two", "three", "four", "five"]);
    expect(recent.some((bundle) => bundle.post.id === "featured")).toBe(false);
  });

  it("still prefers pinned post for hero even with manual order", () => {
    const bundles = [
      makeBundle("manual-first", { publicOrder: 1 }),
      makeBundle("pinned", { pinned: true, publicOrder: 9 }),
    ];

    expect(pickFeaturedPost(bundles)?.post.id).toBe("pinned");
  });
});
