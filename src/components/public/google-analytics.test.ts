import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GOOGLE_ANALYTICS_MEASUREMENT_ID } from "@/modules/public/google-analytics";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Google Analytics public wiring", () => {
  it("uses the requested GA4 measurement id", () => {
    expect(GOOGLE_ANALYTICS_MEASUREMENT_ID).toBe("G-XJ5W80DYKL");
  });

  it("loads GA only from the public route group layout", () => {
    const publicLayout = readSource("src/app/(public)/layout.tsx");
    const rootLayout = readSource("src/app/layout.tsx");

    expect(publicLayout).toContain("GoogleAnalytics");
    expect(publicLayout).toContain("config.analyticsEnabled");
    expect(rootLayout).not.toContain("GoogleAnalytics");
  });

  it("tracks SPA page views, site search, and web vitals", () => {
    const source = readSource("src/components/public/google-analytics.tsx");

    expect(source).toContain("googletagmanager.com/gtag/js");
    expect(source).toContain("send_page_view: false");
    expect(source).toContain('"page_view"');
    expect(source).toContain('"view_search_results"');
    expect(source).toContain("useReportWebVitals");
    expect(source).toContain("metric_rating");
  });
});

