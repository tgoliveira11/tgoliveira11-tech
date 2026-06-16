import type { RecentVisitRow } from "@/modules/analytics/analytics.types";

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function formatLocation(row: RecentVisitRow): string {
  const parts = [row.country, row.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function RecentVisitsTable({
  rows,
  showPostTitle = false,
  showSensitiveIp = false,
}: {
  rows: RecentVisitRow[];
  showPostTitle?: boolean;
  showSensitiveIp?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-semibold">Recent visits</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">No visit events yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Recent visits</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-2 py-2">Time</th>
              {showPostTitle ? <th className="px-2 py-2">Post</th> : null}
              <th className="px-2 py-2">Referrer</th>
              <th className="px-2 py-2">Location</th>
              <th className="px-2 py-2">Device</th>
              <th className="px-2 py-2">Browser</th>
              <th className="px-2 py-2">OS</th>
              <th className="px-2 py-2">UTM</th>
              <th className="px-2 py-2">Path</th>
              {showSensitiveIp ? <th className="px-2 py-2">IP</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.occurredAt.toISOString()} className="border-b border-[var(--border)] last:border-b-0">
                <td className="px-2 py-2 whitespace-nowrap">{formatDateTime(row.occurredAt)}</td>
                {showPostTitle ? <td className="px-2 py-2">{row.postTitle ?? "—"}</td> : null}
                <td className="px-2 py-2">{row.referrerHost ?? "—"}</td>
                <td className="px-2 py-2">{formatLocation(row)}</td>
                <td className="px-2 py-2">{row.deviceType ?? "—"}</td>
                <td className="px-2 py-2">{row.browserName ?? "—"}</td>
                <td className="px-2 py-2">{row.osName ?? "—"}</td>
                <td className="px-2 py-2">
                  {[row.utmSource, row.utmCampaign].filter(Boolean).join(" / ") || "—"}
                </td>
                <td className="px-2 py-2 font-mono text-xs">{row.path ?? "—"}</td>
                {showSensitiveIp ? (
                  <td className="px-2 py-2 font-mono text-xs text-red-700 dark:text-red-400">
                    {row.ipAddress ?? (row.ipHash ? `hash:${row.ipHash.slice(0, 8)}…` : "—")}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showSensitiveIp ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Raw IP display is enabled. Treat this data as sensitive and disclose it in your privacy policy.
        </p>
      ) : null}
    </section>
  );
}
