import { and, asc, desc, eq, isNotNull, ne, sql } from "drizzle-orm";
import { buildPaginatedResult, type PaginatedResult } from "@/lib/pagination";
import { db } from "@/db/get-db";
import { categories } from "@/modules/categories/categories.schema";
import type { Category } from "@/modules/categories/categories.types";
import { assets } from "@/modules/assets/assets.schema";
import type { Asset } from "@/modules/assets/assets.types";
import { postTags, posts } from "@/modules/posts/posts.schema";
import { publishedPostFilter } from "@/modules/posts/posts.repository";
import type { Post } from "@/modules/posts/posts.types";
import { tags } from "@/modules/tags/tags.schema";
import type { Tag } from "@/modules/tags/tags.types";
import {
  canonicalizeCategorySlug,
  canonicalizeTag,
  canonicalizeTagList,
  canonicalizeTagSlug,
  EDITORIAL_CATEGORIES,
  getEditorialCategoryBySlug,
  isEditorialCategorySlug,
  resolveEditorialCategoryForPost,
  toCategoryRecord,
} from "./editorial-taxonomy";
import {
  comparePublicPostOrder,
  findPublicPostNeighbors,
  getPublicPostOrderBy,
} from "./public-post-order";

export type { PaginatedResult } from "@/lib/pagination";
export type PublicPostBundle = {
  post: Post;
  category: Category | null;
  tags: Tag[];
  coverAsset: Asset | null;
};

export type PopularTag = Tag & {
  postCount: number;
};

export type PopularCategory = Category & {
  postCount: number;
};

export async function countPublishedPosts(options?: { excludePostId?: string }): Promise<number> {
  const where = options?.excludePostId
    ? and(publishedPostFilter(), ne(posts.id, options.excludePostId))
    : publishedPostFilter();

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(where);
  return Number(row?.count ?? 0);
}

export async function listPublishedPostBundles(
  options: { limit?: number; offset?: number; excludePostId?: string } = {}
): Promise<PublicPostBundle[]> {
  const where = options.excludePostId
    ? and(publishedPostFilter(), ne(posts.id, options.excludePostId))
    : publishedPostFilter();

  const rows = await db
    .select()
    .from(posts)
    .where(where)
    .orderBy(...getPublicPostOrderBy())
    .limit(options.limit ?? 12)
    .offset(options.offset ?? 0);

  return Promise.all(rows.map((post) => hydratePostBundle(post)));
}

export async function listPublishedPostBundlesPaginated(options: {
  page: number;
  pageSize: number;
  excludePostId?: string;
}): Promise<PaginatedResult<PublicPostBundle>> {
  const offset = (options.page - 1) * options.pageSize;
  const where = options.excludePostId
    ? and(publishedPostFilter(), ne(posts.id, options.excludePostId))
    : publishedPostFilter();

  const [rows, totalItems] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(where)
      .orderBy(...getPublicPostOrderBy())
      .limit(options.pageSize)
      .offset(offset),
    countPublishedPosts({ excludePostId: options.excludePostId }),
  ]);

  const items = await Promise.all(rows.map((post) => hydratePostBundle(post)));

  return buildPaginatedResult(items, {
    page: options.page,
    pageSize: options.pageSize,
    totalItems,
  });
}

export async function getPublishedPostBundleBySlug(slug: string): Promise<PublicPostBundle | null> {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), publishedPostFilter()))
    .limit(1);

  if (!post) return null;
  return hydratePostBundle(post);
}

export async function searchPublishedPostBundles(
  query: string,
  options: { limit?: number; offset?: number } = {}
): Promise<PublicPostBundle[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        publishedPostFilter(),
        sql`to_tsvector('english', coalesce(${posts.title}, '') || ' ' || coalesce(${posts.excerpt}, '') || ' ' || coalesce(${posts.contentMarkdown}, '')) @@ plainto_tsquery('english', ${trimmed})`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(options.limit ?? 12)
    .offset(options.offset ?? 0);

  return Promise.all(rows.map((post) => hydratePostBundle(post)));
}

