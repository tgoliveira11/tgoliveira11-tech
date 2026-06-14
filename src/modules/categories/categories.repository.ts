import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { categories } from "./categories.schema";
import type { Category, NewCategory } from "./categories.types";

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

export async function listCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function deleteCategoryById(id: string): Promise<boolean> {
  const result = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  return result.length > 0;
}
