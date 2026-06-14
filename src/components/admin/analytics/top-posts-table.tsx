import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import type { TopPostAnalyticsRow } from "@/modules/analytics/analytics.types";
import { publicPostPath } from "@/modules/posts/slug";
import type { PostStatus } from "@/modules/posts/posts.types";

export function TopPostsTable({ posts }: { posts: TopPostAnalyticsRow[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-slate-50 text-xs uppercase text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2">Post</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Total views</th>
            <th className="px-3 py-2">Last 7 days</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.postId} className="border-b border-[var(--border)] last:border-b-0">
              <td className="px-3 py-3">
                <div className="font-medium">{post.title}</div>
                <div className="text-xs text-[var(--muted)]">{post.slug}</div>
              </td>
              <td className="px-3 py-3">
                <AdminStatusBadge status={post.status as PostStatus} />
              </td>
              <td className="px-3 py-3">{post.totalViews.toLocaleString()}</td>
              <td className="px-3 py-3">{post.viewsLast7Days.toLocaleString()}</td>
              <td className="px-3 py-3">
                <div className="flex flex-col gap-1">
                  <Link href={`/admin/analytics/posts/${post.postId}`} className="text-[var(--primary)] underline">
                    Analytics
                  </Link>
                  {post.status === "published" ? (
                    <Link href={publicPostPath(post.slug)} className="text-[var(--primary)] underline" target="_blank" rel="noreferrer">
                      Public post ↗
                    </Link>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
