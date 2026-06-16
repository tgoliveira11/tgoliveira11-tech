export function AnalyticsBreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; count: number }>;
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {rows.length === 0 || total === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{row.label}</span>
              <span className="shrink-0 text-[var(--muted)]">
                {row.count.toLocaleString()} ({Math.round((row.count / total) * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
