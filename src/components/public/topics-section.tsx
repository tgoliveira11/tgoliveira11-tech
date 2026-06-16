import Link from "next/link";
import { formatTopicPostCount } from "@/modules/public/public-display";
import type { PopularCategory, PopularTag } from "@/modules/public/public-posts.repository";
import { PublicSectionHeading } from "./public-section-heading";

export function TopicsSection({
  categories,
  tags,
}: {
  categories: PopularCategory[];
  tags: PopularTag[];
}) {
  if (categories.length === 0 && tags.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="explore-topics-heading" className="public-topics">
      <PublicSectionHeading
        id="explore-topics-heading"
        title="Explore topics"
        description="Browse by category or jump into a tag."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {categories.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Explore by category
              </h3>
              <Link href="/categories" className="text-sm text-[var(--primary)] hover:underline">
                View all
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="block h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className="font-medium">{category.name}</span>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatTopicPostCount(category.postCount)}
                    </p>
                    {category.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                        {category.description}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Popular tags
              </h3>
              <Link href="/tags" className="text-sm text-[var(--primary)] hover:underline">
                View all
              </Link>
            </div>
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    <span>#{tag.name}</span>
                    <span className="ml-1.5 text-xs text-[var(--muted)]">
                      · {formatTopicPostCount(tag.postCount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
