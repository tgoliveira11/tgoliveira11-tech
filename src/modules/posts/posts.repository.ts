import { and, asc, desc, eq, ilike, inArray, isNotNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/get-db";
import { categories } from "@/modules/categories/categories.schema";
import type { Category } from "@/modules/categories/categories.types";
import { postRevisions, posts, postTags } from "./posts.schema";
import {
  adminListRequiresCategoryJoin,
  buildAdminPostOrderBy,
} from "./posts.repository.admin-sort";
import type { AdminPostListFilters, AdminPostListResult, PostStatus, PublishedPostListOptions } from "./posts.types";
import type { NewPost, Post, PostRevision, RevisionType } from "./posts.types";

export function publishedPostFilter(now = new Date()) {
  return and(
    eq(posts.status, "published"),
    isNotNull(posts.publishedAt),
    lte(posts.publishedAt, now)
  );
}

export async function insertPost(values: NewPost): Promise<Post> {
  const [row] = await db.insert(posts).values(values).returning();
  return row;
}

export async function updatePostById(
  id: string,
  values: Partial<NewPost>
): Promise<Post | undefined> {
  const [row] = await db
    .update(posts)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  return row;
}

export async function findPostById(id: string): Promise<Post | undefined> {
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return row;
}

export async function findPostBySlug(slug: string): Promise<Post | undefined> {
  const [row] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return row;
}

export async function findPublishedPostBySlug(
  slug: string,
  now = new Date()
): Promise<Post | undefined> {
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), publishedPostFilter(now)))
    .limit(1);
  return row;
}

export async function slugExists(slug: string, excludePostId?: string): Promise<boolean> {
  const conditions = excludePostId
    ? and(eq(posts.slug, slug), sql`${posts.id} <> ${excludePostId}`)
    : eq(posts.slug, slug);

  const [row] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(conditions)
    .limit(1);

  return !!row;
}

function buildAdminPostWhereClause(filters: AdminPostListFilters): SQL | undefined {
  const conditions = [];

  if (filters.status) conditions.push(eq(posts.status, filters.status));
  if (filters.categoryId) conditions.push(eq(posts.categoryId, filters.categoryId));
  if (filters.featured !== undefined) conditions.push(eq(posts.featured, filters.featured));
  if (filters.pinned !== undefined) conditions.push(eq(posts.pinned, filters.pinned));
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(posts.title, term),
        ilike(posts.excerpt, term),
        ilike(posts.slug, term),
        ilike(posts.contentMarkdown, term)
      )!
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

async function listAdminPostsMatchingTagIds(input: {
  postIds: string[];
  filters: AdminPostListFilters;
  whereClause: SQL | undefined;
  orderBy: SQL[];
  limit: number;
  offset: number;
  needsCategoryJoin: boolean;
}): Promise<Post[]> {
  if (input.postIds.length === 0) {
    return [];
  }

  const idFilter = inArray(posts.id, input.postIds);

  if (input.needsCategoryJoin) {
    const rows = await db
      .select({ post: posts })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(input.whereClause ? and(input.whereClause, idFilter) : idFilter)
      .orderBy(...input.orderBy)
      .limit(input.limit)
      .offset(input.offset);

    return rows.map((row) => row.post);
  }

  return db
    .select()
    .from(posts)
    .where(input.whereClause ? and(input.whereClause, idFilter) : idFilter)
    .orderBy(...input.orderBy)
    .limit(input.limit)
    .offset(input.offset);
}

export async function countAdminPosts(filters: AdminPostListFilters = {}): Promise<number> {
  const whereClause = buildAdminPostWhereClause(filters);

  if (filters.tagId) {
    const tagWhere = whereClause
      ? and(whereClause, eq(postTags.tagId, filters.tagId))
      : eq(postTags.tagId, filters.tagId);

    const [row] = await db
      .select({ count: sql<number>`count(distinct ${posts.id})::int` })
      .from(posts)
      .innerJoin(postTags, eq(postTags.postId, posts.id))
      .where(tagWhere);

    return Number(row?.count ?? 0);
  }

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(whereClause);

  return Number(row?.count ?? 0);
}

