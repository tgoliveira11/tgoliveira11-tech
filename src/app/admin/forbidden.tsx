import Link from "next/link";

export default function AdminForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold">403 — Admin access required</h1>
      <p className="mt-3 text-[var(--muted)]">
        You are signed in, but your account is not authorized to access the PostForge admin area.
        Only the configured <code>ADMIN_EMAIL</code> may manage posts.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">
          Go to public blog
        </Link>
        <Link href="/settings/account" className="rounded-md border border-[var(--border)] px-4 py-2 text-sm">
          Account settings
        </Link>
      </div>
    </main>
  );
}
