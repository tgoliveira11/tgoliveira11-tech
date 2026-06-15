import { describe, expect, it } from "vitest";
import type { BlogConfig } from "@/modules/public/blog-config";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { buildRssXml } from "@/modules/public/rss";

const config: BlogConfig = {
  title: "PostForge",
  description: "Blog",
  baseUrl: "https://example.com",
  postsPerPage: 12,
  rssEnabled: true,
  analyticsEnabled: true,
  defaultSeoImage: null,
};

function makeBundle(slug: string, title: string): PublicPostBundle {
  const now = new Date("2026-06-14T12:00:00.000Z");
  return {
    post: {
      id: slug,
      title,
      slug,
      excerpt: "Excerpt",
      contentMarkdown: "Body",
      contentHtmlCache: null,
      coverAssetId: null,
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
      ogAssetId: null,
      readingTimeMinutes: 1,
      createdBy: "user",
      updatedBy: "user",
      createdAt: now,
      updatedAt: now,
    },
    category: null,
    tags: [],
    coverAsset: null,
  };
}

describe("rss builder", () => {
  it("includes only provided published bundles", () => {
    const xml = buildRssXml(config, [makeBundle("published-post", "Published")]);
    expect(xml).toContain("<title>Published</title>");
    expect(xml).toContain("https://example.com/blog/published-post");
    expect(xml).not.toContain("draft-post");
  });

  it("escapes XML entities", () => {
    const xml = buildRssXml(config, [makeBundle("unsafe", "Title & <More>")]);
    expect(xml).toContain("Title &amp; &lt;More&gt;");
  });
});
