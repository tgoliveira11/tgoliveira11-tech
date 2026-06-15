import Link from "next/link";
import type { ReactNode } from "react";

export function PostPreviewFrame({
  title,
  children,
  editHref,
}: {
  title: string;
  children: ReactNode;
  editHref: string;
}) {
  return (
    <article>
      <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Preview</strong> — this view is admin-only and may include unpublished content.
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Link href={editHref} className="text-sm text-[var(--primary)] underline">
          Back to edit
        </Link>
      </div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-8">{children}</div>
    </article>
  );
}
