import { NotFoundError } from "@/lib/errors";
import * as postsRepo from "@/modules/posts/posts.repository";
import { getUtcDateRanges, normalizeReferrer } from "./analytics.helpers";
import {
  buildDeviceBreakdown,
  buildPostAnalyticsSummary,
  buildReferrerBreakdown,
  buildViewsOverTime,
} from "./analytics.query-helpers";
import * as repo from "./analytics.repository";
import type {
  BlogAnalyticsSummary,
  DailyViewsPoint,
  PostAnalyticsDetail,
  PostAnalyticsSummary,
  TopPostAnalyticsRow,
  TrackPostViewInput,
} from "./analytics.types";

async function buildSummaryForPost(postId: string): Promise<PostAnalyticsSummary> {
  const ranges = getUtcDateRanges();
  const [totalViews, viewsToday, viewsLast7Days, viewsLast30Days] = await Promise.all([
    repo.sumAllViews(postId),
    repo.sumViewsSince(postId, ranges.todayDate),
    repo.sumViewsSince(postId, ranges.last7Date),
    repo.sumViewsSince(postId, ranges.last30Date),
  ]);

  return buildPostAnalyticsSummary({
    totalViews,
    viewsToday,
    viewsLast7Days,
    viewsLast30Days,
  });
}

export async function trackPostView(input: TrackPostViewInput): Promise<void> {
  const post = await postsRepo.findPostById(input.postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const published = await postsRepo.findPublishedPostBySlug(post.slug);
  if (!published || published.id !== post.id) {
    throw new NotFoundError("Published post not found");
  }

  await repo.trackPostViewEvent(input);
}

export async function getPostAnalyticsSummary(postId: string): Promise<PostAnalyticsSummary> {
  return buildSummaryForPost(postId);
}

export async function getBlogAnalyticsSummary(): Promise<BlogAnalyticsSummary> {
  const ranges = getUtcDateRanges();
  const [totalViews, viewsToday, viewsLast7Days, viewsLast30Days, postsWithViews] =
    await Promise.all([
      repo.sumAllBlogViews(),
      repo.sumBlogViewsSince(ranges.todayDate),
      repo.sumBlogViewsSince(ranges.last7Date),
      repo.sumBlogViewsSince(ranges.last30Date),
      repo.countPostsWithViews(),
    ]);

  return {
    ...buildPostAnalyticsSummary({
      totalViews,
      viewsToday,
      viewsLast7Days,
      viewsLast30Days,
    }),
    postsWithViews,
  };
}

export async function getTopPostsByViews(limit = 10): Promise<TopPostAnalyticsRow[]> {
  const rows = await repo.getTopPostsByViews(limit);
  return rows.filter((row) => row.totalViews > 0);
}

export async function getViewsByDay(days = 30): Promise<DailyViewsPoint[]> {
  const ranges = getUtcDateRanges();
  const rows = await repo.getBlogViewsByDay(ranges.last30Date);
  return buildViewsOverTime(rows, ranges.last30Days, days);
}

export async function getPostViewsByDay(postId: string, days = 30): Promise<DailyViewsPoint[]> {
  const ranges = getUtcDateRanges();
  const rows = await repo.getPostViewsByDay(postId, ranges.last30Date);
  return buildViewsOverTime(rows, ranges.last30Days, days);
}

export async function getPostReferrerBreakdown(
  postId: string,
  sinceDays = 30
): Promise<ReturnType<typeof buildReferrerBreakdown>> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (sinceDays - 1));
  since.setUTCHours(0, 0, 0, 0);
  const rows = await repo.getPostReferrerEvents(postId, since);
  return buildReferrerBreakdown(rows.map((row) => row.referrer));
}

export async function getPostDeviceBreakdown(
  postId: string,
  sinceDays = 30
): Promise<ReturnType<typeof buildDeviceBreakdown>> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (sinceDays - 1));
  since.setUTCHours(0, 0, 0, 0);
  const rows = await repo.getPostDeviceEvents(postId, since);
  return buildDeviceBreakdown(rows.map((row) => row.deviceType));
}

export async function getRecentViews(postId: string, limit = 10) {
  const rows = await repo.getRecentPostViews(postId, limit);
  return rows.map((row) => ({
    occurredAt: row.occurredAt,
    referrer: normalizeReferrer(row.referrer),
    deviceType: row.deviceType ?? "unknown",
  }));
}

export async function getPostAnalyticsDetail(postId: string): Promise<PostAnalyticsDetail> {
  const post = await postsRepo.findPostById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const [summary, viewsByDay, referrers, devices, recentViews] = await Promise.all([
    buildSummaryForPost(postId),
    getPostViewsByDay(postId),
    getPostReferrerBreakdown(postId),
    getPostDeviceBreakdown(postId),
    getRecentViews(postId),
  ]);

  return {
    summary,
    viewsByDay,
    referrers,
    devices,
    recentViews,
  };
}
