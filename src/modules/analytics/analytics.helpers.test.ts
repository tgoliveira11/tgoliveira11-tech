import { describe, expect, it } from "vitest";
import {
  fillDailyViews,
  getUtcDateRanges,
  groupCounts,
  normalizeReferrer,
} from "@/modules/analytics/analytics.helpers";

describe("analytics helpers", () => {
  it("normalizes referrers to hostnames", () => {
    expect(normalizeReferrer("https://www.google.com/search?q=postforge")).toBe("google.com");
    expect(normalizeReferrer(null)).toBe("Direct / none");
    expect(normalizeReferrer("not-a-url")).toBe("Unknown");
  });

  it("groups counts and sorts descending", () => {
    const grouped = groupCounts(["mobile", "desktop", "mobile", null], "unknown");
    expect(grouped[0]).toEqual({ label: "mobile", count: 2 });
    expect(grouped[1]?.label).toBe("desktop");
  });

  it("fills missing days with zero views", () => {
    const since = new Date("2026-06-01T00:00:00.000Z");
    const filled = fillDailyViews(
      [{ date: "2026-06-02", views: 5 }],
      since,
      3
    );

    expect(filled).toEqual([
      { date: "2026-06-01", views: 0 },
      { date: "2026-06-02", views: 5 },
      { date: "2026-06-03", views: 0 },
    ]);
  });

  it("builds UTC date ranges", () => {
    const ranges = getUtcDateRanges(new Date("2026-06-14T15:00:00.000Z"));
    expect(ranges.todayDate).toBe("2026-06-14");
    expect(ranges.last7Date).toBe("2026-06-08");
    expect(ranges.last30Date).toBe("2026-05-16");
  });
});
