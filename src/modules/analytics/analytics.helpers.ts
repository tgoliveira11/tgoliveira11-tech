export type DateRanges = {
  startOfToday: Date;
  last7Days: Date;
  last30Days: Date;
  todayDate: string;
  last7Date: string;
  last30Date: string;
};

export function getUtcDateRanges(now = new Date()): DateRanges {
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const last7Days = new Date(startOfToday);
  last7Days.setUTCDate(last7Days.getUTCDate() - 6);
  const last30Days = new Date(startOfToday);
  last30Days.setUTCDate(last30Days.getUTCDate() - 29);

  return {
    startOfToday,
    last7Days,
    last30Days,
    todayDate: startOfToday.toISOString().slice(0, 10),
    last7Date: last7Days.toISOString().slice(0, 10),
    last30Date: last30Days.toISOString().slice(0, 10),
  };
}

export function normalizeReferrer(referrer: string | null | undefined): string {
  if (!referrer || referrer.trim() === "") {
    return "Direct / none";
  }

  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./i, "") || "Direct / none";
  } catch {
    return "Unknown";
  }
}

export function groupCounts<T extends string>(
  values: Array<T | null | undefined>,
  fallback: T
): Array<{ label: T; count: number }> {
  const counts = new Map<T, number>();

  for (const value of values) {
    const label = (value ?? fallback) as T;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function sumDailyViews(rows: Array<{ date: string; views: number }>): number {
  return rows.reduce((total, row) => total + row.views, 0);
}

export function fillDailyViews(
  rows: Array<{ date: string; views: number }>,
  since: Date,
  days: number
): Array<{ date: string; views: number }> {
  const map = new Map(rows.map((row) => [row.date, row.views]));
  const filled: Array<{ date: string; views: number }> = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + offset);
    const key = date.toISOString().slice(0, 10);
    filled.push({ date: key, views: map.get(key) ?? 0 });
  }

  return filled;
}

export function buildSummaryFromTotals(input: {
  totalViews: number;
  viewsToday: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
}) {
  return {
    totalViews: input.totalViews,
    viewsToday: input.viewsToday,
    viewsLast7Days: input.viewsLast7Days,
    viewsLast30Days: input.viewsLast30Days,
  };
}
