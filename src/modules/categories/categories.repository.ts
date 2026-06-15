import { asc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db/get-db";
import { categories } from "./categories.schema";
import type { Category, NewCategory } from "./categories.types";

function likePattern(query: string): string {
  const escaped = query.replace(/[%_]/g, "");
  return `%${escaped}%`;
}

export async function insertCategory(values: NewCategory): Promise<Category> {
  const [row] = await db.insert(categories).values(values).returning();
  return row;
}

export async function updateCategoryById(
  id: string,
  values: Partial<NewCategory>
): Promise<Category | undefined> {
  const [row] = await db
    .update(categories)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return row;
}

export async function findCategoryById(id: string): Promise<Category | undefined> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row;
}

export async function findCategoryBySlug(slug: string): Promise<Category | undefined> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row;
}

export async function findCategoryByNameCaseInsensitive(name: string): Promise<Category | undefined> {
  const [row] = await db
    .select()
    .from(categories)
    .where(sql`lower(${categories.name}) = lower(${name})`)
    .limit(1);
  return row;
}

export async function searchCategoriesByName(query: string, limit = 8): Promise<Category[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  return db
    .select()
    .from(categories)
    .where(ilike(categories.name, likePattern(trimmed)))
    .orderBy(asc(categories.name))
    .limit(limit);
}

export async function listCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function deleteCategoryById(id: string): Promise<boolean> {
  const result = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  return result.length > 0;
}
