import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { isTag } from "domhandler";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { normalizeUrlPath } from "@/lib/paths";
import { isValidSlug, normalizeSlug, slugFromTitle } from "@/modules/posts/slug";
import type { ParsedUrlPost } from "./url-post-importer.types";

const ARTICLE_SELECTORS = [
  "article",
  "main article",
  ".post",
  ".post-content",
  ".entry-content",
  ".content",
  ".markdown-body",
  "main",
];

const REMOVE_SELECTORS =
  "script, style, nav, header, footer, aside, .comments, .comment, .sidebar, .share, .social, .site-nav, .pagination";

const DATE_METADATA_SELECTORS = [
  "time",
  ".post-date",
  ".posted-on",
  ".post-meta",
  ".entry-date",
  ".entry-meta",
  ".date",
  ".metadata",
  ".post-info",
].join(", ");

const ARTICLE_HEADER_SELECTORS = [".post-header", ".entry-header", "header"].join(", ");

const DATE_TEXT_PATTERN = /\b(posted on|published on|updated on)\b/i;

const DECORATIVE_PATTERN =
  /(?:logo|avatar|icon|favicon|social|tracking|spacer|badge|emoji|gravatar|profile)/i;

const MIN_IMAGE_DIMENSION = 32;

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
  return extractArticleMainImage($, articleRoot, pageUrl, warnings);
}

export function extractArticleMainImage(
  $: cheerio.CheerioAPI,
  articleRoot: cheerio.Cheerio<AnyNode>,
  pageUrl: string,
  warnings: string[]
): string | null {
  const dateAdjacent = findImageAfterPostDate($, articleRoot, pageUrl);
  if (dateAdjacent) {
    warnings.push("Main image extracted from image below post date/metadata");
    return dateAdjacent;
  }

  const headerImage = findImageInArticleHeaderAfterDate($, articleRoot, pageUrl);
  if (headerImage) {
    warnings.push("Main image extracted from article header after date");
    return headerImage;
  }

  const articleImage = findFirstMeaningfulArticleImage($, articleRoot, pageUrl);
  if (articleImage) {
    warnings.push("Main image extracted from first article image");
    return articleImage;
  }

  const ogImage = metaContent($, "property", "og:image");
  if (ogImage) {
    warnings.push("Main image extracted from og:image fallback");
    return resolveUrl(pageUrl, ogImage);
  }

  const twitterImage = metaContent($, "name", "twitter:image");
  if (twitterImage) {
    warnings.push("Main image extracted from twitter:image fallback");
    return resolveUrl(pageUrl, twitterImage);
  }

  warnings.push("No main image found");
  return null;
}

export function findImageAfterPostDate(
  $: cheerio.CheerioAPI,
  articleRoot: cheerio.Cheerio<AnyNode>,
  pageUrl: string
): string | null {
  const dateElements = collectDateMetadataElements($, articleRoot);

  for (const scope of findPostHeaderScopes($)) {
    for (const element of collectDateMetadataElements($, scope)) {
      if (!dateElements.includes(element)) {
        dateElements.push(element);
      }
    }
  }

  const articleElement = articleRoot.get(0);

  for (const element of dateElements) {
    const imageUrl = findNearestFollowingImage($, $(element), pageUrl);
    if (imageUrl) {
      return imageUrl;
    }

    if (articleElement && isElementBeforeInDocument($, element, articleElement)) {
      const articleImage = findFirstMeaningfulArticleImage($, articleRoot, pageUrl);
      if (articleImage) {
        return articleImage;
      }
    }
  }

  return null;
}

function collectDateMetadataElements(
  $: cheerio.CheerioAPI,
  scope: cheerio.Cheerio<AnyNode>
): AnyNode[] {
  const seen = new Set<AnyNode>();
  const dateElements: AnyNode[] = [];

  const addDateElement = (element: AnyNode) => {
    if (!seen.has(element)) {
      seen.add(element);
      dateElements.push(element);
    }
  };

  scope.find(DATE_METADATA_SELECTORS).each((_, element) => {
    addDateElement(element);
  });

  scope.find("p, span, div, time").each((_, element) => {
    if (isDateMetadataElement($, element)) {
      addDateElement(element);
    }
  });

  return dateElements;
}

