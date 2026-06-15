import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { analyticsEvents, postDailyStats } from "./analytics.schema";

export type AnalyticsEvent = InferSelectModel<typeof analyticsEvents>;
export type NewAnalyticsEvent = InferInsertModel<typeof analyticsEvents>;
export type PostDailyStat = InferSelectModel<typeof postDailyStats>;

export type TrackPostViewInput = {
  postId: string;
  referrer?: string | null;
  userAgentFamily?: string | null;
  deviceType?: string | null;
  country?: string | null;
  sessionHash?: string | null;
};

export type PostAnalyticsSummary = {
  totalViews: number;
  viewsToday: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
};

export type BlogAnalyticsSummary = PostAnalyticsSummary & {
  postsWithViews: number;
};

export type DailyViewsPoint = {
  date: string;
  views: number;
};

export type TopPostAnalyticsRow = {
  postId: string;
  title: string;
  slug: string;
  status: string;
  totalViews: number;
  viewsLast7Days: number;
};

export type ReferrerBreakdownRow = {
  referrer: string;
  count: number;
};

export type DeviceBreakdownRow = {
  deviceType: string;
  count: number;
};

export type RecentViewRow = {
  occurredAt: Date;
  referrer: string | null;
  deviceType: string | null;
};

export type PostAnalyticsDetail = {
  summary: PostAnalyticsSummary;
  viewsByDay: DailyViewsPoint[];
  referrers: ReferrerBreakdownRow[];
  devices: DeviceBreakdownRow[];
  recentViews: RecentViewRow[];
};