export async function listPublishedPostBundlesByCategorySlug(
  categorySlug: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ category: Category; posts: PublicPostBundle[] } | null> {
  const canonicalSlug = canonicalizeCategorySlug(categorySlug);
  if (!isEditorialCategorySlug(canonicalSlug)) {
    return null;
  }

  const category = toCategoryRecord(getEditorialCategoryBySlug(canonicalSlug)!);
  const bundles = await listPublishedPostBundles({ limit: 1000 });
  const filtered = bundles.filter((bundle) => bundle.category?.slug === canonicalSlug);
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 12;

  return { category, posts: filtered.slice(offset, offset + limit) };
}

export async function listPublishedPostBundlesByTagSlug(
  tagSlug: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ tag: Tag; posts: PublicPostBundle[] } | null> {
  const canonicalSlug = canonicalizeTagSlug(tagSlug);
  const bundles = await listPublishedPostBundles({ limit: 1000 });
  const filtered = bundles.filter((bundle) =>
    bundle.tags.some((tag) => tag.slug === canonicalSlug)
  );

  if (filtered.length === 0) {
    return null;
  }

  const offset = options.offset ?? 0;
  const limit = options.limit ?? 12;
  const tag =
    filtered.flatMap((bundle) => bundle.tags).find((candidate) => candidate.slug === canonicalSlug) ??
    ({
      id: `canonical-${canonicalSlug}`,
      name: canonicalSlug,
      slug: canonicalSlug,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } satisfies Tag);

  return { tag, posts: filtered.slice(offset, offset + limit) };
}

export async function listPublicTags(): Promise<PopularTag[]> {
  const rows = await db
    .select({ tag: tags, postId: posts.id })
    .from(tags)
    .innerJoin(postTags, eq(tags.id, postTags.tagId))
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(publishedPostFilter());

  const grouped = new Map<string, Tag & { postIds: Set<string> }>();

  for (const row of rows) {
    const canonical = canonicalizeTag(row.tag);
    const existing = grouped.get(canonical.slug);
    if (existing) {
      existing.postIds.add(row.postId);
      if (row.tag.updatedAt > existing.updatedAt) {
        existing.updatedAt = row.tag.updatedAt;
      }
      continue;
    }

    grouped.set(canonical.slug, {
      ...canonical,
      id: `canonical-${canonical.slug}`,
      postIds: new Set([row.postId]),
    });
  }

  return [...grouped.values()]
    .map(({ postIds, ...tag }) => ({
      ...tag,
      postCount: postIds.size,
    }))
    .sort((left, right) => {
      if (right.postCount !== left.postCount) {
        return right.postCount - left.postCount;
      }
      return left.name.localeCompare(right.name);
    });
}

export async function listPopularTags(limit: number): Promise<PopularTag[]> {
  const rows = await listPublicTags();
  return rows.slice(0, limit);
}

export async function listPublicCategories(): Promise<PopularCategory[]> {
  const bundles = await listPublishedPostBundles({ limit: 1000 });
  const grouped = new Map<string, PopularCategory>(
    EDITORIAL_CATEGORIES.map((category) => [
      category.slug,
      {
        ...toCategoryRecord(category),
        postCount: 0,
      },
    ])
  );

  for (const bundle of bundles) {
    if (!bundle.category) {
      continue;
    }

    const existing = grouped.get(bundle.category.slug);
    if (existing) {
      existing.postCount += 1;
      if (bundle.post.updatedAt > existing.updatedAt) {
        existing.updatedAt = bundle.post.updatedAt;
      }
      continue;
    }

    grouped.set(bundle.category.slug, {
      ...bundle.category,
      postCount: 1,
    });
  }

  const categoryRank: ReadonlyMap<string, number> = new Map(
    EDITORIAL_CATEGORIES.map((category, index) => [category.slug, index])
  );

  return [...grouped.values()].sort(
    (left, right) =>
      (categoryRank.get(left.slug) ?? Number.MAX_SAFE_INTEGER) -
      (categoryRank.get(right.slug) ?? Number.MAX_SAFE_INTEGER)
  );
}

