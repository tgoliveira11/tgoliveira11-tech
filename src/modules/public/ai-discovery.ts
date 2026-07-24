import type { BlogConfig } from "./blog-config";
import { ABOUT_PAGE_CONTENT, ABOUT_PAGE_PATH } from "./about-content";
import { PUBLIC_AUTHOR_PROFILE } from "./author-profile";
import { PROFESSIONAL_HEADLINE } from "./editorial-taxonomy";
import type { PublicPostBundle } from "./public-posts.repository";
import { getPublicSiteDescription, getPublicSiteTitle } from "./public-site-config";
import { publicPostPath } from "@/modules/posts/slug";

export const LLMS_TXT_PATH = "/llms.txt" as const;
export const LLMS_FULL_TXT_PATH = "/llms-full.txt" as const;

export type AiDiscoverySource = {
  config: BlogConfig;
  posts: PublicPostBundle[];
  tags: Array<{ name: string; slug: string; postCount?: number }>;
  categories: Array<{ name: string; slug: string; description?: string | null; postCount?: number }>;
};

function baseUrl(config: BlogConfig): string {
  return config.baseUrl.replace(/\/$/, "");
}

function absoluteUrl(config: BlogConfig, path: string): string {
  return `${baseUrl(config)}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function formatDate(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : "unpublished";
}

function formatTags(tags: PublicPostBundle["tags"]): string {
  return tags.length > 0 ? tags.map((tag) => tag.name).join(", ") : "none";
}

function articleUrl(config: BlogConfig, bundle: PublicPostBundle): string {
  return absoluteUrl(config, publicPostPath(bundle.post.slug));
}

function renderPublicPages(config: BlogConfig): string {
  return [
    `- [Home](${absoluteUrl(config, "/")})`,
    `- [Articles](${absoluteUrl(config, "/blog")})`,
    `- [Categories](${absoluteUrl(config, "/categories")})`,
    `- [Tags](${absoluteUrl(config, "/tags")})`,
    `- [Search](${absoluteUrl(config, "/search")})`,
    `- [About](${absoluteUrl(config, ABOUT_PAGE_PATH)})`,
    `- [RSS](${absoluteUrl(config, "/rss.xml")})`,
    `- [Sitemap](${absoluteUrl(config, "/sitemap.xml")})`,
    `- [Full AI content](${absoluteUrl(config, LLMS_FULL_TXT_PATH)})`,
  ].join("\n");
}

function renderArticleIndex(config: BlogConfig, posts: PublicPostBundle[]): string {
  if (posts.length === 0) {
    return "- No published articles yet.";
  }

  return posts
    .map((bundle) => {
      const excerpt = normalizeText(bundle.post.excerpt);
      const category = bundle.category?.name ?? "Uncategorized";
      const summary = excerpt ? ` - ${excerpt}` : "";
      return `- [${bundle.post.title}](${articleUrl(config, bundle)})${summary} Category: ${category}. Tags: ${formatTags(bundle.tags)}. Updated: ${formatDate(bundle.post.updatedAt)}.`;
    })
    .join("\n");
}

function renderTaxonomy(
  config: BlogConfig,
  path: "categories" | "tags",
  items: Array<{ name: string; slug: string; description?: string | null; postCount?: number }>
): string {
  if (items.length === 0) {
    return "- No public taxonomy entries yet.";
  }

  return items
    .map((item) => {
      const count = typeof item.postCount === "number" ? ` (${item.postCount} posts)` : "";
      const description = item.description ? ` - ${item.description}` : "";
      return `- [${item.name}](${absoluteUrl(config, `/${path}/${item.slug}`)})${count}${description}`;
    })
    .join("\n");
}

export function buildLlmsTxt(source: AiDiscoverySource): string {
  const siteTitle = getPublicSiteTitle(source.config);
  const siteDescription = getPublicSiteDescription(source.config);

  return `# ${siteTitle}

> ${siteDescription}

This file is a concise, AI-readable map of the public content on ${baseUrl(source.config)}.

## Site

- Canonical URL: ${baseUrl(source.config)}
- Language: en
- Author: ${PUBLIC_AUTHOR_PROFILE.fullName}
- Role: ${PUBLIC_AUTHOR_PROFILE.title}
- Focus: ${PROFESSIONAL_HEADLINE}

## Public Pages

${renderPublicPages(source.config)}

## Editorial Categories

${renderTaxonomy(source.config, "categories", source.categories)}

## Tags

${renderTaxonomy(source.config, "tags", source.tags)}

## Published Articles

${renderArticleIndex(source.config, source.posts)}
`;
}

export function buildLlmsFullTxt(source: AiDiscoverySource): string {
  const intro = ABOUT_PAGE_CONTENT.intro.map((paragraph) => `- ${paragraph}`).join("\n");
  const articles = source.posts
    .map((bundle) => {
      const excerpt = normalizeText(bundle.post.excerpt);
      const content = normalizeText(bundle.post.contentMarkdown);

      return `## ${bundle.post.title}

URL: ${articleUrl(source.config, bundle)}
Published: ${formatDate(bundle.post.publishedAt)}
Updated: ${formatDate(bundle.post.updatedAt)}
Category: ${bundle.category?.name ?? "Uncategorized"}
Tags: ${formatTags(bundle.tags)}
Excerpt: ${excerpt || "No excerpt provided."}

${content || "No article body available."}`;
    })
    .join("\n\n---\n\n");

  return `# ${getPublicSiteTitle(source.config)} - Full Public Content

This file mirrors the public, indexable content map for AI assistants and browser agents.

## About

${ABOUT_PAGE_CONTENT.metadata.description}

${intro}

## Public Pages

${renderPublicPages(source.config)}

## Articles

${articles || "No published articles yet."}
`;
}

