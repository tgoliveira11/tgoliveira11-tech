import { asc, count, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db/get-db";
import { postTags, posts } from "@/modules/posts/posts.schema";
import { tags } from "./tags.schema";
import type { NewTag, Tag } from "./tags.types";

function likePattern(query: string): string {
  const escaped = query.replace(/[%_]/g, "");
  return `%${escaped}%`;
}

export async function insertTag(values: NewTag): Promise<Tag> {
  const [row] = await db.insert(tags).values(values).returning();
  return row;
}

export async function updateTagById(id: string, values: Partial<NewTag>): Promise<Tag | undefined> {
  const [row] = await db
    .update(tags)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(tags.id, id))
    .returning();
  return row;
}

export async function findTagById(id: string): Promise<Tag | undefined> {
  const [row] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
  return row;
}

export async function findTagBySlug(slug: string): Promise<Tag | undefined> {
  const [row] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return row;
}

export async function findTagByNameCaseInsensitive(name: string): Promise<Tag | undefined> {
  const [row] = await db
    .select()
    .from(tags)
    .where(sql`lower(${tags.name}) = lower(${name})`)
    .limit(1);
  return row;
}

export async function searchTagsByName(query: string, limit = 8): Promise<Tag[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  return db
    .select()
    .from(tags)
    .where(ilike(tags.name, likePattern(trimmed)))
    .orderBy(asc(tags.name))
    .limit(limit);
}

export async function listTags(): Promise<Tag[]> {
  return db.select().from(tags).orderBy(asc(tags.name));
}

export type AdminTagRow = Tag & {
  totalPostCount: number;
  publishedPostCount: number;
};

export async function listAdminTags(): Promise<AdminTagRow[]> {
  const rows = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
      totalPostCount: sql<number>`count(distinct ${postTags.postId})::int`,
      publishedPostCount: sql<number>`count(distinct case when ${posts.status} = 'published' and ${posts.publishedAt} is not null and ${posts.publishedAt} <= now() then ${posts.id} end)::int`,
    })
    .from(tags)
    .leftJoin(postTags, eq(tags.id, postTags.tagId))
    .leftJoin(posts, eq(postTags.postId, posts.id))
    .groupBy(tags.id, tags.name, tags.slug, tags.createdAt, tags.updatedAt)
    .orderBy(asc(tags.name));

  return rows.map((row) => ({
    ...row,
    totalPostCount: Number(row.totalPostCount),
    publishedPostCount: Number(row.publishedPostCount),
  }));
}

export async function countTagUsage(tagId: string): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(postTags)
    .where(eq(postTags.tagId, tagId));
  return Number(row?.count ?? 0);
}

export async function deleteTagById(id: string): Promise<boolean> {
  const result = await db.delete(tags).where(eq(tags.id, id)).returning({ id: tags.id });
  return result.length > 0;
}
