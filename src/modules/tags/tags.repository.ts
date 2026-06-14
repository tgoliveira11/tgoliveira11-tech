import { asc, eq } from "drizzle-orm";
import { db } from "@/db/get-db";
import { tags } from "./tags.schema";
import type { NewTag, Tag } from "./tags.types";

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

export async function listTags(): Promise<Tag[]> {
  return db.select().from(tags).orderBy(asc(tags.name));
}

export async function deleteTagById(id: string): Promise<boolean> {
  const result = await db.delete(tags).where(eq(tags.id, id)).returning({ id: tags.id });
  return result.length > 0;
}
