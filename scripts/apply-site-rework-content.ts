import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { load } from "js-yaml";
import { users } from "@tgoliveira/secure-auth/drizzle/schema";
import { db, closeDb } from "@/db/get-db";
import { loadEnvFiles } from "@/lib/load-env";
import { readAdminEmail } from "@/lib/env";
import { categories } from "@/modules/categories/categories.schema";
import {
  canonicalizeCategorySlug,
  canonicalizeTagSlug,
  EDITORIAL_CATEGORIES,
  isEditorialCategorySlug,
} from "@/modules/public/editorial-taxonomy";
import { posts, postTags } from "@/modules/posts/posts.schema";
import { calculateReadingTimeMinutes } from "@/modules/posts/reading-time";
import { publicPostPath } from "@/modules/posts/slug";
import { redirects } from "@/modules/redirects/redirects.schema";
import { tags } from "@/modules/tags/tags.schema";

type ManuscriptFrontmatter = {
  title: string;
  description: string;
  date: string | Date;
  lastmod?: string | Date;
  slug: string;
  category: string;
  tags: string[];
  draft?: boolean;
};

type Manuscript = {
  filePath: string;
  metadata: ManuscriptFrontmatter;
  body: string;
};

const APPLY = process.argv.includes("--apply");

const CANONICAL_SLUG_OVERRIDES: Record<string, string> = {
  "text-to-sql-from-demo-to-production":
    "2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  "software-solution-system-architecture":
    "2023-06-16-software-solution-system-architecture",
  "a-letter-to-my-past-self": "2024-10-08-a-letter-to-my-past-self",
  "building-scaling-b2b-mobility-platform":
    "2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
  "api-security": "2023-06-04-api-security",
  "in-memory-cache": "2022-09-16-in-memory-cache",
  "evaluating-enterprise-ai-operational-trust":
    "2026-07-24-evaluating-enterprise-ai-operational-trust",
  "observability-agentic-systems": "2026-07-24-observability-agentic-systems",
};

const EXTRA_SOURCE_ALIASES: Record<string, string[]> = {
  "2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform": [
    "2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
  ],
  "2023-06-04-api-security": [
    "safeguarding-your-rest-apis",
    "2023-06-04-safeguarding-your-rest-apis",
  ],
};

function readArgValue(name: string): string | null {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length);
  }

  const index = process.argv.indexOf(name);
  if (index >= 0) {
    return process.argv[index + 1] ?? null;
  }

  return null;
}

function requireContentDir(): string {
  const contentDir = readArgValue("--content-dir") ?? process.env.SITE_REWORK_CONTENT_DIR;
  if (!contentDir) {
    throw new Error(
      "Pass --content-dir .codex-site-rework/approved-content or set SITE_REWORK_CONTENT_DIR."
    );
  }
  if (!statSync(contentDir).isDirectory()) {
    throw new Error(`Content directory not found: ${contentDir}`);
  }
  return contentDir;
}

function parseDateOnly(value: string | Date, fieldName: string): Date {
  const raw = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error(`Invalid ${fieldName}: ${raw}`);
  }
  return new Date(`${raw}T12:00:00.000Z`);
}

function splitFrontmatter(source: string, filePath: string): Manuscript {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/u.exec(source);
  if (!match) {
    throw new Error(`Missing YAML front matter: ${filePath}`);
  }

  const metadata = load(match[1]!) as ManuscriptFrontmatter;
  if (!metadata?.title || !metadata.description || !metadata.date || !metadata.slug) {
    throw new Error(`Missing required metadata in ${filePath}`);
  }
  if (!Array.isArray(metadata.tags)) {
    throw new Error(`tags must be an array in ${filePath}`);
  }

  return {
    filePath,
    metadata,
    body: stripRenderedTitle(match[2]!, metadata.title),
  };
}

