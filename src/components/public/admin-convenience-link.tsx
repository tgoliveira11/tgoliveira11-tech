import Link from "next/link";

const linkClassName =
  "inline-flex rounded-md px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function AdminConvenienceLink() {
  return (
    <Link href="/admin" className={linkClassName}>
      Admin
    </Link>
  );
}
