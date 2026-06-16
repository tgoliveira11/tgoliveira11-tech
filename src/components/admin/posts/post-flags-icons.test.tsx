import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostFlagsIcons } from "@/components/admin/posts/post-flags-icons";

const basePost = {
  id: "post-1",
  title: "Post",
  slug: "post",
  excerpt: null,
  contentMarkdown: "",
  contentHtmlCache: null,
  coverAssetId: null,
  ogAssetId: null,
  status: "draft" as const,
  featured: false,
  pinned: false,
  pinnedPriority: 0,
  categoryId: null,
  publishedAt: null,
  scheduledAt: null,
  unpublishedAt: null,
  publicOrder: 0,
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

describe("PostFlagsIcons", () => {
  it("renders an empty state when no flags are set", () => {
    const html = renderToStaticMarkup(<PostFlagsIcons post={basePost} />);
    expect(html).toContain("—");
  });

  it("renders featured and pinned icons with accessible labels", () => {
    const html = renderToStaticMarkup(
      <PostFlagsIcons
        post={{
          ...basePost,
          featured: true,
          pinned: true,
          pinnedPriority: 10,
        }}
      />
    );

    expect(html).toContain('aria-label="Featured post"');
    expect(html).toContain('aria-label="Pinned post, priority 10"');
    expect(html).toContain('title="Featured post"');
    expect(html).toContain('title="Pinned post (priority 10)"');
  });
});
