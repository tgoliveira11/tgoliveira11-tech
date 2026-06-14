import { authSchema } from "@tgoliveira/secure-auth/drizzle/schema";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import { blogSchema, type BlogSchema } from "@/db/blog-schema";
import { readEnv } from "@/lib/env";

export const fullSchema = { ...authSchema, ...blogSchema };

export type DbClient = PostgresJsDatabase<typeof fullSchema & typeof authSchema>;

type DbGlobal = typeof globalThis & {
  __postforgePostgres?: Sql;
  __postforgeDb?: DbClient;
};

const globalForDb = globalThis as DbGlobal;

function readPoolMax(): number {
  const raw = readEnv("DATABASE_POOL_MAX");
  if (raw) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // Each Next.js dev/build worker is its own process with its own pool.
  // Keep pools small so parallel workers do not exhaust Postgres max_connections.
  return process.env.NODE_ENV === "production" ? 5 : 2;
}

function createPostgresClient(connectionString: string): Sql {
  return postgres(connectionString, {
    max: readPoolMax(),
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
  });
}

function getDb(): DbClient {
  if (globalForDb.__postforgeDb) {
    return globalForDb.__postforgeDb;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = createPostgresClient(connectionString);
  globalForDb.__postforgePostgres = client;
  globalForDb.__postforgeDb = drizzle(client, { schema: fullSchema });
  return globalForDb.__postforgeDb;
}

/** Close the shared pool (CLI scripts should call this before exit). */
export async function closeDb(): Promise<void> {
  const client = globalForDb.__postforgePostgres;
  globalForDb.__postforgePostgres = undefined;
  globalForDb.__postforgeDb = undefined;
  if (client) {
    await client.end({ timeout: 5 });
  }
}

/** Lazy DB client — survives Next.js dev HMR via globalThis. */
export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof DbClient];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export type { BlogSchema };
