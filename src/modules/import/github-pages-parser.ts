import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { isValidSlug, normalizeSlug, slugFromTitle } from "@/modules/posts/slug";
import {
  KNOWN_FRONTMATTER_FIELDS,
  normalizeTagOrCategoryList,
  normalizeUrlPath,
} from "./github-pages.validation";
import type { LegacySourceStatus, ParsedLegacyPost } from "./github-pages.types";

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "1"].includes(normalized)) return true;
    if (["false", "no", "0"].includes(normalized)) return false;
  }
  return undefined;
}

export function parseLegacyDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function deriveSlugFromPermalink(permalink: string): string | null {
  const normalized = normalizeUrlPath(permalink);
  const segments = normalized.split("/").filter(Boolean);
  const last = segments.at(-1);
  if (!last) return null;
  const slug = normalizeSlug(last);
  return isValidSlug(slug) ? slug : null;
}

export function deriveSlugFromFilename(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  const withoutDate = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const slug = normalizeSlug(withoutDate);
  return isValidSlug(slug) ? slug : slugFromTitle(withoutDate || base);
}

export function deriveLegacySourceStatus(data: Record<string, unknown>): LegacySourceStatus {
  const draft = parseBoolean(data.draft);
  const published = parseBoolean(data.published);

  if (draft === true) return "draft";
  if (published === false) return "draft";
  if (published === true) return "published";
  if (draft === false) return "published";
  return "unknown";
}

export function deriveOldPaths(input: {
  relativePath: string;
  permalink?: unknown;
  slug: string;
  publishedAt: Date | null;
}): string[] {
  const paths = new Set<string>();

  if (typeof input.permalink === "string" && input.permalink.trim()) {
    paths.add(normalizeUrlPath(input.permalink));
  }

  const relative = input.relativePath.replace(/\\/g, "/");
  const withoutExt = relative.replace(/\.(md|markdown)$/i, "");
  if (withoutExt) {
    paths.add(normalizeUrlPath(withoutExt));
    if (withoutExt.endsWith("/index")) {
      paths.add(normalizeUrlPath(withoutExt.slice(0, -"/index".length)));
    }
  }

  const postMatch = relative.match(/(?:^|\/)_posts\/(\d{4})-(\d{2})-(\d{2})-([^/]+)\.(?:md|markdown)$/i);
  if (postMatch) {
    const [, year, month, day, slugPart] = postMatch;
    paths.add(normalizeUrlPath(`/${year}/${month}/${day}/${slugPart}`));
    paths.add(normalizeUrlPath(`/${slugPart}`));
  }

  if (input.publishedAt) {
    const year = input.publishedAt.getUTCFullYear();
    const month = String(input.publishedAt.getUTCMonth() + 1).padStart(2, "0");
    const day = String(input.publishedAt.getUTCDate()).padStart(2, "0");
    paths.add(normalizeUrlPath(`/${year}/${month}/${day}/${input.slug}`));
  }

  return [...paths];
}

export function deriveDesiredSlug(data: Record<string, unknown>, filePath: string): string {
  if (typeof data.slug === "string" && data.slug.trim()) {
    const slug = normalizeSlug(data.slug);
    if (isValidSlug(slug)) return slug;
  }

  if (typeof data.permalink === "string" && data.permalink.trim()) {
    const fromPermalink = deriveSlugFromPermalink(data.permalink);
    if (fromPermalink) return fromPermalink;
  }

  return deriveSlugFromFilename(filePath);
}

function readFrontmatterString(data: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function parseLegacyMarkdownFile(
  sourceRoot: string,
  filePath: string
): ParsedLegacyPost {
  const relativePath = path.relative(sourceRoot, filePath).replace(/\\/g, "/");
  const raw = matter.read(filePath);
  const data = raw.data as Record<string, unknown>;
  const warnings: string[] = [];
  const errors: string[] = [];

  const unsupportedFrontmatter = Object.keys(data).filter(
    (key) => !KNOWN_FRONTMATTER_FIELDS.has(key) && !KNOWN_FRONTMATTER_FIELDS.has(key.toLowerCase())
  );

  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    deriveSlugFromFilename(filePath).replace(/-/g, " ");

  const desiredSlug = deriveDesiredSlug(data, filePath);
  if (!isValidSlug(desiredSlug)) {
    errors.push(`Invalid slug derived: ${desiredSlug}`);
  }

  const publishedAt = parseLegacyDate(data.date);
  const sourceStatus = deriveLegacySourceStatus(data);
  const excerpt =
    readFrontmatterString(data, ["excerpt", "description"]) ??
    raw.excerpt?.trim() ??
    null;

  const tags = normalizeTagOrCategoryList(data.tags);
  const categories = [
    ...normalizeTagOrCategoryList(data.categories),
    ...normalizeTagOrCategoryList(data.category),
  ];

  const coverImageRef =
    readFrontmatterString(data, ["cover", "coverImage", "coverimage", "image"]) ?? null;
  const ogImageRef = readFrontmatterString(data, ["ogImage", "ogimage"]) ?? null;

  const oldPaths = deriveOldPaths({
    relativePath,
    permalink: data.permalink,
    slug: desiredSlug,
    publishedAt,
  });

  if (sourceStatus === "published" && !publishedAt) {
    warnings.push("Frontmatter marks post as published but no valid date was found.");
  }

  return {
    sourcePath: filePath,
    relativePath,
    title,
    desiredSlug,
    excerpt,
    contentMarkdown: raw.content.trim(),
    publishedAt,
    sourceStatus,
    tags,
    categories: [...new Set(categories)],
    coverImageRef,
    ogImageRef,
    oldPaths,
    unsupportedFrontmatter,
    warnings,
    errors,
  };
}

export async function collectMarkdownFiles(sourceRoot: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (/\.(md|markdown)$/i.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  await walk(sourceRoot);
  return results.sort();
}

export async function readLegacyMarkdownFiles(sourceRoot: string): Promise<ParsedLegacyPost[]> {
  const files = await collectMarkdownFiles(sourceRoot);
  return files.map((filePath) => parseLegacyMarkdownFile(sourceRoot, filePath));
}
