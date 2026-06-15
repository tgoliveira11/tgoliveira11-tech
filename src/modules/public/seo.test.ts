import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/public/public-posts.repository", () => ({
  findAssetById: vi.fn(async () => null),
}));

import type { BlogConfig } from "@/modules/public/blog-config";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import {
  buildBlogPostingJsonLd,
  buildPostMetadata,
  resolvePostSeo,
  resolvePostSeoWithImages,
} from "@/modules/public/seo";

const config: BlogConfig = {
  title: "PostForge",
  description: "A test blog",
  baseUrl: "https://example.com",
  postsPerPage: 12,
  rssEnabled: true,
  analyticsEnabled: true,
  defaultSeoImage: "/default.png",
};

function makeBundle(overrides: Partial<PublicPostBundle["post"]> = {}): PublicPostBundle {
  const now = new Date("2026-06-14T12:00:00.000Z");
  return {
    post: {
      id: "post-1",
      title: "Hello World",
      slug: "hello-world",
      excerpt: "Short excerpt",
      contentMarkdown: "Body",
      contentHtmlCache: "<p>Body</p>",
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
      readingTimeMinutes: 3,
      createdBy: "user-1",
      updatedBy: "user-1",
      createdAt: now,
      updatedAt: now,
      ...overrides,
    },
    category: null,
    tags: [{ id: "tag-1", name: "News", slug: "news", createdAt: now, updatedAt: now }],
    coverAsset: null,
  };
}

describe("seo helpers", () => {
  it("falls back to post title and excerpt", () => {
    const resolved = resolvePostSeo({ bundle: makeBundle(), config });
    expect(resolved.title).toBe("Hello World");
    expect(resolved.description).toBe("Short excerpt");
    expect(resolved.canonicalUrl).toBe("https://example.com/blog/hello-world");
  });

  it("uses explicit SEO fields when present", () => {
    const resolved = resolvePostSeo({
      bundle: makeBundle({
        seoTitle: "Custom SEO",
        seoDescription: "Custom description",
        canonicalUrl: "https://example.com/custom",
        ogTitle: "OG title",
        ogDescription: "OG description",
      }),
      config,
    });

    expect(resolved.title).toBe("Custom SEO");
    expect(resolved.description).toBe("Custom description");
    expect(resolved.canonicalUrl).toBe("https://example.com/custom");
    expect(resolved.ogTitle).toBe("OG title");
  });

  it("builds metadata and JSON-LD", () => {
    const resolved = resolvePostSeo({ bundle: makeBundle(), config });
    const metadata = buildPostMetadata(resolved);
    const jsonLd = buildBlogPostingJsonLd(makeBundle(), resolved);

    expect(metadata.title).toBe("Hello World");
    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.headline).toBe("Hello World");
  });

  it("falls back to defaultSeoImage when asset records are unavailable", async () => {
    const bundle = makeBundle({
      ogAssetId: "missing-og-asset",
      coverAssetId: "missing-cover-asset",
    });

    const resolved = await resolvePostSeoWithImages({ bundle, config });
    expect(resolved.ogImageUrl).toBe("https://example.com/default.png");
  });
});
