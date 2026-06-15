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
    contentHtmlCache: "<p>Body</p>",
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
    readingTimeMinutes: 1,
    createdBy: "user-id",
    updatedBy: "user-id",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("admin lifecycle visibility", () => {
  const now = new Date("2026-06-14T12:00:00.000Z");

  it("keeps draft, scheduled, unpublished, and archived posts off public surfaces", () => {
    expect(isPublicPost(makePost({ status: "draft" }), now)).toBe(false);
    expect(isPublicPost(makePost({ status: "scheduled" }), now)).toBe(false);
    expect(isPublicPost(makePost({ status: "unpublished" }), now)).toBe(false);
    expect(isPublicPost(makePost({ status: "archived" }), now)).toBe(false);
  });

  it("treats duplicated drafts as non-public until published", () => {
    const duplicateDraft = makePost({
      title: "Title (Copy)",
      slug: "title-copy",
      status: "draft",
      featured: false,
      pinned: false,
      publishedAt: null,
    });

    expect(isPublicPost(duplicateDraft, now)).toBe(false);
  });
});
