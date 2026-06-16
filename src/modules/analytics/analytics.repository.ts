import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/get-db";
import { posts } from "@/modules/posts/posts.schema";
import { analyticsEvents, postDailyStats } from "./analytics.schema";
import type { NewAnalyticsEvent, PostDailyStat, TrackPostViewInput } from "./analytics.types";

function utcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function insertAnalyticsEvent(values: NewAnalyticsEvent): Promise<void> {
  await db.insert(analyticsEvents).values(values);
}

export async function hasSessionViewToday(
  postId: string,
  sessionHash: string,
  now = new Date()
): Promise<boolean> {
  const [row] = await db
    .select({ id: analyticsEvents.id })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.postId, postId),
        eq(analyticsEvents.sessionHash, sessionHash),
        gte(analyticsEvents.occurredAt, startOfUtcDay(now))
      )
    )
    .limit(1);

  return !!row;
}

export async function upsertDailyView(
  postId: string,
  options: { incrementUnique?: boolean } = {},
  date = utcDateString()
): Promise<void> {
  const uniqueIncrement = options.incrementUnique ? 1 : 0;

  await db
    .insert(postDailyStats)
    .values({
      postId,
      date,
      views: 1,
      uniqueViews: uniqueIncrement,
    })
    .onConflictDoUpdate({
      target: [postDailyStats.postId, postDailyStats.date],
      set: {
        views: sql`${postDailyStats.views} + 1`,
        uniqueViews: sql`${postDailyStats.uniqueViews} + ${uniqueIncrement}`,
        updatedAt: new Date(),
      },
    });
}

export async function trackPostViewEvent(input: TrackPostViewInput): Promise<void> {
  const incrementUnique = input.sessionHash
    ? !(await hasSessionViewToday(input.postId, input.sessionHash))
    : false;

  await insertAnalyticsEvent({
    postId: input.postId,
    eventType: "post_view",
    referrer: input.referrer ?? null,
    referrerHost: input.referrerHost ?? null,
    userAgentFamily: input.userAgentFamily ?? null,
    browserName: input.browserName ?? null,
    osName: input.osName ?? null,
    deviceType: input.deviceType ?? null,
    country: input.country ?? null,
    region: input.region ?? null,
    city: input.city ?? null,
    acceptLanguage: input.acceptLanguage ?? null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    ipHash: input.ipHash ?? null,
    ipAddress: input.ipAddress ?? null,
    sessionHash: input.sessionHash ?? null,
    requestMetadata: input.requestMetadata ?? null,
  });

  await upsertDailyView(input.postId, { incrementUnique });
}

export async function getDailyStatsForPost(postId: string): Promise<PostDailyStat[]> {
  return db
    .select()
    .from(postDailyStats)
    .where(eq(postDailyStats.postId, postId))
    .orderBy(desc(postDailyStats.date));
}

export async function sumViewsSince(postId: string, sinceDate: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${postDailyStats.views}), 0)` })
    .from(postDailyStats)
    .where(and(eq(postDailyStats.postId, postId), gte(postDailyStats.date, sinceDate)));

  return Number(row?.total ?? 0);
}

export async function sumAllViews(postId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${postDailyStats.views}), 0)` })
    .from(postDailyStats)
    .where(eq(postDailyStats.postId, postId));

  return Number(row?.total ?? 0);
}

export async function sumBlogViewsSince(sinceDate: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${postDailyStats.views}), 0)` })
    .from(postDailyStats)
    .where(gte(postDailyStats.date, sinceDate));

  return Number(row?.total ?? 0);
}

export async function sumAllBlogViews(): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${postDailyStats.views}), 0)` })
    .from(postDailyStats);

  return Number(row?.total ?? 0);
}

