export function EnrichedAnalyticsUnavailableNotice() {
  return (
    <p
      role="status"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-[var(--foreground)]"
    >
      Enriched analytics (referrers, geo, browsers) could not be loaded. Run{" "}
      <code className="rounded bg-[var(--muted)]/20 px-1 py-0.5 text-xs">npm run db:migrate</code>{" "}
      against production to apply migration 0003.
    </p>
  );
}
