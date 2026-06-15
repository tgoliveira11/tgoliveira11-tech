import { asc, eq } from "drizzle-orm";
import { db } from "@/db/get-db";
import { redirects } from "./redirects.schema";
import type { NewRedirect, Redirect } from "./redirects.types";

export async function insertRedirect(values: NewRedirect): Promise<Redirect> {
  const [row] = await db.insert(redirects).values(values).returning();
  return row;
}

export async function findRedirectBySourcePath(sourcePath: string): Promise<Redirect | undefined> {
  const [row] = await db
    .select()
    .from(redirects)
    .where(eq(redirects.sourcePath, sourcePath))
    .limit(1);
  return row;
}

export async function listRedirects(): Promise<Redirect[]> {
  return db.select().from(redirects).orderBy(asc(redirects.sourcePath));
}

export async function deleteRedirectById(id: string): Promise<boolean> {
  const result = await db
    .delete(redirects)
    .where(eq(redirects.id, id))
    .returning({ id: redirects.id });
  return result.length > 0;
}
