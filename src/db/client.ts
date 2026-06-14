import "server-only";
import { authSchema } from "@tgoliveira/secure-auth/drizzle/schema";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { blogSchema, type BlogSchema } from "@/db/blog-schema";

export const fullSchema = { ...authSchema, ...blogSchema };

export type DbClient = PostgresJsDatabase<typeof fullSchema & typeof authSchema>;

let dbInstance: DbClient | null = null;

function getDb(): DbClient {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    const client = postgres(connectionString, { max: 10 });
    dbInstance = drizzle(client, { schema: fullSchema });
  }
  return dbInstance;
}

/** Lazy DB client — auth schema from package, blog schema PostForge-owned. */
export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof DbClient];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export type { BlogSchema };
