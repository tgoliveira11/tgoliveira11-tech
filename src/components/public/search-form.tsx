import Link from "next/link";
import { PUBLIC_SEARCH_PATH } from "@/modules/public/search";

export function SearchForm({
  action = PUBLIC_SEARCH_PATH,
  defaultQuery = "",
  variant = "default",
}: {
  action?: string;
  defaultQuery?: string;
  variant?: "default" | "hero" | "header";
}) {
  const isHero = variant === "hero";
  const isHeader = variant === "header";

  return (
    <form
      action={action}
      method="get"
      className={
        isHeader
          ? "flex min-w-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 shadow-[var(--shadow-sm)] focus-within:ring-2 focus-within:ring-[var(--ring)]"
          : isHero
            ? "flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center"
            : "flex flex-col gap-3 sm:flex-row"
      }
    >
      <label htmlFor="search-query" className="sr-only">
        Search articles
      </label>
      <input
        id="search-query"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder={
          isHeader ? "Search articles…" : isHero ? "Search articles…" : "Search published posts"
        }
        className={
          isHeader
            ? "min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-[var(--muted)]"
            : isHero
              ? "w-full flex-1 rounded-lg border border-transparent bg-transparent px-4 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              : "w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        }
        required
      />
      <button
        type="submit"
        className={
          isHeader
            ? "shrink-0 rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            : isHero
              ? "rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] sm:shrink-0"
              : "rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        }
      >
        {isHeader ? "Go" : "Search"}
      </button>
    </form>
  );
}

export function SearchShortcut() {
  return (
    <p className="text-sm text-[var(--muted)]">
      Looking for something specific?{" "}
      <Link href={PUBLIC_SEARCH_PATH} className="text-[var(--primary)] hover:underline">
        Search the blog
      </Link>
      .
    </p>
  );
}