function stripRenderedTitle(markdown: string, title: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const firstMeaningfulIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstMeaningfulIndex === -1) {
    return "";
  }

  const firstMeaningfulLine = lines[firstMeaningfulIndex]!.trim();
  if (firstMeaningfulLine === `# ${title}`) {
    lines.splice(firstMeaningfulIndex, 1);
    while (lines[firstMeaningfulIndex]?.trim() === "") {
      lines.splice(firstMeaningfulIndex, 1);
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function listManuscripts(contentDir: string): Manuscript[] {
  return readdirSync(contentDir)
    .filter((filename) => filename.endsWith(".md"))
    .sort()
    .map((filename) => {
      const filePath = join(contentDir, filename);
      return splitFrontmatter(readFileSync(filePath, "utf8"), filePath);
    });
}

function datedSlug(date: Date, slug: string): string {
  return `${date.toISOString().slice(0, 10)}-${slug}`;
}

function resolveCanonicalSlug(metadata: ManuscriptFrontmatter, publishedAt: Date): string {
  return CANONICAL_SLUG_OVERRIDES[metadata.slug] ?? datedSlug(publishedAt, metadata.slug);
}

async function findAuthorUserId(): Promise<string> {
  const email = (readArgValue("--author-email") ?? readAdminEmail())?.toLowerCase();
  if (!email) {
    throw new Error("Set ADMIN_EMAIL or pass --author-email before applying content.");
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error(`No user found for author/admin email ${email}. Register this user first.`);
  }

  return user.id;
}

async function ensureCategory(name: string) {
  const canonicalSlug = canonicalizeCategorySlug(name);
  if (!isEditorialCategorySlug(canonicalSlug)) {
    throw new Error(`Unsupported editorial category: ${name}`);
  }

  const editorialCategory = EDITORIAL_CATEGORIES.find(
    (category) => category.slug === canonicalSlug
  )!;
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, canonicalSlug))
    .limit(1);

  if (existing || !APPLY) {
    return existing ?? {
      id: `dry-run-category-${canonicalSlug}`,
      name: editorialCategory.name,
      slug: editorialCategory.slug,
      description: editorialCategory.description,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
  }

  const [created] = await db
    .insert(categories)
    .values({
      name: editorialCategory.name,
      slug: editorialCategory.slug,
      description: editorialCategory.description,
    })
    .returning();
  return created!;
}

async function ensureTag(slug: string) {
  const canonicalSlug = canonicalizeTagSlug(slug);
  const [existing] = await db.select().from(tags).where(eq(tags.slug, canonicalSlug)).limit(1);

  if (existing || !APPLY) {
    return existing ?? {
      id: `dry-run-tag-${canonicalSlug}`,
      name: canonicalSlug,
      slug: canonicalSlug,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
  }

  const [created] = await db
    .insert(tags)
    .values({ name: canonicalSlug, slug: canonicalSlug })
    .returning();
  return created!;
}

async function ensureRedirect(sourcePath: string, targetPath: string): Promise<boolean> {
  if (sourcePath === targetPath) {
    return false;
  }

  const [existing] = await db
    .select({ id: redirects.id })
    .from(redirects)
    .where(eq(redirects.sourcePath, sourcePath))
    .limit(1);

  if (existing || !APPLY) {
    return !existing;
  }

  await db.insert(redirects).values({
    sourcePath,
    targetPath,
    statusCode: 308,
  });
  return true;
}

async function findExistingPost(slugs: string[]) {
  for (const slug of slugs) {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
    if (post) {
      return post;
    }
  }
  return null;
}

async function applyManuscript(manuscript: Manuscript, authorUserId: string | null) {
  const { metadata } = manuscript;
  const publishedAt = parseDateOnly(metadata.date, "date");
  const updatedAt = parseDateOnly(metadata.lastmod ?? metadata.date, "lastmod");
  if (updatedAt < publishedAt) {
    throw new Error(`lastmod is before date in ${manuscript.filePath}`);
  }

  const canonicalSlug = resolveCanonicalSlug(metadata, publishedAt);
  const candidateSlugs = [
    canonicalSlug,
    metadata.slug,
    datedSlug(publishedAt, metadata.slug),
    ...(EXTRA_SOURCE_ALIASES[canonicalSlug] ?? []),
  ];
  const category = await ensureCategory(metadata.category);
  const canonicalTags = await Promise.all(metadata.tags.map((tag) => ensureTag(tag)));
  const existingPost = await findExistingPost(candidateSlugs);
  const status: "draft" | "published" = metadata.draft ? "draft" : "published";
  const postValues = {
    title: metadata.title,
    slug: canonicalSlug,
    excerpt: metadata.description,
    contentMarkdown: manuscript.body,
    contentHtmlCache: null,
    status,
    categoryId: category.id,
    publishedAt: status === "published" ? publishedAt : null,
    seoTitle: metadata.title,
    seoDescription: metadata.description,
    canonicalUrl: null,
    ogTitle: metadata.title,
    ogDescription: metadata.description,
    readingTimeMinutes: calculateReadingTimeMinutes(manuscript.body),
    updatedAt,
  };

  if (APPLY && !authorUserId) {
    throw new Error("authorUserId is required when --apply is used.");
  }

  let postId = existingPost?.id ?? null;

  if (APPLY) {
    if (existingPost) {
      const [updated] = await db
        .update(posts)
        .set({
          ...postValues,
          updatedBy: authorUserId!,
        })
        .where(eq(posts.id, existingPost.id))
        .returning({ id: posts.id });
      postId = updated?.id ?? existingPost.id;
    } else {
      const [created] = await db
        .insert(posts)
        .values({
          ...postValues,
          createdAt: publishedAt,
          createdBy: authorUserId!,
          updatedBy: authorUserId!,
        })
        .returning({ id: posts.id });
      postId = created!.id;
    }

    await db.delete(postTags).where(eq(postTags.postId, postId));
    for (const tag of canonicalTags) {
      await db.insert(postTags).values({ postId, tagId: tag.id }).onConflictDoNothing();
    }
  }

  let redirectCount = 0;
  for (const sourceSlug of candidateSlugs.filter((slug) => slug !== canonicalSlug)) {
    if (await ensureRedirect(publicPostPath(sourceSlug), publicPostPath(canonicalSlug))) {
      redirectCount += 1;
    }
    if (await ensureRedirect(`/${sourceSlug}`, publicPostPath(canonicalSlug))) {
      redirectCount += 1;
    }
  }

  return {
    title: metadata.title,
    canonicalSlug,
    status,
    existing: Boolean(existingPost),
    tagCount: canonicalTags.length,
    redirectCount,
  };
}

async function main() {
  loadEnvFiles();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const contentDir = requireContentDir();
  const manuscripts = listManuscripts(contentDir);
  const authorUserId = APPLY ? await findAuthorUserId() : null;
  const results = [];

  for (const manuscript of manuscripts) {
    results.push(await applyManuscript(manuscript, authorUserId));
  }

  console.log(APPLY ? "Applied approved site content." : "Dry-run approved site content.");
  for (const result of results) {
    console.log(
      `${result.existing ? "update" : "insert"} ${result.status}: ${result.canonicalSlug} (${result.tagCount} tags, ${result.redirectCount} redirects)`
    );
  }
  if (!APPLY) {
    console.log("Run with --apply to update the configured database.");
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
