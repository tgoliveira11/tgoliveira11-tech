import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AnalyticsEmptyState } from "@/components/admin/analytics/analytics-empty-state";
import { PostAnalyticsSummaryPanel } from "@/components/admin/analytics/post-analytics-summary";
import { getPostAnalyticsDetail } from "@/modules/analytics/analytics.service";
import * as postsService from "@/modules/posts/posts.service";
import { publicPostPath } from "@/modules/posts/slug";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostAnalyticsPage({ params }: PageProps) {
  const { id } = await params;

  let post;
  try {
    post = await postsService.getById(id);
  } catch {
    notFound();
  }

  const detail = await getPostAnalyticsDetail(id);
  const hasViews = detail.summary.totalViews > 0;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Post analytics"
        description={post.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/posts/${id}/edit`} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm">
              Edit post
            </Link>
            {post.status === "published" ? (
              <Link
                href={publicPostPath(post.slug)}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
                target="_blank"
                rel="noreferrer"
              >
                Public post ↗
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <AdminStatusBadge status={post.status} />
        <span className="text-[var(--muted)]">{post.slug}</span>
      </div>

      {!hasViews ? (
        <AnalyticsEmptyState
          title="No views for this post yet"
          description="Publish the post and visit it publicly to start collecting aggregate view data."
        />
      ) : (
        <PostAnalyticsSummaryPanel detail={detail} />
      )}
    </div>
  );
}
