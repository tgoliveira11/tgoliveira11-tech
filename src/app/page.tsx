import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Markdown blog publishing
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">PostForge</h1>
        <p className="text-[var(--muted)]">
          Write in Markdown, publish with confidence. Authentication is powered by{" "}
          <code className="text-sm">@tgoliveira/secure-auth</code>.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] sm:min-w-[160px]"
        >
          Create account
        </Link>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:bg-[var(--background)] sm:min-w-[160px]"
        >
          Sign in
        </Link>
      </div>

      <div className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-left">
        <h2 className="text-base font-semibold">Auth health</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          <Link href="/api/auth/package-health" className="text-[var(--primary)] hover:underline">
            GET /api/auth/package-health
          </Link>
        </p>
      </div>
    </main>
  );
}
