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
