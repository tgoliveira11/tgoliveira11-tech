import { describe, expect, it } from "vitest";
import { pickFeaturedPost, splitHomePosts } from "@/modules/public/public-display";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

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

describe("home recent posts with manual order", () => {
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
