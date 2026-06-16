import { notFound } from "next/navigation";
import { AdminActionIconLink } from "@/components/admin/admin-action-icon";
import { AdminBackLink } from "@/components/admin/admin-back-link";
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
      <AdminBackLink href="/admin/analytics" label="Back to analytics" />

      <AdminPageTitle
        title="Post analytics"
        description={post.title}
        actions={
          <div className="flex flex-wrap items-center gap-1">
            <AdminActionIconLink
              href={`/admin/posts/${id}/edit`}
              icon="edit"
              label={`Edit ${post.title}`}
              title="Edit post"
            />
            {post.status === "published" ? (
              <AdminActionIconLink
                href={publicPostPath(post.slug)}
                icon="external"
                label={`Open public post ${post.title}`}
                title="Public post"
                target="_blank"
                rel="noreferrer"
              />
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