export async function listAdminPosts(filters: AdminPostListFilters = {}): Promise<Post[]> {
  const result = await listAdminPostsWithTotal(filters);
  return result.posts;
}

export async function listAdminPostsWithTotal(
  filters: AdminPostListFilters = {}
): Promise<AdminPostListResult> {
  const whereClause = buildAdminPostWhereClause(filters);
  const orderBy = buildAdminPostOrderBy(filters);
  const needsCategoryJoin = adminListRequiresCategoryJoin(filters);
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  if (filters.tagId) {
    const tagWhere = whereClause
      ? and(whereClause, eq(postTags.tagId, filters.tagId))
      : eq(postTags.tagId, filters.tagId);

    const [idRows, totalItems] = await Promise.all([
      db
        .selectDistinct({ id: posts.id })
        .from(posts)
        .innerJoin(postTags, eq(postTags.postId, posts.id))
        .where(tagWhere),
      countAdminPosts(filters),
    ]);

    const postIds = idRows.map((row) => row.id);
    const postsResult = await listAdminPostsMatchingTagIds({
      postIds,
      filters,
      whereClause,
      orderBy,
      limit,
      offset,
      needsCategoryJoin,
    });

    return { posts: postsResult, totalItems };
  }

  const [postsResult, totalItems] = await Promise.all([
    needsCategoryJoin
      ? db
          .select({ post: posts })
          .from(posts)
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .where(whereClause)
          .orderBy(...orderBy)
          .limit(limit)
          .offset(offset)
          .then((rows) => rows.map((row) => row.post))
      : db
          .select()
          .from(posts)
          .where(whereClause)
          .orderBy(...orderBy)
          .limit(limit)
          .offset(offset),
    countAdminPosts(filters),
  ]);

  return { posts: postsResult, totalItems };
}

export async function getMaxPublicOrder(): Promise<number | null> {
  const [row] = await db
    .select({ max: sql<number | null>`max(${posts.publicOrder})` })
    .from(posts)
    .where(isNotNull(posts.publicOrder));

  if (row?.max == null) {
    return null;
  }

  return Number(row.max);
}

export async function getNextPublicOrder(): Promise<number> {
  const max = await getMaxPublicOrder();
  return (max ?? 0) + 1;
}

export async function countPostsByStatus(): Promise<Record<PostStatus, number>> {
  const rows = await db
    .select({
      status: posts.status,
      count: sql<number>`count(*)::int`,
    })
    .from(posts)
    .groupBy(posts.status);

  const counts: Record<PostStatus, number> = {
    draft: 0,
    scheduled: 0,
    published: 0,
    unpublished: 0,
    archived: 0,
  };

  for (const row of rows) {
    counts[row.status] = Number(row.count);
  }

  return counts;
}

export async function countAllPosts(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(posts);
  return Number(row?.count ?? 0);
}

export async function findCategoryById(id: string): Promise<Category | undefined> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row;
}

export async function listCategoriesByIds(ids: string[]): Promise<Category[]> {
  if (ids.length === 0) return [];
  const unique = [...new Set(ids)];
  return db.select().from(categories).where(inArray(categories.id, unique));
}

export async function listPublishedPosts(
  options: PublishedPostListOptions = {}
): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(publishedPostFilter())
    .orderBy(sql`${posts.publicOrder} IS NULL`, asc(posts.publicOrder), desc(posts.publishedAt))
    .limit(options.limit ?? 12)
    .offset(options.offset ?? 0);
}

export async function listPublishedPostsWithPublicOrder(): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(and(publishedPostFilter(), isNotNull(posts.publicOrder)))
    .orderBy(asc(posts.publicOrder), desc(posts.publishedAt));
}

export async function insertPostRevision(input: {
  postId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentMarkdown: string;
  metadataSnapshot?: Record<string, unknown> | null;
  revisionType: RevisionType;
  createdBy: string;
}): Promise<PostRevision> {
  const [row] = await db
    .insert(postRevisions)
    .values({
      postId: input.postId,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      contentMarkdown: input.contentMarkdown,
      metadataSnapshot: input.metadataSnapshot ?? null,
      revisionType: input.revisionType,
      createdBy: input.createdBy,
    })
    .returning();

  return row;
}
