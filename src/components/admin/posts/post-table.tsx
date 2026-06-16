"use client";

import Link from "next/link";
import { PostRowActions } from "@/components/admin/posts/post-row-actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  adminSortIndicator,
  buildAdminPostsSortHref,
} from "@/modules/posts/admin-posts-sort";
import type { AdminPostSortDirection, AdminPostSortField, Post } from "@/modules/posts/posts.types";
import {
  archivePostAction,
  duplicatePostAction,
  publishPostAction,
  unpublishPostAction,
} from "@/modules/posts/admin-posts.actions";
import { AdminStatusBadge } from "../admin-status-badge";
import { PublicOrderControls } from "./public-order-controls";

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

function SortHeader({
  label,
  column,
  currentSort,
  currentDirection,
  usesDefaultSort,
  filters,
}: {
  label: string;
  column: AdminPostSortField;
  currentSort?: AdminPostSortField;
  currentDirection?: AdminPostSortDirection;
  usesDefaultSort: boolean;
  filters: Record<string, string | undefined>;
}) {
  const indicator = adminSortIndicator({
    column,
    currentSort,
    currentDirection,
    usesDefaultSort,
  });

  const href = buildAdminPostsSortHref({
    column,
    currentSort,
    currentDirection,
    filters,
  });

  const ariaSort =
    indicator === "asc"
      ? "ascending"
      : indicator === "desc"
        ? "descending"
        : indicator === "default"
          ? "ascending"
          : "none";

  return (
    <th className="px-3 py-2" aria-sort={ariaSort}>
      <Link
        href={href}
        className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"
      >
        <span>{label}</span>
        <span aria-hidden="true" className="text-[10px] leading-none">
          {indicator === "asc" ? "▲" : null}
          {indicator === "desc" ? "▼" : null}
          {indicator === "default" ? "◆" : null}
        </span>
      </Link>
    </th>
  );
}

export function PostTable({
  posts,
  categoryNames,
  orderedPublishedIds,
  sortState,
  filterParams,
}: {
  posts: Post[];
  categoryNames: Record<string, string>;
  orderedPublishedIds: string[];
  sortState: {
    sort?: AdminPostSortField;
    direction?: AdminPostSortDirection;
    usesDefaultSort: boolean;
  };
  filterParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string } | void>) {
    startTransition(async () => {
      const result = await action();
      if (result && !result.ok) {
        setActionError(result.error ?? "Something went wrong");
        return;
      }
      setActionError(null);
      router.refresh();
    });
  }

  function getMoveBounds(post: Post) {
    if (post.status !== "published" || post.publicOrder == null) {
      return { canMoveUp: false, canMoveDown: false };
    }

    const index = orderedPublishedIds.indexOf(post.id);
    if (index === -1) {
      return { canMoveUp: false, canMoveDown: false };
    }

    return {
      canMoveUp: index > 0,
      canMoveDown: index < orderedPublishedIds.length - 1,
    };
  }

  if (posts.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No posts match the current filters.</p>;
  }

  return (
    <div className="space-y-3">
      {actionError ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-xs uppercase text-[var(--muted)]">
          <tr>
            <SortHeader
              label="Title"
              column="title"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <SortHeader
              label="Status"
              column="status"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <SortHeader
              label="Published"
              column="published"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <SortHeader
              label="Scheduled"
              column="scheduled"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <SortHeader
              label="Updated"
              column="updated"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <SortHeader
              label="Flags"
              column="flags"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <SortHeader
              label="Public order"
              column="publicOrder"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <SortHeader
              label="Category"
              column="category"
              currentSort={sortState.sort}
              currentDirection={sortState.direction}
              usesDefaultSort={sortState.usesDefaultSort}
              filters={filterParams}
            />
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const moveBounds = getMoveBounds(post);

            return (
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
                <PublicOrderControls
                  key={`${post.id}-${post.publicOrder ?? "unset"}`}
                  post={post}
                  canMoveUp={moveBounds.canMoveUp}
                  canMoveDown={moveBounds.canMoveDown}
                />
              </td>
              <td className="px-3 py-3 align-top">
                {post.categoryId ? categoryNames[post.categoryId] ?? "—" : "—"}
              </td>
              <td className="px-3 py-3 align-top">
                <PostRowActions
                  post={post}
                  pending={pending}
                  onPublish={() => run(() => publishPostAction(post.id))}
                  onUnpublish={() => run(() => unpublishPostAction(post.id))}
                  onDuplicate={() => run(() => duplicatePostAction(post.id))}
                  onArchive={() => {
                    if (window.confirm("Archive this post? It will be removed from public surfaces.")) {
                      run(() => archivePostAction(post.id));
                    }
                  }}
                />
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
