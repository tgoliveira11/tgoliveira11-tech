import { and, eq } from "drizzle-orm";
import { db, closeDb } from "@/db/get-db";
import { categories } from "@/modules/categories/categories.schema";
import {
  canonicalizeCategorySlug,
  canonicalizeTagSlug,
  EDITORIAL_CATEGORIES,
  getCanonicalPostAliasTarget,
  resolveEditorialCategoryForPost,
} from "@/modules/public/editorial-taxonomy";
import { postTags, posts } from "@/modules/posts/posts.schema";
import { publicPostPath } from "@/modules/posts/slug";
import { redirects } from "@/modules/redirects/redirects.schema";
import { tags } from "@/modules/tags/tags.schema";
import { loadEnvFiles } from "@/lib/load-env";

type ExistingCategory = typeof categories.$inferSelect;
type ExistingTag = typeof tags.$inferSelect;

const APPLY = process.argv.includes("--apply");

function redirectSource(path: string): string {
  return path.replace(/\/$/, "") || "/";
}

async function ensureRedirect(sourcePath: string, targetPath: string) {
  if (sourcePath === targetPath) {
    return;
  }

  const [existing] = await db
    .select({ id: redirects.id })
    .from(redirects)
    .where(eq(redirects.sourcePath, sourcePath))
    .limit(1);

  if (existing || !APPLY) {
    return;
  }

  await db.insert(redirects).values({
    sourcePath,
    targetPath,
    statusCode: 308,
  });
}

async function ensureEditorialCategories(
  existingCategories: ExistingCategory[]
): Promise<Map<string, ExistingCategory>> {
  const bySlug = new Map(existingCategories.map((category) => [category.slug, category]));
  const byCanonicalSlug = new Map<string, ExistingCategory>();

  for (const editorialCategory of EDITORIAL_CATEGORIES) {
    const existing = bySlug.get(editorialCategory.slug);
    if (existing) {
      byCanonicalSlug.set(editorialCategory.slug, existing);
      if (
        APPLY &&
        (existing.name !== editorialCategory.name ||
          existing.description !== editorialCategory.description)
      ) {
        const [updated] = await db
          .update(categories)
          .set({
            name: editorialCategory.name,
            description: editorialCategory.description,
            updatedAt: new Date(),
          })
          .where(eq(categories.id, existing.id))
          .returning();
        byCanonicalSlug.set(editorialCategory.slug, updated ?? existing);
      }
      continue;
    }

    if (!APPLY) {
      byCanonicalSlug.set(editorialCategory.slug, {
        id: `dry-run-${editorialCategory.slug}`,
        name: editorialCategory.name,
        slug: editorialCategory.slug,
        description: editorialCategory.description,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      });
      continue;
    }

    const [inserted] = await db
      .insert(categories)
      .values({
        name: editorialCategory.name,
        slug: editorialCategory.slug,
        description: editorialCategory.description,
      })
      .returning();
    byCanonicalSlug.set(editorialCategory.slug, inserted!);
  }

  return byCanonicalSlug;
}

async function ensureCanonicalTags(existingTags: ExistingTag[]): Promise<Map<string, ExistingTag>> {
  const groups = new Map<string, ExistingTag[]>();
  for (const tag of existingTags) {
    const canonicalSlug = canonicalizeTagSlug(tag.name || tag.slug);
    groups.set(canonicalSlug, [...(groups.get(canonicalSlug) ?? []), tag]);
  }

  const canonicalBySlug = new Map<string, ExistingTag>();

  for (const [canonicalSlug, group] of groups) {
    const keep =
      group.find((tag) => tag.slug === canonicalSlug && tag.name === canonicalSlug) ?? group[0]!;
    canonicalBySlug.set(canonicalSlug, keep);

    if (!APPLY) {
      continue;
    }

    if (keep.slug !== canonicalSlug || keep.name !== canonicalSlug) {
      const [updated] = await db
        .update(tags)
        .set({ name: canonicalSlug, slug: canonicalSlug, updatedAt: new Date() })
        .where(eq(tags.id, keep.id))
        .returning();
      canonicalBySlug.set(canonicalSlug, updated ?? keep);
    }
  }

  return canonicalBySlug;
}

