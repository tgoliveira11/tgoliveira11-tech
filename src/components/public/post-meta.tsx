export function formatPublishedDate(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function PostMeta({
  publishedAt,
  readingTimeMinutes,
  className = "",
}: {
  publishedAt: Date | null | undefined;
  readingTimeMinutes: number | null | undefined;
  className?: string;
}) {
  const publishedLabel = formatPublishedDate(publishedAt);

  if (!publishedLabel && !readingTimeMinutes) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)] ${className}`}>
      {publishedLabel ? (
        <time dateTime={publishedAt?.toISOString()}>{publishedLabel}</time>
      ) : null}
      {publishedLabel && readingTimeMinutes ? <span aria-hidden="true">·</span> : null}
      {readingTimeMinutes ? <span>{readingTimeMinutes} min read</span> : null}
    </div>
  );
}
