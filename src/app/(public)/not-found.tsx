import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-[var(--muted)]">
        The page you requested does not exist or is not publicly available.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="text-[var(--primary)] hover:underline">
          Home
        </Link>
        <Link href="/blog" className="text-[var(--primary)] hover:underline">
          Blog
        </Link>
      </div>
    </main>
  );
}
