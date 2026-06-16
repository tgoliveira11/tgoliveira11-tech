import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { analyticsEvents, postDailyStats } from "./analytics.schema";

export type AnalyticsEvent = InferSelectModel<typeof analyticsEvents>;
export type NewAnalyticsEvent = InferInsertModel<typeof analyticsEvents>;
export type PostDailyStat = InferSelectModel<typeof postDailyStats>;

import type { AnalyticsRequestMetadata } from "./analytics.schema";

export type TrackPostViewInput = {
  postId: string;
  referrer?: string | null;
  referrerHost?: string | null;
  userAgentFamily?: string | null;
  browserName?: string | null;
  osName?: string | null;
  deviceType?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  acceptLanguage?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  ipHash?: string | null;
  ipAddress?: string | null;
  sessionHash?: string | null;
  requestMetadata?: AnalyticsRequestMetadata | null;
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

export type LabelCountRow = {
  label: string;
  count: number;
};

export type RecentVisitRow = {
  occurredAt: Date;
  postTitle?: string;
  path?: string | null;
  referrerHost?: string | null;
  country?: string | null;
  city?: string | null;
  deviceType?: string | null;
  browserName?: string | null;
  osName?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  ipHash?: string | null;
  ipAddress?: string | null;
};

export type EnrichedAnalyticsBreakdowns = {
  referrerHosts: LabelCountRow[];
  countries: LabelCountRow[];
  devices: LabelCountRow[];
  browsers: LabelCountRow[];
  operatingSystems: LabelCountRow[];
  utmSources: LabelCountRow[];
  utmCampaigns: LabelCountRow[];
  recentVisits: RecentVisitRow[];
};

export type PostAnalyticsDetail = {
  summary: PostAnalyticsSummary;
  viewsByDay: DailyViewsPoint[];
  referrers: ReferrerBreakdownRow[];
  devices: DeviceBreakdownRow[];
  recentViews: RecentViewRow[];
  enriched: EnrichedAnalyticsBreakdowns;
};

export type BlogAnalyticsDetail = {
  summary: BlogAnalyticsSummary;
  viewsByDay: DailyViewsPoint[];
  topPosts: TopPostAnalyticsRow[];
  enriched: EnrichedAnalyticsBreakdowns;
};
