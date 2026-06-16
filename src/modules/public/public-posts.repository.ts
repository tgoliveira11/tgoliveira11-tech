import { and, asc, desc, eq, gt, isNotNull, lt, ne, sql } from "drizzle-orm";
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
import { publicPostListingOrder } from "./public-post-order";

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
    .orderBy(...publicPostListingOrder)
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
      .orderBy(...publicPostListingOrder)
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
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);

  if (!category) return null;

  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.categoryId, category.id), publishedPostFilter()))
    .orderBy(...publicPostListingOrder)
    .limit(options.limit ?? 12)
    .offset(options.offset ?? 0);

  const bundles = await Promise.all(rows.map((post) => hydratePostBundle(post)));
  return { category, posts: bundles };
}

export async function listPublishedPostBundlesByTagSlug(
  tagSlug: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ tag: Tag; posts: PublicPostBundle[] } | null> {
  const [tag] = await db.select().from(tags).where(eq(tags.slug, tagSlug)).limit(1);
  if (!tag) return null;

  const rows = await db
    .select({ post: posts })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(and(eq(postTags.tagId, tag.id), publishedPostFilter()))
    .orderBy(...publicPostListingOrder)
    .limit(options.limit ?? 12)
    .offset(options.offset ?? 0);

  const bundles = await Promise.all(rows.map((row) => hydratePostBundle(row.post)));
  return { tag, posts: bundles };
}

export async function listPublicTags(): Promise<PopularTag[]> {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
      postCount: sql<number>`count(distinct ${posts.id})::int`,
    })
    .from(tags)
    .innerJoin(postTags, eq(tags.id, postTags.tagId))
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(publishedPostFilter())
    .groupBy(tags.id, tags.name, tags.slug, tags.createdAt, tags.updatedAt)
    .orderBy(desc(sql`count(distinct ${posts.id})`), asc(tags.name));
}

export async function listPopularTags(limit: number): Promise<PopularTag[]> {
  const rows = await listPublicTags();
  return rows.slice(0, limit);
}

export async function listPublicCategories(): Promise<PopularCategory[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      postCount: sql<number>`count(distinct ${posts.id})::int`,
    })
    .from(categories)
    .innerJoin(posts, eq(categories.id, posts.categoryId))
    .where(publishedPostFilter())
    .groupBy(
      categories.id,
      categories.name,
      categories.slug,
      categories.description,
      categories.createdAt,
      categories.updatedAt
    )
    .orderBy(desc(sql`count(distinct ${posts.id})`), asc(categories.name));
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
  publishedAt: Date,
  currentPostId: string
): Promise<{ previous: Post | null; next: Post | null }> {
  const [previous] = await db
    .select()
    .from(posts)
    .where(
      and(
        publishedPostFilter(),
        lt(posts.publishedAt, publishedAt),
        ne(posts.id, currentPostId)
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(1);

  const [next] = await db
    .select()
    .from(posts)
    .where(
      and(
        publishedPostFilter(),
        gt(posts.publishedAt, publishedAt),
        ne(posts.id, currentPostId)
      )
    )
    .orderBy(asc(posts.publishedAt))
    .limit(1);

  return { previous: previous ?? null, next: next ?? null };
}

export async function listPublishedPostsForFeed(limit = 50): Promise<PublicPostBundle[]> {
  const rows = await db
    .select()
    .from(posts)
    .where(publishedPostFilter())
    .orderBy(desc(posts.publishedAt))
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

  return {
    post,
    category: categoryRow[0] ?? null,
    tags: tagRows.map((row) => row.tag),
    coverAsset: coverAsset[0] ?? null,
  };
}

export async function findAssetById(assetId: string): Promise<Asset | null> {
  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId)).limit(1);
  return asset ?? null;
}
