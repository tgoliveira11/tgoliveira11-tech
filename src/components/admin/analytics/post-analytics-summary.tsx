import type { PostAnalyticsDetail } from "@/modules/analytics/analytics.types";
import { AnalyticsSummaryCards } from "./analytics-summary-cards";
import { DeviceBreakdown } from "./device-breakdown";
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

      {detail.recentViews.length > 0 ? (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-semibold">Recent views</h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {detail.recentViews.map((view) => (
              <li key={view.occurredAt.toISOString()} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(view.occurredAt)}</span>
                <span className="text-[var(--muted)]">
                  {view.referrer} · {view.deviceType}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
