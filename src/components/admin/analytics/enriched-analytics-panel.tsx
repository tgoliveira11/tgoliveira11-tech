import type { EnrichedAnalyticsBreakdowns } from "@/modules/analytics/analytics.types";
import { readAnalyticsStoreRawIp } from "@/lib/env";
import { AnalyticsBreakdownCard } from "./analytics-breakdown-card";
import { RecentVisitsTable } from "./recent-visits-table";

function hasBreakdownData(rows: Array<{ count: number }>): boolean {
  return rows.some((row) => row.count > 0);
}

export function EnrichedAnalyticsPanel({
  enriched,
  showPostTitle = false,
}: {
  enriched: EnrichedAnalyticsBreakdowns;
  showPostTitle?: boolean;
}) {
  const showSensitiveIp = readAnalyticsStoreRawIp();
  const sections = [
    { title: "Referrer hosts", rows: enriched.referrerHosts },
    { title: "Countries", rows: enriched.countries },
    { title: "Devices", rows: enriched.devices },
    { title: "Browsers", rows: enriched.browsers },
    { title: "Operating systems", rows: enriched.operatingSystems },
    { title: "UTM sources", rows: enriched.utmSources },
    { title: "UTM campaigns", rows: enriched.utmCampaigns },
  ].filter((section) => hasBreakdownData(section.rows));

  if (sections.length === 0 && enriched.recentVisits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {sections.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <AnalyticsBreakdownCard key={section.title} title={section.title} rows={section.rows} />
          ))}
        </div>
      ) : null}

      <RecentVisitsTable
        rows={enriched.recentVisits}
        showPostTitle={showPostTitle}
        showSensitiveIp={showSensitiveIp}
      />
    </div>
  );
}
