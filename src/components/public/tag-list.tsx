import Link from "next/link";
import type { Tag } from "@/modules/tags/tags.types";

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) {
    return <p className="text-[var(--muted)]">No tags with published posts yet.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {tags.map((tag) => (
        <li key={tag.id}>
          <Link
            href={`/tags/${tag.slug}`}
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            #{tag.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
