import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AnalyticsEmptyState } from "@/components/admin/analytics/analytics-empty-state";
import { AnalyticsSummaryCards } from "@/components/admin/analytics/analytics-summary-cards";
import { EnrichedAnalyticsPanel } from "@/components/admin/analytics/enriched-analytics-panel";
import { EnrichedAnalyticsUnavailableNotice } from "@/components/admin/analytics/enriched-analytics-unavailable-notice";
import { TopPostsTable } from "@/components/admin/analytics/top-posts-table";
import { ViewsOverTime } from "@/components/admin/analytics/views-over-time";
import { getBlogAnalyticsDetail } from "@/modules/analytics/analytics.service";

export default async function AdminAnalyticsPage() {
  const detail = await getBlogAnalyticsDetail();
  const hasData = detail.summary.totalViews > 0;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Analytics"
        description="Privacy-friendly aggregate view counts from published post traffic."
      />

      <AnalyticsSummaryCards
        summary={detail.summary}
        extra={
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm text-[var(--muted)]">Posts with views</p>
            <p className="mt-1 text-2xl font-semibold">{detail.summary.postsWithViews.toLocaleString()}</p>
          </div>
        }
      />

      {detail.enrichedUnavailable ? <EnrichedAnalyticsUnavailableNotice /> : null}

      {!hasData ? (
        <AnalyticsEmptyState
          title="No analytics yet"
          description="Views appear after published posts are visited and the public post-view tracker runs."
        />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Top posts</h2>
            <TopPostsTable posts={detail.topPosts} />
          </section>

          <ViewsOverTime title="Blog views over time (last 30 days)" points={detail.viewsByDay} />

          <EnrichedAnalyticsPanel enriched={detail.enriched} showPostTitle />
        </>
      )}

      <p className="text-xs text-[var(--muted)]">
        Unique views are approximated per day using session hashes. Raw IP is hidden unless
        ANALYTICS_STORE_RAW_IP is enabled.
      </p>
    </div>
  );
}
