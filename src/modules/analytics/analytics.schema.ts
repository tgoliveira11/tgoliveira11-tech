import { date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { posts } from "@/modules/posts/posts.schema";

export type AnalyticsRequestMetadata = {
  utmTerm?: string | null;
  utmContent?: string | null;
  browserVersion?: string | null;
  osVersion?: string | null;
  deviceVendor?: string | null;
  deviceModel?: string | null;
  userAgent?: string | null;
  timezone?: string | null;
  path?: string | null;
  postSlug?: string | null;
  requestHost?: string | null;
  requestProtocol?: string | null;
  eventSource?: string | null;
};

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "post_view",
  "search",
  "outbound_click",
]);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    eventType: analyticsEventTypeEnum("event_type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    referrer: text("referrer"),
    referrerHost: text("referrer_host"),
    userAgentFamily: text("user_agent_family"),
    browserName: text("browser_name"),
    osName: text("os_name"),
    deviceType: text("device_type"),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    acceptLanguage: text("accept_language"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    ipHash: text("ip_hash"),
    ipAddress: text("ip_address"),
    sessionHash: text("session_hash"),
    requestMetadata: jsonb("request_metadata").$type<AnalyticsRequestMetadata>(),
  },
  (table) => [
    index("analytics_events_post_id_occurred_at_idx").on(table.postId, table.occurredAt),
    index("analytics_events_occurred_at_idx").on(table.occurredAt),
  ]
);

export const postDailyStats = pgTable(
  "post_daily_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    views: integer("views").notNull().default(0),
    uniqueViews: integer("unique_views").notNull().default(0),
    topReferrers: jsonb("top_referrers").$type<Record<string, number>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("post_daily_stats_post_id_date_unique").on(table.postId, table.date),
    index("post_daily_stats_post_id_date_idx").on(table.postId, table.date),
  ]
);
