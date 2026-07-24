import { db, closeDb } from "@/db/get-db";
import { assets } from "@/modules/assets/assets.schema";
import { categories } from "@/modules/categories/categories.schema";
import {
  canonicalizeCategorySlug,
  canonicalizeTagSlug,
  EDITORIAL_CATEGORIES,
  resolveEditorialCategoryForPost,
} from "@/modules/public/editorial-taxonomy";
import { posts, postTags } from "@/modules/posts/posts.schema";
import { isValidSlug, publicPostPath } from "@/modules/posts/slug";
import { tags } from "@/modules/tags/tags.schema";
import { loadEnvFiles } from "@/lib/load-env";

type IssueLevel = "error" | "warning";

type Issue = {
  level: IssueLevel;
  message: string;
  post?: string;
};

const STATIC_PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/blog",
  "/categories",
  "/llms-full.txt",
  "/llms.txt",
  "/robots.txt",
  "/rss.xml",
  "/search",
  "/sitemap.xml",
  "/tags",
]);

function addIssue(issues: Issue[], level: IssueLevel, message: string, post?: string) {
  issues.push({ level, message, post });
}

function extractInternalLinks(markdown: string): string[] {
  const links = new Set<string>();
  const markdownLinkPattern = /\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlHrefPattern = /href=["']([^"']+)["']/g;

  for (const pattern of [markdownLinkPattern, htmlHrefPattern]) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(markdown))) {
      const href = match[1]?.trim();
      if (!href || href.startsWith("#")) {
        continue;
      }
      if (/^(https?:|mailto:|tel:)/i.test(href)) {
        continue;
      }
      links.add(href.split("#")[0]!.replace(/\/$/, "") || "/");
    }
  }

  return [...links];
}

function slugDatePrefix(slug: string): string | null {
  return /^\d{4}-\d{2}-\d{2}/.exec(slug)?.[0] ?? null;
}