export async function listPopularCategories(limit: number): Promise<PopularCategory[]> {
  const rows = await listPublicCategories();
  return rows.slice(0, limit);
}

export async function listAllTags(): Promise<Tag[]> {
  return db.select().from(tags).orderBy(asc(tags.name));
}

export async function listAllCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getPublishedNeighbors(
  currentPostId: string
): Promise<{ previous: Post | null; next: Post | null }> {
  const rows = await db
    .select()
    .from(posts)
    .where(publishedPostFilter())
    .orderBy(...getPublicPostOrderBy());

  return findPublicPostNeighbors(rows, currentPostId);
}

export async function listPublishedPostsForFeed(limit = 50): Promise<PublicPostBundle[]> {
  const rows = await db
    .select()
    .from(posts)
    .where(publishedPostFilter())
    .orderBy(...getPublicPostOrderBy())
    .limit(limit);

  return Promise.all(rows.map((post) => hydratePostBundle(post)));
}

export async function listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(publishedPostFilter())
    .orderBy(desc(posts.publishedAt));
}

export async function listPublishedPostsWithPublicOrder(): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(and(publishedPostFilter(), isNotNull(posts.publicOrder)))
    .orderBy(asc(posts.publicOrder), desc(posts.publishedAt));
}

export async function listRelatedPublishedPostBundles(
  bundle: PublicPostBundle,
  limit = 3
): Promise<PublicPostBundle[]> {
  const currentCategorySlug = bundle.category?.slug ?? null;
  const currentTagSlugs = new Set(bundle.tags.map((tag) => tag.slug));
  const currentIsTechnical = currentCategorySlug !== "career-reflections";
  const seenSlugs = new Set([bundle.post.slug]);
  const candidates = await listPublishedPostBundles({
    limit: 1000,
    excludePostId: bundle.post.id,
  });

  return candidates
    .filter((candidate) => {
      if (seenSlugs.has(candidate.post.slug)) {
        return false;
      }
      seenSlugs.add(candidate.post.slug);

      if (currentIsTechnical && candidate.category?.slug === "career-reflections") {
        return false;
      }

      return true;
    })
    .map((candidate) => {
      const overlappingTags = candidate.tags.filter((tag) => currentTagSlugs.has(tag.slug)).length;
      const sameCategory = currentCategorySlug && candidate.category?.slug === currentCategorySlug;
      const score = (sameCategory ? 100 : 0) + overlappingTags * 10;
      return { candidate, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return comparePublicPostOrder(left.candidate.post, right.candidate.post);
    })
    .slice(0, limit)
    .map((scored) => scored.candidate);
}

async function hydratePostBundle(post: Post): Promise<PublicPostBundle> {
  const [categoryRow, tagRows, coverAsset] = await Promise.all([
    post.categoryId
      ? db.select().from(categories).where(eq(categories.id, post.categoryId)).limit(1)
      : Promise.resolve([]),
    db
      .select({ tag: tags })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id))
      .orderBy(asc(tags.name)),
    post.coverAssetId
      ? db.select().from(assets).where(eq(assets.id, post.coverAssetId)).limit(1)
      : Promise.resolve([]),
  ]);
  const canonicalTags = canonicalizeTagList(tagRows.map((row) => row.tag));
  const canonicalCategory = resolveEditorialCategoryForPost(
    post,
    categoryRow[0] ?? null,
    canonicalTags
  );

  return {
    post,
    category: canonicalCategory,
    tags: canonicalTags,
    coverAsset: coverAsset[0] ?? null,
  };
}

export async function findAssetById(assetId: string): Promise<Asset | null> {
  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId)).limit(1);
  return asset ?? null;
}
