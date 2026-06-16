import { users } from "@tgoliveira/secure-auth/drizzle/schema";
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { categories } from "@/modules/categories/categories.schema";
import { tags } from "@/modules/tags/tags.schema";

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "scheduled",
  "published",
  "unpublished",
  "archived",
]);

export const revisionTypeEnum = pgEnum("revision_type", [
  "manual_save",
  "autosave",
  "publish",
  "unpublish",
  "scheduled_publish",
]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull().default("Untitled"),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    contentMarkdown: text("content_markdown").notNull().default(""),
    contentHtmlCache: text("content_html_cache"),
    // Intentionally no FK to assets — breaks posts ↔ assets migration cycle.
    // Integrity enforced in the asset/post services.
    coverAssetId: uuid("cover_asset_id"),
    status: postStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    pinned: boolean("pinned").notNull().default(false),
    pinnedPriority: integer("pinned_priority").notNull().default(0),
    publicOrder: integer("public_order"),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    unpublishedAt: timestamp("unpublished_at", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogAssetId: uuid("og_asset_id"),
    readingTimeMinutes: integer("reading_time_minutes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedBy: uuid("updated_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_status_idx").on(table.status),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt),
    index("posts_status_public_order_published_at_idx").on(
      table.status,
      table.publicOrder,
      table.publishedAt
    ),
    index("posts_category_id_idx").on(table.categoryId),
    index("posts_featured_idx").on(table.featured),
    index("posts_pinned_priority_idx").on(table.pinned, table.pinnedPriority),
    index("posts_search_fts_idx").using(
      "gin",
      sql`to_tsvector('english', coalesce(${table.title}, '') || ' ' || coalesce(${table.excerpt}, '') || ' ' || coalesce(${table.contentMarkdown}, ''))`
    ),
  ]
);

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })]
);

export const postRevisions = pgTable(
  "post_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    contentMarkdown: text("content_markdown").notNull(),
    metadataSnapshot: jsonb("metadata_snapshot"),
    revisionType: revisionTypeEnum("revision_type").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("post_revisions_post_id_created_at_idx").on(table.postId, table.createdAt)]
);