export async function countPostsWithViews(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(distinct ${postDailyStats.postId})::int` })
    .from(postDailyStats)
    .where(sql`${postDailyStats.views} > 0`);

  return Number(row?.count ?? 0);
}

export async function getBlogViewsByDay(sinceDate: string): Promise<Array<{ date: string; views: number }>> {
  const rows = await db
    .select({
      date: postDailyStats.date,
      views: sql<number>`coalesce(sum(${postDailyStats.views}), 0)::int`,
    })
    .from(postDailyStats)
    .where(gte(postDailyStats.date, sinceDate))
    .groupBy(postDailyStats.date)
    .orderBy(postDailyStats.date);

  return rows.map((row) => ({
    date: String(row.date),
    views: Number(row.views),
  }));
}

export async function getPostViewsByDay(
  postId: string,
  sinceDate: string
): Promise<Array<{ date: string; views: number }>> {
  const rows = await db
    .select({
      date: postDailyStats.date,
      views: postDailyStats.views,
    })
    .from(postDailyStats)
    .where(and(eq(postDailyStats.postId, postId), gte(postDailyStats.date, sinceDate)))
    .orderBy(postDailyStats.date);

  return rows.map((row) => ({
    date: String(row.date),
    views: Number(row.views),
  }));
}

export async function getTopPostsByViews(limit = 10): Promise<
  Array<{
    postId: string;
    title: string;
    slug: string;
    status: string;
    totalViews: number;
    viewsLast7Days: number;
  }>
> {
  const ranges = startOfUtcDay();
  const last7Date = new Date(ranges);
  last7Date.setUTCDate(last7Date.getUTCDate() - 6);
  const last7DateString = last7Date.toISOString().slice(0, 10);

  const rows = await db
    .select({
      postId: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      totalViews: sql<number>`coalesce(sum(${postDailyStats.views}), 0)::int`,
      viewsLast7Days: sql<number>`coalesce(sum(case when ${postDailyStats.date} >= ${last7DateString} then ${postDailyStats.views} else 0 end), 0)::int`,
    })
    .from(posts)
    .leftJoin(postDailyStats, eq(postDailyStats.postId, posts.id))
    .groupBy(posts.id, posts.title, posts.slug, posts.status)
    .orderBy(desc(sql`coalesce(sum(${postDailyStats.views}), 0)`))
    .limit(limit);

  return rows.map((row) => ({
    postId: row.postId,
    title: row.title,
    slug: row.slug,
    status: row.status,
    totalViews: Number(row.totalViews),
    viewsLast7Days: Number(row.viewsLast7Days),
  }));
}

export async function getPostReferrerEvents(
  postId: string,
  since?: Date
): Promise<Array<{ referrer: string | null }>> {
  const conditions = [eq(analyticsEvents.postId, postId), eq(analyticsEvents.eventType, "post_view")];
  if (since) {
    conditions.push(gte(analyticsEvents.occurredAt, since));
  }

  return db
    .select({ referrer: analyticsEvents.referrer })
    .from(analyticsEvents)
    .where(and(...conditions));
}

export async function getPostDeviceEvents(
  postId: string,
  since?: Date
): Promise<Array<{ deviceType: string | null }>> {
  const conditions = [eq(analyticsEvents.postId, postId), eq(analyticsEvents.eventType, "post_view")];
  if (since) {
    conditions.push(gte(analyticsEvents.occurredAt, since));
  }

  return db
    .select({ deviceType: analyticsEvents.deviceType })
    .from(analyticsEvents)
    .where(and(...conditions));
}

export async function getRecentPostViews(
  postId: string,
  limit = 10
): Promise<Array<{ occurredAt: Date; referrer: string | null; deviceType: string | null }>> {
  return db
    .select({
      occurredAt: analyticsEvents.occurredAt,
      referrer: analyticsEvents.referrer,
      deviceType: analyticsEvents.deviceType,
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.postId, postId), eq(analyticsEvents.eventType, "post_view")))
    .orderBy(desc(analyticsEvents.occurredAt))
    .limit(limit);
}

type AnalyticsEventFilter = {
  postId?: string;
  since?: Date;
};

function buildEventFilter(filter: AnalyticsEventFilter) {
  const conditions = [eq(analyticsEvents.eventType, "post_view")];
  if (filter.postId) {
    conditions.push(eq(analyticsEvents.postId, filter.postId));
  }
  if (filter.since) {
    conditions.push(gte(analyticsEvents.occurredAt, filter.since));
  }
  return and(...conditions);
}

async function getTopFieldCounts(
  column:
    | typeof analyticsEvents.referrerHost
    | typeof analyticsEvents.country
    | typeof analyticsEvents.deviceType
    | typeof analyticsEvents.browserName
    | typeof analyticsEvents.osName
    | typeof analyticsEvents.utmSource
    | typeof analyticsEvents.utmCampaign,
  filter: AnalyticsEventFilter,
  limit = 8,
  unknownLabel = "Unknown"
): Promise<Array<{ label: string; count: number }>> {
  const rows = await db
    .select({
      label: sql<string>`coalesce(nullif(trim(${column}), ''), ${unknownLabel})`,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(buildEventFilter(filter))
    .groupBy(sql`coalesce(nullif(trim(${column}), ''), ${unknownLabel})`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return rows.map((row) => ({
    label: String(row.label),
    count: Number(row.count),
  }));
}

export async function getTopReferrerHosts(
  filter: AnalyticsEventFilter,
  limit = 8
): Promise<Array<{ label: string; count: number }>> {
  return getTopFieldCounts(analyticsEvents.referrerHost, filter, limit, "Direct / none");
}

export async function getTopCountries(
  filter: AnalyticsEventFilter,
  limit = 8
): Promise<Array<{ label: string; count: number }>> {
  return getTopFieldCounts(analyticsEvents.country, filter, limit, "Unknown");
}

export async function getTopDeviceTypes(
  filter: AnalyticsEventFilter,
  limit = 8
): Promise<Array<{ label: string; count: number }>> {
  return getTopFieldCounts(analyticsEvents.deviceType, filter, limit, "unknown");
}

export async function getTopBrowsers(
  filter: AnalyticsEventFilter,
  limit = 8
): Promise<Array<{ label: string; count: number }>> {
  return getTopFieldCounts(analyticsEvents.browserName, filter, limit, "Unknown");
}

export async function getTopOperatingSystems(
  filter: AnalyticsEventFilter,
  limit = 8
): Promise<Array<{ label: string; count: number }>> {
  return getTopFieldCounts(analyticsEvents.osName, filter, limit, "Unknown");
}

export async function getTopUtmSources(
  filter: AnalyticsEventFilter,
  limit = 8
): Promise<Array<{ label: string; count: number }>> {
  return getTopFieldCounts(analyticsEvents.utmSource, filter, limit, "None");
}

export async function getTopUtmCampaigns(
  filter: AnalyticsEventFilter,
  limit = 8
): Promise<Array<{ label: string; count: number }>> {
  return getTopFieldCounts(analyticsEvents.utmCampaign, filter, limit, "None");
}

export async function getRecentAnalyticsEvents(filter: AnalyticsEventFilter & { limit?: number }) {
  const limit = filter.limit ?? 20;

  return db
    .select({
      occurredAt: analyticsEvents.occurredAt,
      postTitle: posts.title,
      path: sql<string | null>`${analyticsEvents.requestMetadata} ->> 'path'`,
      referrerHost: analyticsEvents.referrerHost,
      country: analyticsEvents.country,
      city: analyticsEvents.city,
      deviceType: analyticsEvents.deviceType,
      browserName: analyticsEvents.browserName,
      osName: analyticsEvents.osName,
      utmSource: analyticsEvents.utmSource,
      utmCampaign: analyticsEvents.utmCampaign,
      ipAddress: analyticsEvents.ipAddress,
      ipHash: analyticsEvents.ipHash,
      requestMetadata: analyticsEvents.requestMetadata,
    })
    .from(analyticsEvents)
    .innerJoin(posts, eq(analyticsEvents.postId, posts.id))
    .where(buildEventFilter(filter))
    .orderBy(desc(analyticsEvents.occurredAt))
    .limit(limit);
}
