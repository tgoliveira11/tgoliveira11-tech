import { describe, expect, it } from "vitest";
import { isPublicPost } from "@/modules/posts/posts.visibility";
import type { Post } from "@/modules/posts/posts.types";

function makePost(overrides: Partial<Post>): Post {
  const now = new Date();
  return {
    id: "post-id",
    title: "Title",
    slug: "title",
    excerpt: null,
    contentMarkdown: "Body",
    contentHtmlCache: null,
    coverAssetId: null,
    status: "draft",
    featured: false,
    pinned: false,
    pinnedPriority: 0,
    categoryId: null,
    publishedAt: null,
    scheduledAt: null,
    unpublishedAt: null,
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogAssetId: null,
    readingTimeMinutes: null,
    createdBy: "user-id",
    updatedBy: "user-id",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("public post visibility", () => {
  it("only treats published posts with publishedAt <= now as public", () => {
    const now = new Date("2026-06-14T12:00:00.000Z");

    expect(
      isPublicPost(
        makePost({
          status: "published",
          publishedAt: new Date("2026-06-14T11:00:00.000Z"),
        }),
        now
      )
    ).toBe(true);

    expect(isPublicPost(makePost({ status: "draft" }), now)).toBe(false);
    expect(isPublicPost(makePost({ status: "scheduled" }), now)).toBe(false);
    expect(isPublicPost(makePost({ status: "unpublished" }), now)).toBe(false);
    expect(isPublicPost(makePost({ status: "archived" }), now)).toBe(false);

    expect(
      isPublicPost(
        makePost({
          status: "published",
          publishedAt: new Date("2026-06-14T13:00:00.000Z"),
        }),
        now
      )
    ).toBe(false);
  });
});
