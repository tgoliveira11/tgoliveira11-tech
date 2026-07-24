import { describe, expect, it } from "vitest";
import type { BlogConfig } from "@/modules/public/blog-config";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { buildLlmsFullTxt, buildLlmsTxt, LLMS_FULL_TXT_PATH } from "@/modules/public/ai-discovery";

const config: BlogConfig = {
  title: "PostForge",
  description: "A test blog",
  baseUrl: "https://example.com",
  postsPerPage: 12,
  rssEnabled: true,
  analyticsEnabled: true,
  defaultSeoImage: null,
};

function makeBundle(): PublicPostBundle {
  const now = new Date("2026-07-24T12:00:00.000Z");
  return {
    post: {
      id: "post-1",
      title: "Measuring AI Platforms",
      slug: "measuring-ai-platforms",
      excerpt: "How to measure production AI platform outcomes.",
      contentMarkdown: "## Measurement\n\nUse product and reliability signals together.",
      contentHtmlCache: "<h2>Measurement</h2>",
      coverAssetId: null,
      status: "published",
      featured: false,
      pinned: false,
      pinnedPriority: 0,
      categoryId: "cat-1",
      publishedAt: now,
      scheduledAt: null,
      unpublishedAt: null,
      seoTitle: null,
      seoDescription: null,
      canonicalUrl: null,
      ogTitle: null,
      ogDescription: null,
      ogAssetId: null,
      readingTimeMinutes: 4,
      createdBy: "user-1",
      updatedBy: "user-1",
      createdAt: now,
      updatedAt: now,
    },
    category: {
      id: "cat-1",
      name: "AI Engineering",
      slug: "ai-engineering",
      description: "Production AI systems.",
      createdAt: now,
      updatedAt: now,
    },
    tags: [{ id: "tag-1", name: "measurement", slug: "measurement", createdAt: now, updatedAt: now }],
    coverAsset: null,
  };
}

describe("AI discovery helpers", () => {
  it("builds a concise AI-readable content map", () => {
    const text = buildLlmsTxt({
      config,
      posts: [makeBundle()],
      tags: [{ name: "measurement", slug: "measurement", postCount: 1 }],
      categories: [{ name: "AI Engineering", slug: "ai-engineering", postCount: 1 }],
    });

    expect(text).toContain("# Thiago Goulart de Oliveira");
    expect(text).toContain(`https://example.com${LLMS_FULL_TXT_PATH}`);
    expect(text).toContain("https://example.com/blog/measuring-ai-platforms");
    expect(text).toContain("AI Engineering");
    expect(text).toContain("measurement");
  });

  it("builds a full public content export with article markdown", () => {
    const text = buildLlmsFullTxt({
      config,
      posts: [makeBundle()],
      tags: [],
      categories: [],
    });

    expect(text).toContain("# Thiago Goulart de Oliveira - Full Public Content");
    expect(text).toContain("URL: https://example.com/blog/measuring-ai-platforms");
    expect(text).toContain("## Measurement");
    expect(text).toContain("Use product and reliability signals together.");
  });
});

