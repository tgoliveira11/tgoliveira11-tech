import type { PostAnalyticsSummary } from "./analytics.types";
import { fillDailyViews, groupCounts, normalizeReferrer } from "./analytics.helpers";

export function buildPostAnalyticsSummary(input: {
  totalViews: number;
  viewsToday: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
}): PostAnalyticsSummary {
  return {
    totalViews: input.totalViews,
    viewsToday: input.viewsToday,
    viewsLast7Days: input.viewsLast7Days,
    viewsLast30Days: input.viewsLast30Days,
  };
}

export function buildReferrerBreakdown(
  referrers: Array<string | null | undefined>
): Array<{ referrer: string; count: number }> {
  return groupCounts(
    referrers.map((referrer) => normalizeReferrer(referrer)),
    "Direct / none"
  ).map(({ label, count }) => ({ referrer: label, count }));
}

export function buildDeviceBreakdown(
  devices: Array<string | null | undefined>
): Array<{ deviceType: string; count: number }> {
  return groupCounts(devices, "unknown").map(({ label, count }) => ({
    deviceType: label,
    count,
  }));
}

export function buildViewsOverTime(
  rows: Array<{ date: string; views: number }>,
  since: Date,
  days: number
) {
  return fillDailyViews(rows, since, days);
}
