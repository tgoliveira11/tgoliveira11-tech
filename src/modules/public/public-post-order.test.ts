import { describe, expect, it } from "vitest";
import type { Post } from "@/modules/posts/posts.types";
import {
  comparePublicPostListing,
  sortPublicPostListing,
} from "@/modules/public/public-post-order";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

function makePost(
  id: string,
  overrides: Partial<Post> = {}
): Post {
  const publishedAt = new Date(`2026-01-${String(id).padStart(2, "0")}T12:00:00.000Z`);
  return {
    id,
    title: `Post ${id}`,
    slug: `post-${id}`,
    excerpt: null,
    contentMarkdown: "",
    contentHtmlCache: null,
    coverAssetId: null,
    ogAssetId: null,
    status: "published",
    featured: false,
    pinned: false,
    pinnedPriority: 0,
    publicOrder: null,
    categoryId: null,
    publishedAt,
    scheduledAt: null,
    unpublishedAt: null,
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    readingTimeMinutes: null,
    createdBy: "user",
    updatedBy: "user",
    createdAt: publishedAt,
    updatedAt: publishedAt,
    ...overrides,
  };
}

function makeBundle(id: string, overrides: Partial<Post> = {}): PublicPostBundle {
  return {
    post: makePost(id, overrides),
    category: null,
    tags: [],
    coverAsset: null,
  };
}

describe("public post listing order", () => {
  it("orders manual publicOrder before null publicOrder", () => {
    const bundles = [
      makeBundle("3", { publicOrder: null, publishedAt: new Date("2026-01-10T00:00:00.000Z") }),
      makeBundle("1", { publicOrder: 1, publishedAt: new Date("2026-01-01T00:00:00.000Z") }),
      makeBundle("2", { publicOrder: 2, publishedAt: new Date("2026-01-02T00:00:00.000Z") }),
    ];

    expect(sortPublicPostListing(bundles).map((bundle) => bundle.post.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("orders lower publicOrder values first", () => {
    const left = makePost("a", { publicOrder: 2 });
    const right = makePost("b", { publicOrder: 1 });
    expect(comparePublicPostListing(left, right)).toBeGreaterThan(0);
  });

  it("falls back to publishedAt desc for null publicOrder", () => {
    const newer = makePost("new", {
      publicOrder: null,
      publishedAt: new Date("2026-02-01T00:00:00.000Z"),
    });
    const older = makePost("old", {
      publicOrder: null,
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(comparePublicPostListing(newer, older)).toBeLessThan(0);
  });
});
