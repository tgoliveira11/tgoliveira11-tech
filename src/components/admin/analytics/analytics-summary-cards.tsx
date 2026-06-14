import type { BlogAnalyticsSummary, PostAnalyticsSummary } from "@/modules/analytics/analytics.types";

export function AnalyticsSummaryCards({
  summary,
  extra,
}: {
  summary: BlogAnalyticsSummary | PostAnalyticsSummary;
  extra?: React.ReactNode;
}) {
  const cards = [
    { label: "Total views", value: summary.totalViews },
    { label: "Today", value: summary.viewsToday },
    { label: "Last 7 days", value: summary.viewsLast7Days },
    { label: "Last 30 days", value: summary.viewsLast30Days },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted)]">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{card.value.toLocaleString()}</p>
        </div>
      ))}
      {extra}
    </div>
  );
}
