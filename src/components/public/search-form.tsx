import Link from "next/link";

export function SearchForm({
  action = "/search",
  defaultQuery = "",
}: {
  action?: string;
  defaultQuery?: string;
}) {
  return (
    <form action={action} method="get" className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="search-query" className="sr-only">
        Search posts
      </label>
      <input
        id="search-query"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder="Search published posts"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
      >
        Search
      </button>
    </form>
  );
}

export function SearchShortcut() {
  return (
    <p className="text-sm text-[var(--muted)]">
      Looking for something specific?{" "}
      <Link href="/search" className="text-[var(--primary)] hover:underline">
        Search the blog
      </Link>
      .
    </p>
  );
}
