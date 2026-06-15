import { describe, expect, it } from "vitest";
import {
  getFeaturedPostLabel,
  limitTagsForDisplay,
  pickFeaturedPost,
  splitHomePosts,
} from "@/modules/public/public-display";
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

describe("public display helpers", () => {
  it("limits visible tags and reports hidden count", () => {
    const tags = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "three" },
      { id: "4", name: "four" },
      { id: "5", name: "five" },
    ];

    expect(limitTagsForDisplay(tags, 4)).toEqual({
      visible: tags.slice(0, 4),
      hiddenCount: 1,
    });
  });

  it("prefers pinned then featured then latest post for the home feature", () => {
    const bundles = [
      makeBundle("latest", { featured: false, pinned: false }),
      makeBundle("featured", { featured: true }),
      makeBundle("pinned", { pinned: true, pinnedPriority: 2 }),
    ];

    expect(pickFeaturedPost(bundles)?.post.id).toBe("pinned");
    expect(pickFeaturedPost([bundles[0]!, bundles[1]!])?.post.id).toBe("featured");
    expect(pickFeaturedPost([bundles[0]!])?.post.id).toBe("latest");
  });

  it("labels featured posts by promotion state", () => {
    expect(getFeaturedPostLabel(makeBundle("1", { pinned: true }))).toBe("Pinned");
    expect(getFeaturedPostLabel(makeBundle("2", { featured: true }))).toBe("Featured");
    expect(getFeaturedPostLabel(makeBundle("3"))).toBe("Latest");
  });

  it("does not duplicate the featured post in recent posts", () => {
    const bundles = [
      makeBundle("featured", { featured: true }),
      makeBundle("two"),
      makeBundle("three"),
    ];

    const { featuredPost, recent } = splitHomePosts(bundles, 12);

    expect(featuredPost?.post.id).toBe("featured");
    expect(recent.map((bundle) => bundle.post.id)).toEqual(["two", "three"]);
  });

  it("returns empty home sections when there are no published posts", () => {
    const { featuredPost, recent } = splitHomePosts([], 12);

    expect(featuredPost).toBeNull();
    expect(recent).toEqual([]);
  });
});
