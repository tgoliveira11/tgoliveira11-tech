import type { ReferrerBreakdownRow } from "@/modules/analytics/analytics.types";

export function ReferrerBreakdown({ rows }: { rows: ReferrerBreakdownRow[] }) {
  return (
    <BreakdownList title="Referrers" rows={rows.map((row) => ({ label: row.referrer, count: row.count }))} />
  );
}

export function DeviceBreakdown({ rows }: { rows: Array<{ deviceType: string; count: number }> }) {
  return (
    <BreakdownList title="Device types" rows={rows.map((row) => ({ label: row.deviceType, count: row.count }))} />
  );
}

function BreakdownList({
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
              <span>{row.label}</span>
              <span className="text-[var(--muted)]">
                {row.count.toLocaleString()} ({Math.round((row.count / total) * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
