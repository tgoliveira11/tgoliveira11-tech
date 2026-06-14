import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { analyticsEvents, postDailyStats } from "./analytics.schema";
import type { NewAnalyticsEvent, PostDailyStat, TrackPostViewInput } from "./analytics.types";

function utcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function insertAnalyticsEvent(
  values: NewAnalyticsEvent
): Promise<void> {
  await db.insert(analyticsEvents).values(values);
}

export async function upsertDailyView(postId: string, date = utcDateString()): Promise<void> {
  await db
    .insert(postDailyStats)
    .values({
      postId,
      date,
      views: 1,
      uniqueViews: 1,
    })
    .onConflictDoUpdate({
      target: [postDailyStats.postId, postDailyStats.date],
      set: {
        views: sql`${postDailyStats.views} + 1`,
        uniqueViews: sql`${postDailyStats.uniqueViews} + 1`,
        updatedAt: new Date(),
      },
    });
}

export async function trackPostViewEvent(input: TrackPostViewInput): Promise<void> {
  await insertAnalyticsEvent({
    postId: input.postId,
    eventType: "post_view",
    referrer: input.referrer ?? null,
    userAgentFamily: input.userAgentFamily ?? null,
    deviceType: input.deviceType ?? null,
    country: input.country ?? null,
    sessionHash: input.sessionHash ?? null,
  });

  await upsertDailyView(input.postId);
}

export async function getDailyStatsForPost(postId: string): Promise<PostDailyStat[]> {
  return db
    .select()
    .from(postDailyStats)
    .where(eq(postDailyStats.postId, postId))
    .orderBy(desc(postDailyStats.date));
}

export async function sumViewsSince(postId: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${postDailyStats.views}), 0)` })
    .from(postDailyStats)
    .where(and(eq(postDailyStats.postId, postId), gte(postDailyStats.date, since.toISOString().slice(0, 10))));

  return Number(row?.total ?? 0);
}

export async function sumAllViews(postId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${postDailyStats.views}), 0)` })
    .from(postDailyStats)
    .where(eq(postDailyStats.postId, postId));

  return Number(row?.total ?? 0);
}