async function main() {
  loadEnvFiles();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for taxonomy migration.");
  }

  const [categoryRows, tagRows, postRows, postTagRows] = await Promise.all([
    db.select().from(categories),
    db.select().from(tags),
    db.select().from(posts),
    db.select().from(postTags),
  ]);

  const canonicalCategories = await ensureEditorialCategories(categoryRows);
  const canonicalTags = await ensureCanonicalTags(tagRows);
  const categoriesById = new Map(categoryRows.map((category) => [category.id, category]));
  const tagsById = new Map(tagRows.map((tag) => [tag.id, tag]));
  let categoryUpdates = 0;
  let tagLinksInserted = 0;
  let tagLinksDeleted = 0;
  let redirectsAdded = 0;

  for (const category of categoryRows) {
    const canonicalSlug = canonicalizeCategorySlug(category.slug || category.name);
    if (canonicalSlug !== category.slug) {
      await ensureRedirect(
        redirectSource(`/categories/${category.slug}`),
        `/categories/${canonicalSlug}`
      );
      redirectsAdded += 1;
    }
  }

  for (const tag of tagRows) {
    const canonicalSlug = canonicalizeTagSlug(tag.name || tag.slug);
    if (canonicalSlug !== tag.slug) {
      await ensureRedirect(redirectSource(`/tags/${tag.slug}`), `/tags/${canonicalSlug}`);
      redirectsAdded += 1;
    }
  }

  for (const post of postRows) {
    const sourceCategory = post.categoryId ? categoriesById.get(post.categoryId) ?? null : null;
    const sourceTags = postTagRows
      .filter((row) => row.postId === post.id)
      .map((row) => tagsById.get(row.tagId))
      .filter((tag): tag is ExistingTag => Boolean(tag));
    const resolvedCategory = resolveEditorialCategoryForPost(post, sourceCategory, sourceTags);
    const canonicalCategory = canonicalCategories.get(resolvedCategory.slug);

    if (canonicalCategory && post.categoryId !== canonicalCategory.id) {
      categoryUpdates += 1;
      if (APPLY) {
        await db
          .update(posts)
          .set({ categoryId: canonicalCategory.id, updatedAt: new Date() })
          .where(eq(posts.id, post.id));
      }
    }

    for (const row of postTagRows.filter((candidate) => candidate.postId === post.id)) {
      const tag = tagsById.get(row.tagId);
      if (!tag) {
        continue;
      }

      const canonicalSlug = canonicalizeTagSlug(tag.name || tag.slug);
      const canonicalTag = canonicalTags.get(canonicalSlug);
      if (!canonicalTag || canonicalTag.id === row.tagId) {
        continue;
      }

      tagLinksInserted += 1;
      tagLinksDeleted += 1;

      if (APPLY) {
        await db
          .insert(postTags)
          .values({ postId: post.id, tagId: canonicalTag.id })
          .onConflictDoNothing();
        await db
          .delete(postTags)
          .where(and(eq(postTags.postId, post.id), eq(postTags.tagId, row.tagId)));
      }
    }

    const aliasTarget = getCanonicalPostAliasTarget(post.slug);
    if (aliasTarget && aliasTarget !== post.slug) {
      await ensureRedirect(publicPostPath(post.slug), publicPostPath(aliasTarget));
      redirectsAdded += 1;
    }
  }

  if (APPLY) {
    for (const tag of tagRows) {
      const canonicalSlug = canonicalizeTagSlug(tag.name || tag.slug);
      const canonicalTag = canonicalTags.get(canonicalSlug);
      if (!canonicalTag || canonicalTag.id === tag.id) {
        continue;
      }

      await db.delete(tags).where(eq(tags.id, tag.id));
    }
  }

  console.log(APPLY ? "Applied taxonomy migration." : "Dry-run taxonomy migration.");
  console.log(`Canonical categories ensured: ${EDITORIAL_CATEGORIES.length}`);
  console.log(`Post category updates: ${categoryUpdates}`);
  console.log(`Tag links to insert: ${tagLinksInserted}`);
  console.log(`Tag links to delete: ${tagLinksDeleted}`);
  console.log(`Redirects to ensure: ${redirectsAdded}`);
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
