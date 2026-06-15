import { and, desc, eq, ilike, inArray, isNotNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db/get-db";
import { categories } from "@/modules/categories/categories.schema";
import type { Category } from "@/modules/categories/categories.types";
import { postRevisions, posts } from "./posts.schema";
import type { AdminPostListFilters, PostStatus, PublishedPostListOptions } from "./posts.types";
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

export async function listAdminPosts(filters: AdminPostListFilters = {}): Promise<Post[]> {
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

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderBy =
    filters.sort === "publishedAt"
      ? [desc(posts.publishedAt), desc(posts.updatedAt)]
      : [desc(posts.updatedAt)];

  return db
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
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
    .orderBy(desc(posts.pinned), desc(posts.pinnedPriority), desc(posts.publishedAt))
    .limit(options.limit ?? 12)
    .offset(options.offset ?? 0);
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
