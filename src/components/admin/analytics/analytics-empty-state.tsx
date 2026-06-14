export function AnalyticsEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      {description ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
