import Link from "next/link";
import type { Category } from "@/modules/categories/categories.types";

export function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <p className="text-[var(--muted)]">No categories with published posts yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/categories/${category.slug}`}
            className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]"
          >
            <h2 className="font-semibold">{category.name}</h2>
            {category.description ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{category.description}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
