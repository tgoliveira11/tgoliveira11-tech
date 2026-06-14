import Link from "next/link";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { createDraftAction } from "@/modules/posts/admin-posts.actions";
import * as postsService from "@/modules/posts/posts.service";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminDashboardPage() {
  const { counts, total, recent } = await postsService.getDashboardStats();

  return (
    <div>
      <AdminPageTitle
        title="Dashboard"
        description="Overview of your blog content."
        actions={
          <>
            <form action={createDraftAction}>
              <button
                type="submit"
                className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
              >
                New Post
              </button>
            </form>
            <Link href="/" className="rounded-md border border-[var(--border)] px-4 py-2 text-sm">
              View Public Blog
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total posts" value={total} />
        <StatCard label="Published" value={counts.published} />
        <StatCard label="Drafts" value={counts.draft} />
        <StatCard label="Scheduled" value={counts.scheduled} />
        <StatCard label="Unpublished" value={counts.unpublished} />
        <StatCard label="Archived" value={counts.archived} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Recently updated</h2>
        {recent.length === 0 ? (
          <AdminEmptyState
            title="No posts yet"
            description="Create your first draft to start publishing."
            action={
              <form action={createDraftAction}>
                <button type="submit" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">
                  Create draft
                </button>
              </form>
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--card)]">
            {recent.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <Link href={`/admin/posts/${post.id}/edit`} className="font-medium text-[var(--primary)] underline">
                    {post.title}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">{post.slug}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <AdminStatusBadge status={post.status} />
                  <span className="text-[var(--muted)]">{formatDate(post.updatedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
