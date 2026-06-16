import type { PostAnalyticsDetail } from "@/modules/analytics/analytics.types";
import { AnalyticsSummaryCards } from "./analytics-summary-cards";
import { DeviceBreakdown } from "./device-breakdown";
import { EnrichedAnalyticsPanel } from "./enriched-analytics-panel";
import { ReferrerBreakdown } from "./referrer-breakdown";
import { ViewsOverTime } from "./views-over-time";

export function PostAnalyticsSummaryPanel({ detail }: { detail: PostAnalyticsDetail }) {
  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards summary={detail.summary} />

      <ViewsOverTime title="Views by day (last 30 days)" points={detail.viewsByDay} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ReferrerBreakdown rows={detail.referrers} />
        <DeviceBreakdown rows={detail.devices} />
      </div>

      <EnrichedAnalyticsPanel enriched={detail.enriched} />
    </div>
  );
}
