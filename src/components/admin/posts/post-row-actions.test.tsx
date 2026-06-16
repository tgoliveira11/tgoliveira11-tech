import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostRowActions } from "@/components/admin/posts/post-row-actions";
import type { Post } from "@/modules/posts/posts.types";

const basePost: Post = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Example post",
  slug: "example-post",
  excerpt: null,
  contentMarkdown: "",
  contentHtmlCache: null,
  status: "draft",
  featured: false,
  pinned: false,
  pinnedPriority: 0,
  publicOrder: null,
  categoryId: null,
  coverAssetId: null,
  publishedAt: null,
  scheduledAt: null,
  unpublishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  readingTimeMinutes: null,
  seoTitle: null,
  seoDescription: null,
  ogAssetId: null,
  canonicalUrl: null,
  ogTitle: null,
  ogDescription: null,
  createdBy: "user-1",
  updatedBy: "user-1",
};

describe("PostRowActions", () => {
  it("renders accessible labels for draft post actions", () => {
    const html = renderToStaticMarkup(
      <PostRowActions
        post={basePost}
        pending={false}
        onPublish={() => {}}
        onUnpublish={() => {}}
        onDuplicate={() => {}}
        onArchive={() => {}}
      />
    );

    expect(html).toContain('aria-label="Edit Example post"');
    expect(html).toContain('title="Preview"');
    expect(html).toContain('title="Publish"');
    expect(html).toContain('title="Duplicate"');
    expect(html).toContain('title="Archive"');
    expect(html).not.toContain('title="Unpublish"');
  });

  it("renders unpublish instead of publish for published posts", () => {
    const html = renderToStaticMarkup(
      <PostRowActions
        post={{ ...basePost, status: "published" }}
        pending={false}
        onPublish={() => {}}
        onUnpublish={() => {}}
        onDuplicate={() => {}}
        onArchive={() => {}}
      />
    );

    expect(html).toContain('title="Unpublish"');
    expect(html).not.toContain('title="Publish"');
  });

  it("hides archive action for archived posts", () => {
    const html = renderToStaticMarkup(
      <PostRowActions
        post={{ ...basePost, status: "archived" }}
        pending={false}
        onPublish={() => {}}
        onUnpublish={() => {}}
        onDuplicate={() => {}}
        onArchive={() => {}}
      />
    );

    expect(html).not.toContain('title="Archive"');
  });
});
