import { describe, expect, it, vi } from "vitest";

const { findAssetByIdMock } = vi.hoisted(() => ({
  findAssetByIdMock: vi.fn(async () => null),
}));

vi.mock("@/modules/public/public-posts.repository", () => ({
  findAssetById: findAssetByIdMock,
}));

import type { BlogConfig } from "@/modules/public/blog-config";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import {
  buildBlogPostingJsonLd,
  buildArticleBreadcrumbJsonLd,
  buildPostMetadata,
  buildPublicPageMetadata,
  buildSiteMetadata,
  buildWebsiteJsonLd,
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
    const bundle = makeBundle();
    const resolved = {
      ...resolvePostSeo({ bundle, config }),
      ogImageUrl: "https://example.com/default.png",
    };
    const metadata = buildPostMetadata(resolved, bundle);
    const jsonLd = buildBlogPostingJsonLd(bundle, resolved);

    expect(metadata.title).toBe("Hello World");
    expect(metadata.description).toBe("Short excerpt");
    expect(metadata.metadataBase?.toString()).toBe("https://example.com/");
    expect(metadata.authors).toEqual([
      {
        name: "Thiago Goulart de Oliveira",
        url: "https://example.com/about",
      },
    ]);
    expect(metadata.creator).toBe("Thiago Goulart de Oliveira");
    expect(metadata.publisher).toBe("Thiago Goulart de Oliveira");
    expect(metadata.alternates).toMatchObject({
      canonical: "https://example.com/blog/hello-world",
      types: {
        "application/rss+xml": "https://example.com/rss.xml",
      },
    });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      title: "Hello World",
      description: "Short excerpt",
      url: "https://example.com/blog/hello-world",
      locale: "en_US",
      siteName: "Thiago Goulart de Oliveira",
      publishedTime: "2026-06-14T12:00:00.000Z",
      modifiedTime: "2026-06-14T12:00:00.000Z",
      authors: ["https://example.com/about"],
      tags: ["News"],
      images: [{ url: "https://example.com/default.png", alt: "Hello World" }],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Hello World",
      description: "Short excerpt",
      images: ["https://example.com/default.png"],
    });
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    });
    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.headline).toBe("Hello World");
    expect(jsonLd.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": "https://example.com/blog/hello-world",
    });
    expect(jsonLd.image).toEqual(["https://example.com/default.png"]);
    expect(jsonLd.author).toMatchObject({
      "@type": "Person",
      "@id": "https://example.com/#person",
      name: "Thiago Goulart de Oliveira",
      url: "https://example.com/about",
    });
    expect(jsonLd.publisher).toEqual(jsonLd.author);
    expect(jsonLd.timeRequired).toBe("PT3M");
  });

  it("falls back to defaultSeoImage when asset records are unavailable", async () => {
    const bundle = makeBundle({
      ogAssetId: "missing-og-asset",
      coverAssetId: "missing-cover-asset",
    });

    const resolved = await resolvePostSeoWithImages({ bundle, config });
    expect(resolved.ogImageUrl).toBe("https://example.com/default.png");
  });

  it("uses the branded Open Graph image route when no article image is configured", async () => {
    const resolved = await resolvePostSeoWithImages({
      bundle: makeBundle(),
      config: { ...config, defaultSeoImage: null },
    });

    expect(resolved.ogImageUrl).toBe("https://example.com/opengraph-image");
  });

  it("falls back to blog description when excerpt is missing", () => {
    const resolved = resolvePostSeo({
      bundle: makeBundle({ excerpt: null }),
      config,
    });

    expect(resolved.description).toContain("production AI systems");
  });

  it("builds site metadata from blog config", () => {
    const metadata = buildSiteMetadata(config);
    const websiteJsonLd = buildWebsiteJsonLd(config);

    expect(metadata.title).toEqual({
      default: "Thiago Goulart de Oliveira",
      template: "%s | Thiago Goulart de Oliveira",
    });
    expect(metadata.description).toContain("production AI systems");
    expect(metadata.metadataBase?.toString()).toBe("https://example.com/");
    expect(metadata.alternates).toMatchObject({
      canonical: "/",
      types: {
        "application/rss+xml": "https://example.com/rss.xml",
        "text/plain": [
          { title: "LLMs.txt", url: "https://example.com/llms.txt" },
          { title: "LLMs-full.txt", url: "https://example.com/llms-full.txt" },
        ],
      },
    });
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    });
    expect(websiteJsonLd.publisher).toMatchObject({
      "@id": "https://example.com/#person",
      url: "https://example.com/about",
    });
  });

  it("builds public page metadata without dropping discovery alternates", () => {
    const metadata = buildPublicPageMetadata(config, {
      title: "Articles",
      description: "All public articles.",
      canonicalPath: "/blog",
    });

    expect(metadata.title).toBe("Articles");
    expect(metadata.description).toBe("All public articles.");
    expect(metadata.alternates).toMatchObject({
      canonical: "/blog",
      types: {
        "application/rss+xml": "https://example.com/rss.xml",
      },
    });
    expect(metadata.openGraph).toMatchObject({
      title: "Articles",
      description: "All public articles.",
      url: "https://example.com/blog",
    });
  });

  it("uses asset publicUrl for og image when available", async () => {
    findAssetByIdMock.mockResolvedValueOnce({
      id: "asset-1",
      publicUrl: "/uploads/cover.png",
    });

    const resolved = await resolvePostSeoWithImages({
      bundle: makeBundle({ ogAssetId: "asset-1" }),
      config,
    });

    expect(resolved.ogImageUrl).toBe("https://example.com/uploads/cover.png");
  });

  it("builds large-image metadata when ogImageUrl is present", () => {
    const metadata = buildPostMetadata({
      title: "Hello World",
      description: "Short excerpt",
      canonicalUrl: "https://example.com/blog/hello-world",
      ogTitle: "Hello World",
      ogDescription: "Short excerpt",
      ogImageUrl: "https://example.com/og.png",
    });

    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.openGraph?.images).toEqual([
      { url: "https://example.com/og.png", alt: "Hello World" },
    ]);
  });

  it("includes category and keywords in JSON-LD", () => {
    const now = new Date("2026-06-14T12:00:00.000Z");
    const bundle = makeBundle();
    bundle.category = {
      id: "cat-1",
      name: "Guides",
      slug: "guides",
      description: null,
      createdAt: now,
      updatedAt: now,
    };
    const resolved = resolvePostSeo({ bundle, config });
    const jsonLd = buildBlogPostingJsonLd(bundle, resolved);

    expect(jsonLd.articleSection).toBe("Guides");
    expect(jsonLd.keywords).toBe("News");
  });

  it("uses the site base URL for article structured data when canonical URL is custom", () => {
    const bundle = makeBundle({ canonicalUrl: "https://canonical.example.com/custom" });
    const resolved = resolvePostSeo({ bundle, config });
    const articleJsonLd = buildBlogPostingJsonLd(bundle, resolved);
    const breadcrumbJsonLd = buildArticleBreadcrumbJsonLd(bundle, resolved);

    expect(articleJsonLd["@id"]).toBe("https://canonical.example.com/custom#article");
    expect(articleJsonLd.author).toMatchObject({
      "@id": "https://example.com/#person",
      url: "https://example.com/about",
    });
    expect(breadcrumbJsonLd.itemListElement).toMatchObject([
      { item: "https://example.com/" },
      { item: "https://example.com/blog" },
      { item: "https://canonical.example.com/custom" },
    ]);
  });

  it("supports absolute asset and default image URLs", async () => {
    findAssetByIdMock.mockResolvedValueOnce({
      id: "asset-1",
      publicUrl: "https://cdn.example.com/cover.png",
    });

    const withAbsoluteAsset = await resolvePostSeoWithImages({
      bundle: makeBundle({ ogAssetId: "asset-1" }),
      config,
    });
    expect(withAbsoluteAsset.ogImageUrl).toBe("https://cdn.example.com/cover.png");

    findAssetByIdMock.mockResolvedValueOnce(null);
    const withAbsoluteDefault = await resolvePostSeoWithImages({
      bundle: makeBundle(),
      config: { ...config, defaultSeoImage: "https://cdn.example.com/default.png" },
    });
    expect(withAbsoluteDefault.ogImageUrl).toBe("https://cdn.example.com/default.png");
  });

  it("builds summary card metadata when no og image exists", () => {
    const metadata = buildPostMetadata({
      title: "Hello World",
      description: "Short excerpt",
      canonicalUrl: "https://example.com/blog/hello-world",
      ogTitle: "Hello World",
      ogDescription: "Short excerpt",
      ogImageUrl: null,
    });

    expect(metadata.twitter?.card).toBe("summary");
    expect(metadata.openGraph?.images).toBeUndefined();
  });
});
