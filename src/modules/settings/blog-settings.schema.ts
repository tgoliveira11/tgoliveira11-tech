import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Simple key-value blog settings for MVP. */
export const blogSettings = pgTable("blog_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const BLOG_SETTING_KEYS = {
  blogTitle: "blogTitle",
  blogDescription: "blogDescription",
  baseUrl: "baseUrl",
  defaultSeoImage: "defaultSeoImage",
  defaultTimezone: "defaultTimezone",
  postsPerPage: "postsPerPage",
  rssEnabled: "rssEnabled",
  analyticsEnabled: "analyticsEnabled",
  uploadMaxFileSize: "uploadMaxFileSize",
} as const;
