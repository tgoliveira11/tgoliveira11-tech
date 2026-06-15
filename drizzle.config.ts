import { defineConfig } from "drizzle-kit";
import { loadEnvFiles } from "./src/lib/load-env";

loadEnvFiles();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/postforge",
  },
});