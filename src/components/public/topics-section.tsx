import Link from "next/link";
import type { Category } from "@/modules/categories/categories.types";
import type { Tag } from "@/modules/tags/tags.types";
import {
  HOME_TOPICS_CATEGORY_LIMIT,
  HOME_TOPICS_TAG_LIMIT,
} from "@/modules/public/public-display";
import { PublicSectionHeading } from "./public-section-heading";

export function TopicsSection({
  categories,
  tags,
}: {
  categories: Category[];
  tags: Tag[];
}) {
  if (categories.length === 0 && tags.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(0, HOME_TOPICS_CATEGORY_LIMIT);
  const visibleTags = tags.slice(0, HOME_TOPICS_TAG_LIMIT);
  const hasMoreTags = tags.length > visibleTags.length;

  return (
    <section aria-labelledby="explore-topics-heading" className="public-topics">
      <PublicSectionHeading
        id="explore-topics-heading"
        title="Explore topics"
        description="Browse by category or jump into a tag."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {visibleCategories.length > 0 ? (
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
              {visibleCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="block h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className="font-medium">{category.name}</span>
                    {category.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {category.description}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {visibleTags.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Popular tags
              </h3>
              {hasMoreTags ? (
                <Link href="/tags" className="text-sm text-[var(--primary)] hover:underline">
                  View all tags
                </Link>
              ) : (
                <Link href="/tags" className="text-sm text-[var(--primary)] hover:underline">
                  View all
                </Link>
              )}
            </div>
            <ul className="flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    #{tag.name}
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
