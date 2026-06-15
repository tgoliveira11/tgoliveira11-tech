import type { DailyViewsPoint } from "@/modules/analytics/analytics.types";

export function ViewsOverTime({
  title,
  points,
}: {
  title: string;
  points: DailyViewsPoint[];
}) {
  const maxViews = Math.max(...points.map((point) => point.views), 1);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {points.every((point) => point.views === 0) ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No views in this period.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {points.map((point) => (
            <div key={point.date} className="grid grid-cols-[88px_1fr_48px] items-center gap-3 text-xs">
              <span className="text-[var(--muted)]">{point.date.slice(5)}</span>
              <div className="h-3 rounded bg-[var(--surface-muted)]">
                <div
                  className="h-3 rounded bg-[var(--primary)]"
                  style={{ width: `${Math.max(4, (point.views / maxViews) * 100)}%` }}
                />
              </div>
              <span className="text-right font-medium">{point.views}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
