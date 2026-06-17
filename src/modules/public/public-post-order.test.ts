import { describe, expect, it } from "vitest";
import type { Post } from "@/modules/posts/posts.types";
import {
  comparePublicPostOrder,
  findPublicPostNeighbors,
  sortPublicPostOrder,
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

describe("shared public post order", () => {
  it("orders by publicOrder ASC", () => {
    const left = makePost("a", { publicOrder: 2 });
    const right = makePost("b", { publicOrder: 1 });
    expect(comparePublicPostOrder(left, right)).toBeGreaterThan(0);
  });

  it("orders same publicOrder by COALESCE(publishedAt, updatedAt) DESC", () => {
    const postA = makePost("post-a", {
      publicOrder: 0,
      publishedAt: new Date("2026-06-16T12:00:00.000Z"),
      updatedAt: new Date("2026-06-16T12:00:00.000Z"),
    });
    const postB = makePost("post-b", {
      publicOrder: 0,
      publishedAt: new Date("2026-06-15T12:00:00.000Z"),
      updatedAt: new Date("2026-06-15T12:00:00.000Z"),
    });
    const postC = makePost("post-c", {
      publicOrder: 1,
      publishedAt: new Date("2026-06-20T12:00:00.000Z"),
      updatedAt: new Date("2026-06-20T12:00:00.000Z"),
    });

    expect(sortPublicPostOrder([postC, postB, postA]).map((post) => post.id)).toEqual([
      "post-a",
      "post-b",
      "post-c",
    ]);
  });

  it("uses updatedAt DESC as tie-breaker when sort dates match", () => {
    const publishedAt = new Date("2026-06-10T12:00:00.000Z");
    const olderUpdate = makePost("older-update", {
      publicOrder: 0,
      publishedAt,
      updatedAt: new Date("2026-06-11T12:00:00.000Z"),
    });
    const newerUpdate = makePost("newer-update", {
      publicOrder: 0,
      publishedAt,
      updatedAt: new Date("2026-06-12T12:00:00.000Z"),
    });

    expect(sortPublicPostOrder([olderUpdate, newerUpdate]).map((post) => post.id)).toEqual([
      "newer-update",
      "older-update",
    ]);
  });

  it("uses id ASC as stable tie-breaker", () => {
    const publishedAt = new Date("2026-06-10T12:00:00.000Z");
    const updatedAt = new Date("2026-06-10T12:00:00.000Z");
    const postZ = makePost("post-z", { publicOrder: 0, publishedAt, updatedAt });
    const postA = makePost("post-a", { publicOrder: 0, publishedAt, updatedAt });

    expect(sortPublicPostOrder([postZ, postA]).map((post) => post.id)).toEqual(["post-a", "post-z"]);
  });

  it("places explicit publicOrder before null publicOrder", () => {
    const bundles = [
      makeBundle("null-order", { publicOrder: null, publishedAt: new Date("2026-01-10T00:00:00.000Z") }),
      makeBundle("ordered-1", { publicOrder: 1, publishedAt: new Date("2026-01-01T00:00:00.000Z") }),
      makeBundle("ordered-2", { publicOrder: 2, publishedAt: new Date("2026-01-02T00:00:00.000Z") }),
    ];

    expect(sortPublicPostOrder(bundles.map((bundle) => bundle.post)).map((post) => post.id)).toEqual([
      "ordered-1",
      "ordered-2",
      "null-order",
    ]);
  });
});

describe("public post neighbors", () => {
  const orderedPosts = sortPublicPostOrder([
    makePost("post-a", {
      publicOrder: 0,
      publishedAt: new Date("2026-06-16T12:00:00.000Z"),
    }),
    makePost("post-b", {
      publicOrder: 0,
      publishedAt: new Date("2026-06-15T12:00:00.000Z"),
    }),
    makePost("post-c", {
      publicOrder: 1,
      publishedAt: new Date("2026-06-20T12:00:00.000Z"),
    }),
  ]);

  it("returns previous and next from the shared public order", () => {
    const neighbors = findPublicPostNeighbors(orderedPosts, "post-b");
    expect(neighbors.previous?.id).toBe("post-a");
    expect(neighbors.next?.id).toBe("post-c");
  });

  it("returns no previous for the first post", () => {
    const neighbors = findPublicPostNeighbors(orderedPosts, "post-a");
    expect(neighbors.previous).toBeNull();
    expect(neighbors.next?.id).toBe("post-b");
  });

  it("returns no next for the last post", () => {
    const neighbors = findPublicPostNeighbors(orderedPosts, "post-c");
    expect(neighbors.previous?.id).toBe("post-b");
    expect(neighbors.next).toBeNull();
  });

  it("excludes non-listed posts such as drafts from neighbor calculation", () => {
    const neighbors = findPublicPostNeighbors(orderedPosts, "missing-draft");
    expect(neighbors.previous).toBeNull();
    expect(neighbors.next).toBeNull();
  });
});
