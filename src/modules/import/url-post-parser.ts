import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { normalizeUrlPath } from "@/lib/paths";
import { isValidSlug, normalizeSlug, slugFromTitle } from "@/modules/posts/slug";
import type { ParsedUrlPost } from "./url-post-importer.types";

const ARTICLE_SELECTORS = [
  "article",
  "main article",
  ".post-content",
  ".entry-content",
  ".content",
  ".markdown-body",
  "main",
];

const REMOVE_SELECTORS =
  "script, style, nav, header, footer, aside, .comments, .comment, .sidebar, .share, .social, .site-nav, .pagination";

let turndownService: TurndownService | null = null;

function getTurndownService(): TurndownService {
  if (!turndownService) {
    turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
    });
    turndownService.use(gfm);
    turndownService.remove(["script", "style", "nav", "header", "footer"]);
  }
  return turndownService;
}

export function extractSlugFromUrl(url: string): string {
  const parsed = new URL(url);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1) ?? "imported-post";
  let decoded = decodeURIComponent(lastSegment);
  decoded = decoded.replace(/\.(html?|md|markdown)$/i, "");
  const slug = normalizeSlug(decoded);
  if (isValidSlug(slug)) {
    return slug;
  }
  const fallback = normalizeSlug(slugFromTitle(decoded));
  return isValidSlug(fallback) ? fallback : "imported-post";
}

export function parseUrlPostHtml(input: { html: string; finalUrl: string }): ParsedUrlPost {
  const $ = cheerio.load(input.html);
  const warnings: string[] = [];
  const finalUrl = input.finalUrl;
  const parsedUrl = new URL(finalUrl);

  const articleRoot = findArticleRoot($, warnings);
  const articleClone = articleRoot.clone();
  articleClone.find(REMOVE_SELECTORS).remove();

  const title = extractTitle($, articleRoot, finalUrl, warnings);
  const excerpt = extractExcerpt($, articleRoot, warnings);
  const slug = extractSlugFromUrl(finalUrl);
  const mainImageUrl = extractMainImageUrl($, articleRoot, finalUrl, warnings);
  const contentHtml = articleClone.html()?.trim() ?? "";
  const contentMarkdown = htmlToMarkdown(contentHtml);

  if (!contentMarkdown.trim()) {
    warnings.push("No article content could be extracted from the page");
  }

  const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() ?? null;

  return {
    finalUrl,
    sourceHost: parsedUrl.hostname,
    sourcePath: normalizeUrlPath(parsedUrl.pathname),
    canonicalUrl,
    title,
    excerpt,
    slug,
    contentHtml,
    contentMarkdown,
    mainImageUrl,
    warnings,
  };
}

function findArticleRoot($: cheerio.CheerioAPI, warnings: string[]): cheerio.Cheerio<AnyNode> {
  for (const selector of ARTICLE_SELECTORS) {
    const candidate = $(selector).first();
    if (candidate.length > 0 && candidate.text().replace(/\s+/g, " ").trim().length >= 80) {
      return candidate;
    }
  }

  warnings.push("Article container not found; used page body fallback");
  const body = $("body");
  body.find(REMOVE_SELECTORS).remove();
  return body;
}

function extractTitle(
  $: cheerio.CheerioAPI,
  articleRoot: cheerio.Cheerio<AnyNode>,
  finalUrl: string,
  warnings: string[]
): string {
  const h1 = articleRoot.find("h1").first().text().replace(/\s+/g, " ").trim();
  if (h1) return h1;

  const ogTitle = metaContent($, "property", "og:title");
  if (ogTitle) {
    warnings.push("Title extracted from og:title");
    return ogTitle;
  }

  const twitterTitle = metaContent($, "name", "twitter:title");
  if (twitterTitle) {
    warnings.push("Title extracted from twitter:title");
    return twitterTitle;
  }

  const documentTitle = $("title").first().text().replace(/\s+/g, " ").trim();
  if (documentTitle) {
    warnings.push("Title extracted from document title");
    return documentTitle;
  }

  warnings.push("Title derived from URL slug");
  return slugFromTitle(extractSlugFromUrl(finalUrl)).replace(/-/g, " ");
}

function extractExcerpt(
  $: cheerio.CheerioAPI,
  articleRoot: cheerio.Cheerio<AnyNode>,
  warnings: string[]
): string {
  const h1 = articleRoot.find("h1").first();
  if (h1.length > 0) {
    const subtitle = h1.nextAll("h2").first().text().replace(/\s+/g, " ").trim();
    if (subtitle) {
      return subtitle;
    }
  }

  const metaDescription = metaContent($, "name", "description");
  if (metaDescription) {
    warnings.push("Excerpt extracted from meta description");
    return metaDescription;
  }

  const ogDescription = metaContent($, "property", "og:description");
  if (ogDescription) {
    warnings.push("Excerpt extracted from og:description");
    return ogDescription;
  }

  const firstParagraph = articleRoot
    .find("p")
    .toArray()
    .map((element) => $(element).text().replace(/\s+/g, " ").trim())
    .find((text) => text.length >= 40);

  if (firstParagraph) {
    warnings.push("Excerpt extracted from first paragraph");
    return firstParagraph.slice(0, 1000);
  }

  return "";
}

export function extractMainImageUrl(
  $: cheerio.CheerioAPI,
  articleRoot: cheerio.Cheerio<AnyNode>,
  pageUrl: string,
  warnings: string[]
): string | null {
  const ogImage = metaContent($, "property", "og:image");
  if (ogImage) {
    return resolveUrl(pageUrl, ogImage);
  }

  const twitterImage = metaContent($, "name", "twitter:image");
  if (twitterImage) {
    return resolveUrl(pageUrl, twitterImage);
  }

  const firstArticleImage = articleRoot
    .find("img")
    .toArray()
    .map((element) => $(element).attr("src")?.trim())
    .find(Boolean);

  if (firstArticleImage) {
    warnings.push("Main image extracted from first article image");
    return resolveUrl(pageUrl, firstArticleImage);
  }

  warnings.push("No main image found");
  return null;
}

function metaContent(
  $: cheerio.CheerioAPI,
  attribute: "name" | "property",
  value: string
): string | null {
  const content = $(`meta[${attribute}="${value}"]`).attr("content")?.trim();
  return content || null;
}

export function resolveUrl(baseUrl: string, candidate: string): string {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return candidate;
  }
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim()) {
    return "";
  }
  return getTurndownService().turndown(html).trim();
}

export function rewriteMarkdownImageUrl(
  markdown: string,
  sourceUrl: string,
  publicUrl: string
): string {
  const escaped = sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(!\\[[^\\]]*\\]\\()${escaped}(\\))`, "g");
  return markdown.replace(pattern, `$1${publicUrl}$2`);
}
