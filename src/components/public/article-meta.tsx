import { formatPublishedDate } from "@/components/public/post-meta";

export function ArticleMeta({
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  className = "",
}: {
  publishedAt: Date | null | undefined;
  updatedAt?: Date | null | undefined;
  readingTimeMinutes: number | null | undefined;
  className?: string;
}) {
  const publishedLabel = formatPublishedDate(publishedAt);
  const showUpdated =
    updatedAt &&
    publishedAt &&
    updatedAt.getTime() > publishedAt.getTime() + 60_000;
  const updatedLabel = showUpdated ? formatPublishedDate(updatedAt) : null;

  if (!publishedLabel && !readingTimeMinutes && !updatedLabel) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)] ${className}`}
    >
      {publishedLabel ? (
        <time dateTime={publishedAt?.toISOString()}>Published {publishedLabel}</time>
      ) : null}
      {updatedLabel ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={updatedAt?.toISOString()}>Updated {updatedLabel}</time>
        </>
      ) : null}
      {readingTimeMinutes ? (
        <>
          {(publishedLabel || updatedLabel) ? <span aria-hidden="true">·</span> : null}
          <span>{readingTimeMinutes} min read</span>
        </>
      ) : null}
    </div>
  );
}
