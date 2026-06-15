import Link from "next/link";
import type { Post } from "@/modules/posts/posts.types";
import { publicPostPath } from "@/modules/posts/slug";
import { AdminStatusBadge } from "../admin-status-badge";
import { EditorCard } from "./editor-card";
import { formatEditorDate } from "./editor-constants";

export function PostStatusCard({ post }: { post: Post }) {
  const isPublished = post.status === "published";

  return (
    <EditorCard title="Status" description="Publishing state and key dates.">
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-[var(--muted)]">Status</dt>
          <dd>
            <AdminStatusBadge status={post.status} />
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--muted)]">Updated</dt>
          <dd>{formatEditorDate(post.updatedAt)}</dd>
        </div>
        {post.publishedAt ? (
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Published</dt>
            <dd>{formatEditorDate(post.publishedAt)}</dd>
          </div>
        ) : null}
        {post.scheduledAt ? (
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Scheduled</dt>
            <dd>{formatEditorDate(post.scheduledAt)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-3 flex flex-col gap-2 text-sm">
        <Link href={`/admin/posts/${post.id}/preview`} className="text-[var(--primary)] underline">
          Open preview
        </Link>
        {isPublished ? (
          <a
            href={publicPostPath(post.slug)}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--primary)] underline"
          >
            View public post ↗
          </a>
        ) : (
          <p className="text-xs text-[var(--muted)]">Public URL appears after publishing.</p>
        )}
      </div>
    </EditorCard>
  );
}