function findPostHeaderScopes($: cheerio.CheerioAPI): cheerio.Cheerio<AnyNode>[] {
  const scopes: cheerio.Cheerio<AnyNode>[] = [];
  const seen = new Set<AnyNode>();

  const addScope = (element: AnyNode) => {
    if (seen.has(element)) {
      return;
    }
    seen.add(element);
    scopes.push($(element));
  };

  for (const selector of [".post-heading", ".intro-header", ".post-header"]) {
    $(selector).each((_, element) => {
      if ($(element).closest("nav, footer, aside, .site-nav, article").length > 0) {
        return;
      }
      addScope(element);
    });
  }

  $("header").each((_, element) => {
    if ($(element).closest("nav, footer, aside, article").length > 0) {
      return;
    }
    if (collectDateMetadataElements($, $(element)).length === 0) {
      return;
    }
    addScope(element);
  });

  return scopes;
}

export function isElementBeforeInDocument(
  $: cheerio.CheerioAPI,
  before: AnyNode,
  after: AnyNode
): boolean {
  if (!isTag(before) || !isTag(after)) {
    return false;
  }

  const nodes: Element[] = $("body *")
    .toArray()
    .filter(isTag);

  if (!nodes.includes(after)) {
    nodes.push(after);
  }

  const beforeIndex = nodes.indexOf(before);
  const afterIndex = nodes.indexOf(after);
  return beforeIndex !== -1 && afterIndex !== -1 && beforeIndex < afterIndex;
}

