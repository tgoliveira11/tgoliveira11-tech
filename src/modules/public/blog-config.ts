import { eq } from "drizzle-orm";
import { db } from "@/db/get-db";
import { blogSettings } from "@/modules/settings/blog-settings.schema";
import { readEnv } from "@/lib/env";

export type BlogConfig = {
  title: string;
  description: string;
  baseUrl: string;
  postsPerPage: number;
  rssEnabled: boolean;
  analyticsEnabled: boolean;
  defaultSeoImage: string | null;
};

const DEFAULT_CONFIG: BlogConfig = {
  title: "PostForge",
  description: "Markdown-based blog publishing platform",
  baseUrl: "http://localhost:3000",
  postsPerPage: 12,
  rssEnabled: true,
  analyticsEnabled: true,
  defaultSeoImage: null,
};

export async function getBlogConfig(): Promise<BlogConfig> {
  const rows = await db.select().from(blogSettings);
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    title: map.get("blogTitle") ?? readEnv("APP_NAME") ?? DEFAULT_CONFIG.title,
    description: map.get("blogDescription") ?? DEFAULT_CONFIG.description,
    baseUrl: map.get("baseUrl") ?? readEnv("APP_BASE_URL") ?? readEnv("NEXTAUTH_URL") ?? DEFAULT_CONFIG.baseUrl,
    postsPerPage: Number(map.get("postsPerPage") ?? DEFAULT_CONFIG.postsPerPage) || DEFAULT_CONFIG.postsPerPage,
    rssEnabled: map.get("rssEnabled") !== "false",
    analyticsEnabled: map.get("analyticsEnabled") !== "false",
    defaultSeoImage: map.get("defaultSeoImage") ?? null,
  };
}

export async function getBlogSetting(key: string): Promise<string | undefined> {
  const [row] = await db.select().from(blogSettings).where(eq(blogSettings.key, key)).limit(1);
  return row?.value;
}
