"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Post } from "@/modules/posts/posts.types";
import {
  archivePostAction,
  duplicatePostAction,
  publishPostAction,
  unpublishPostAction,
} from "@/modules/posts/admin-posts.actions";
import { AdminStatusBadge } from "../admin-status-badge";
import { ScheduleControls } from "./schedule-controls";

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function PostTable({
  posts,
  categoryNames,
}: {
  posts: Post[];
  categoryNames: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  if (posts.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No posts match the current filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-slate-50 text-xs uppercase text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Published</th>
            <th className="px-3 py-2">Scheduled</th>
            <th className="px-3 py-2">Updated</th>
            <th className="px-3 py-2">Flags</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-[var(--border)] last:border-b-0">
              <td className="px-3 py-3 align-top">
                <div className="font-medium">{post.title}</div>
                <div className="text-xs text-[var(--muted)]">{post.slug}</div>
                {post.readingTimeMinutes ? (
                  <div className="text-xs text-[var(--muted)]">{post.readingTimeMinutes} min read</div>
                ) : null}
              </td>
              <td className="px-3 py-3 align-top">
                <AdminStatusBadge status={post.status} />
              </td>
              <td className="px-3 py-3 align-top">{formatDate(post.publishedAt)}</td>
              <td className="px-3 py-3 align-top">{formatDate(post.scheduledAt)}</td>
              <td className="px-3 py-3 align-top">{formatDate(post.updatedAt)}</td>
              <td className="px-3 py-3 align-top">
                <div className="flex flex-wrap gap-1 text-xs">
                  {post.featured ? <span className="rounded bg-blue-100 px-1.5 py-0.5">Featured</span> : null}
                  {post.pinned ? (
                    <span className="rounded bg-purple-100 px-1.5 py-0.5">
                      Pinned ({post.pinnedPriority})
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-3 py-3 align-top">
                {post.categoryId ? categoryNames[post.categoryId] ?? "—" : "—"}
              </td>
              <td className="px-3 py-3 align-top">
                <div className="flex min-w-48 flex-col gap-1">
                  <Link href={`/admin/posts/${post.id}/edit`} className="text-[var(--primary)] underline">
                    Edit
                  </Link>
                  <Link href={`/admin/posts/${post.id}/preview`} className="text-[var(--primary)] underline">
                    Preview
                  </Link>
                  {post.status !== "published" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="text-left text-emerald-700 underline disabled:opacity-50"
                      onClick={() => run(() => publishPostAction(post.id))}
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      className="text-left text-orange-700 underline disabled:opacity-50"
                      onClick={() => run(() => unpublishPostAction(post.id))}
                    >
                      Unpublish
                    </button>
                  )}
                  <ScheduleControls postId={post.id} compact />
                  <button
                    type="button"
                    disabled={pending}
                    className="text-left underline disabled:opacity-50"
                    onClick={() => run(() => duplicatePostAction(post.id))}
                  >
                    Duplicate
                  </button>
                  {post.status !== "archived" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="text-left text-red-700 underline disabled:opacity-50"
                      onClick={() => {
                        if (window.confirm("Archive this post? It will be removed from public surfaces.")) {
                          run(() => archivePostAction(post.id));
                        }
                      }}
                    >
                      Archive
                    </button>
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