async function main() {
  loadEnvFiles();

  if (!process.env.DATABASE_URL) {
    console.log("Content validation skipped: DATABASE_URL is not set.");
    return;
  }

  const [postRows, categoryRows, tagRows, postTagRows, assetRows] = await Promise.all([
    db.select().from(posts),
    db.select().from(categories),
    db.select().from(tags),
    db.select().from(postTags),
    db.select().from(assets),
  ]);

  const issues: Issue[] = [];
  const now = new Date();
  const categoriesById = new Map(categoryRows.map((category) => [category.id, category]));
  const tagsById = new Map(tagRows.map((tag) => [tag.id, tag]));
  const assetsById = new Map(assetRows.map((asset) => [asset.id, asset]));
  const publishedPosts = postRows.filter(
    (post) => post.status === "published" && post.publishedAt && post.publishedAt <= now
  );
  const validInternalPaths = new Set([
    ...STATIC_PUBLIC_PATHS,
    ...publishedPosts.map((post) => publicPostPath(post.slug)),
    ...EDITORIAL_CATEGORIES.map((category) => `/categories/${category.slug}`),
  ]);
  const canonicalUrls = new Map<string, string>();
  const resolvedCategoryCounts: Map<string, number> = new Map(
    EDITORIAL_CATEGORIES.map((category) => [category.slug, 0])
  );

  for (const post of postRows) {
    const postLabel = `${post.title} (${post.slug})`;
    if (!isValidSlug(post.slug)) {
      addIssue(issues, "error", `Invalid post slug "${post.slug}".`, postLabel);
    }

    if (post.status === "published") {
      if (!post.publishedAt) {
        addIssue(issues, "error", "Published post is missing publishedAt.", postLabel);
      } else if (post.publishedAt > now) {
        addIssue(issues, "error", "Published post has a future publishedAt date.", postLabel);
      }

      if (!post.excerpt?.trim() && !post.seoDescription?.trim()) {
        addIssue(issues, "error", "Published post is missing a description/excerpt.", postLabel);
      }

      if (!post.contentMarkdown.trim()) {
        addIssue(issues, "error", "Published post has an empty body.", postLabel);
      }
    }

    const canonicalUrl = post.canonicalUrl?.trim() || publicPostPath(post.slug);
    const existingCanonical = canonicalUrls.get(canonicalUrl);
    if (existingCanonical) {
      addIssue(
        issues,
        "error",
        `Duplicate canonical URL "${canonicalUrl}" also used by ${existingCanonical}.`,
        postLabel
      );
    } else {
      canonicalUrls.set(canonicalUrl, postLabel);
    }

    if (post.publishedAt) {
      const datePrefix = slugDatePrefix(post.slug);
      const publishedDate = post.publishedAt.toISOString().slice(0, 10);
      if (datePrefix && datePrefix !== publishedDate) {
        addIssue(
          issues,
          "warning",
          `Slug date ${datePrefix} differs from publishedAt date ${publishedDate}.`,
          postLabel
        );
      }

      if (post.updatedAt < post.publishedAt) {
        addIssue(
          issues,
          "error",
          `updatedAt ${post.updatedAt.toISOString()} is before publishedAt ${post.publishedAt.toISOString()}.`,
          postLabel
        );
      }
    }

    if (/^#\s+\S+/m.test(post.contentMarkdown)) {
      addIssue(
        issues,
        "error",
        "Article body contains a top-level H1; the public template renders the article title.",
        postLabel
      );
    }

    const sourceCategory = post.categoryId ? categoriesById.get(post.categoryId) ?? null : null;
    const sourceTags = postTagRows
      .filter((row) => row.postId === post.id)
      .map((row) => tagsById.get(row.tagId))
      .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
    const resolvedCategory = resolveEditorialCategoryForPost(post, sourceCategory, sourceTags);
    resolvedCategoryCounts.set(
      resolvedCategory.slug,
      (resolvedCategoryCounts.get(resolvedCategory.slug) ?? 0) + 1
    );

    if (sourceCategory) {
      const canonicalCategorySlug = canonicalizeCategorySlug(sourceCategory.slug || sourceCategory.name);
      if (canonicalCategorySlug !== resolvedCategory.slug) {
        addIssue(
          issues,
          "warning",
          `Source category "${sourceCategory.name}" resolves to "${resolvedCategory.name}" for this article.`,
          postLabel
        );
      }
    } else if (post.status === "published") {
      addIssue(issues, "warning", "Published post has no source category row.", postLabel);
    }

    const canonicalTagSlugs = new Set<string>();
    for (const tag of sourceTags) {
      const canonicalSlug = canonicalizeTagSlug(tag.name || tag.slug);
      if (canonicalSlug !== tag.slug || canonicalSlug !== tag.name) {
        addIssue(
          issues,
          "error",
          `Tag "${tag.name}" / "${tag.slug}" must be migrated to canonical "${canonicalSlug}".`,
          postLabel
        );
      }
      if (canonicalTagSlugs.has(canonicalSlug)) {
        addIssue(issues, "error", `Duplicate canonical tag "${canonicalSlug}" on article.`, postLabel);
      }
      canonicalTagSlugs.add(canonicalSlug);
    }

    if (post.coverAssetId) {
      const coverAsset = assetsById.get(post.coverAssetId);
      if (!coverAsset) {
        addIssue(issues, "error", `Cover asset ${post.coverAssetId} does not exist.`, postLabel);
      } else {
        if (!coverAsset.publicUrl.trim()) {
          addIssue(issues, "error", "Cover asset is missing publicUrl.", postLabel);
        }
        if (!coverAsset.altText?.trim()) {
          addIssue(issues, "warning", "Cover asset is missing descriptive alt text.", postLabel);
        }
      }
    } else if (post.status === "published") {
      addIssue(issues, "warning", "Published post has no cover image.", postLabel);
    }

    for (const link of extractInternalLinks(post.contentMarkdown)) {
      const normalized = link.replace(/\/$/, "") || "/";
      if (!validInternalPaths.has(normalized)) {
        addIssue(issues, "error", `Broken or non-canonical internal link: ${link}`, postLabel);
      }
    }
  }

  if (publishedPosts.length > 0) {
    for (const category of EDITORIAL_CATEGORIES) {
      if ((resolvedCategoryCounts.get(category.slug) ?? 0) === 0) {
        addIssue(issues, "warning", `Editorial category "${category.name}" has no published posts.`);
      }
    }
  }

  const errors = issues.filter((issue) => issue.level === "error");
  const warnings = issues.filter((issue) => issue.level === "warning");

  console.log(
    `Content validation checked ${postRows.length} posts, ${categoryRows.length} categories, ${tagRows.length} tags, ${assetRows.length} assets.`
  );

  for (const issue of issues) {
    const prefix = issue.level === "error" ? "ERROR" : "WARN";
    console.log(`${prefix}: ${issue.post ? `${issue.post}: ` : ""}${issue.message}`);
  }

  console.log(`Content validation result: ${errors.length} errors, ${warnings.length} warnings.`);
  if (errors.length > 0) {
    process.exitCode = 1;
  }

}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