function findImageInArticleHeaderAfterDate(
  $: cheerio.CheerioAPI,
  articleRoot: cheerio.Cheerio<AnyNode>,
  pageUrl: string
): string | null {
  const headers = articleRoot.find(ARTICLE_HEADER_SELECTORS);
  for (const headerElement of headers.toArray()) {
    const $header = $(headerElement);
    const dateElements = $header
      .find(DATE_METADATA_SELECTORS)
      .add(
        $header
          .find("p, span, div, time")
          .toArray()
          .filter((element) => isDateMetadataElement($, element))
      );

    for (const element of dateElements.toArray()) {
      const imageUrl = findNearestFollowingImage($, $(element), pageUrl, 3);
      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  return null;
}

function findFirstMeaningfulArticleImage(
  $: cheerio.CheerioAPI,
  articleRoot: cheerio.Cheerio<AnyNode>,
  pageUrl: string
): string | null {
  for (const element of articleRoot.find("img, picture").toArray()) {
    const imageUrl = extractImageUrlFromNode($, element, pageUrl);
    if (imageUrl && !isDecorativeImage($, element, imageUrl)) {
      return imageUrl;
    }
  }
  return null;
}

function findNearestFollowingImage(
  $: cheerio.CheerioAPI,
  $start: cheerio.Cheerio<AnyNode>,
  pageUrl: string,
  maxSiblings = 5
): string | null {
  let $sibling = $start.next();
  for (let index = 0; index < maxSiblings && $sibling.length > 0; index += 1) {
    const imageUrl = findFirstImageInSubtree($, $sibling, pageUrl);
    if (imageUrl) {
      return imageUrl;
    }
    $sibling = $sibling.next();
  }

  const $parent = $start.parent();
  if ($parent.length > 0) {
    let $parentSibling = $parent.next();
    for (let index = 0; index < maxSiblings && $parentSibling.length > 0; index += 1) {
      const imageUrl = findFirstImageInSubtree($, $parentSibling, pageUrl);
      if (imageUrl) {
        return imageUrl;
      }
      $parentSibling = $parentSibling.next();
    }
  }

  return null;
}

function findFirstImageInSubtree(
  $: cheerio.CheerioAPI,
  $root: cheerio.Cheerio<AnyNode>,
  pageUrl: string
): string | null {
  const candidates: AnyNode[] = [];

  if ($root.is("picture, img")) {
    const rootNode = $root.get(0);
    if (rootNode) {
      candidates.push(rootNode);
    }
  }

  for (const element of $root.find("picture, img").toArray()) {
    if (!candidates.includes(element)) {
      candidates.push(element);
    }
  }

  for (const element of candidates) {
    const imageUrl = extractImageUrlFromNode($, element, pageUrl);
    if (imageUrl && !isDecorativeImage($, element, imageUrl)) {
      return imageUrl;
    }
  }

  return null;
}

function isDateMetadataElement($: cheerio.CheerioAPI, element: AnyNode): boolean {
  const $element = $(element);
  const tagName = "tagName" in element && element.tagName ? element.tagName.toLowerCase() : "";

  if (tagName === "time") {
    return Boolean($element.attr("datetime") || $element.text().trim());
  }

  const classAndId = `${$element.attr("class") ?? ""} ${$element.attr("id") ?? ""}`;
  if (/(post-meta|post-date|posted-on|entry-date|entry-meta|post-info)/i.test(classAndId)) {
    return true;
  }

  const text = $element.text().replace(/\s+/g, " ").trim();
  if (!text || text.length > 120) {
    return false;
  }

  return DATE_TEXT_PATTERN.test(text);
}

function isDecorativeImage(
  $: cheerio.CheerioAPI,
  element: AnyNode,
  imageUrl: string
): boolean {
  const $element = $(element);
  const img =
    $element.is("img") ? $element : $element.find("img").first();

  const classAndId = `${img.attr("class") ?? ""} ${img.attr("id") ?? ""} ${img.attr("alt") ?? ""}`;
  if (DECORATIVE_PATTERN.test(classAndId)) {
    return true;
  }

  if (isDecorativeImageUrl(imageUrl)) {
    return true;
  }

  const width = Number(img.attr("width"));
  const height = Number(img.attr("height"));
  if (
    (Number.isFinite(width) && width > 0 && width < MIN_IMAGE_DIMENSION) ||
    (Number.isFinite(height) && height > 0 && height < MIN_IMAGE_DIMENSION)
  ) {
    return true;
  }

  if ($element.closest("nav, header, footer, aside").length > 0) {
    return true;
  }

  return false;
}

function isDecorativeImageUrl(imageUrl: string): boolean {
  try {
    const basename = new URL(imageUrl).pathname.split("/").pop() ?? "";
    return /^(?:site-)?(?:logo|favicon|avatar|icon|social|badge|gravatar|spacer|pixel)(?:[.-]|$)/i.test(
      basename
    );
  } catch {
    return false;
  }
}

function extractImageUrlFromNode(
  $: cheerio.CheerioAPI,
  element: AnyNode,
  pageUrl: string
): string | null {
  const $element = $(element);

  if ($element.is("picture")) {
    const sourceSrcset = $element.find("source[srcset]").first().attr("srcset");
    const pictureImg = $element.find("img").first();
    const candidate =
      pickSrcsetUrl(sourceSrcset) ??
      pickSrcsetUrl(pictureImg.attr("srcset")) ??
      pictureImg.attr("src") ??
      pictureImg.attr("data-src") ??
      pictureImg.attr("data-original");
    return candidate ? resolveUrl(pageUrl, candidate) : null;
  }

  const src =
    $element.attr("src") ??
    $element.attr("data-src") ??
    $element.attr("data-original") ??
    $element.attr("data-lazy-src") ??
    pickSrcsetUrl($element.attr("srcset"));

  return src ? resolveUrl(pageUrl, src.trim()) : null;
}

function pickSrcsetUrl(srcset: string | undefined): string | null {
  if (!srcset) {
    return null;
  }

  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/);
      const widthMatch = descriptor?.match(/(\d+)w/);
      return {
        url: url ?? "",
        width: widthMatch ? Number(widthMatch[1]) : 0,
      };
    })
    .filter((entry) => entry.url);

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((left, right) => right.width - left.width);
  return candidates[0]?.url ?? null;
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
