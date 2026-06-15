import { describe, expect, it } from "vitest";
import {
  buildDeviceBreakdown,
  buildPostAnalyticsSummary,
  buildReferrerBreakdown,
} from "@/modules/analytics/analytics.query-helpers";

describe("analytics query helpers", () => {
  it("builds post analytics summary", () => {
    expect(
      buildPostAnalyticsSummary({
        totalViews: 100,
        viewsToday: 5,
        viewsLast7Days: 20,
        viewsLast30Days: 80,
      })
    ).toEqual({
      totalViews: 100,
      viewsToday: 5,
      viewsLast7Days: 20,
      viewsLast30Days: 80,
    });
  });

  it("groups referrer breakdown", () => {
    const rows = buildReferrerBreakdown([
      "https://news.ycombinator.com/item",
      "https://news.ycombinator.com/other",
      null,
    ]);

    expect(rows[0]?.referrer).toBe("news.ycombinator.com");
    expect(rows[0]?.count).toBe(2);
    expect(rows.some((row) => row.referrer === "Direct / none")).toBe(true);
  });

  it("groups device breakdown", () => {
    const rows = buildDeviceBreakdown(["mobile", "desktop", "mobile", null]);
    expect(rows[0]).toEqual({ deviceType: "mobile", count: 2 });
  });

  it("handles empty breakdown data", () => {
    expect(buildReferrerBreakdown([])).toEqual([]);
    expect(buildDeviceBreakdown([])).toEqual([]);
  });
});
