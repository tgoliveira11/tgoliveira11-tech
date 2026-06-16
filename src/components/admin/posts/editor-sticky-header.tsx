"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Post } from "@/modules/posts/posts.types";
import { unpublishPostAction } from "@/modules/posts/admin-posts.actions";
import { publicPostPath } from "@/modules/posts/slug";
import { AdminStatusBadge } from "../admin-status-badge";
import { formatAutosaveTime, type AutosaveStatus } from "./use-autosave-post";
import { formatEditorDate, POST_EDITOR_FORM_ID } from "./editor-constants";

function autosaveIndicatorLabel(options: {
  status: AutosaveStatus;
  message: string | null;
  error: string | null;
  lastSavedAt: Date | null;
}): string {
  if (options.status === "saving") return "Saving…";
  if (options.status === "unsaved") return "Unsaved changes";
  if (options.status === "error") return "Autosave failed";
  if (options.lastSavedAt) {
    const prefix = options.message ?? "Changes saved";
    return `${prefix} · Last saved at ${formatAutosaveTime(options.lastSavedAt)}`;
  }
  return "Saved";
}

export function EditorStickyHeader({
  post,
  pending,
  saveLabel,
  publishLabel,
  lastMessage,
  autosaveStatus = "saved",
  autosaveMessage = null,
  autosaveError = null,
  autosaveLastSavedAt = null,
  onPauseAutosave,
  onResumeAutosave,
}: {
  post: Post;
  pending: boolean;
  saveLabel: string;
  publishLabel: string;
  lastMessage?: string;
  autosaveStatus?: AutosaveStatus;
  autosaveMessage?: string | null;
  autosaveError?: string | null;
  autosaveLastSavedAt?: Date | null;
  onPauseAutosave?: () => void;
  onResumeAutosave?: () => void;
}) {
  const router = useRouter();
  const [unpublishPending, startUnpublish] = useTransition();
  const displayTitle = post.title.trim() || "Untitled draft";
  const isPublished = post.status === "published";
  const autosaveLabel = autosaveIndicatorLabel({
    status: autosaveStatus,
    message: autosaveMessage,
    error: autosaveError,
    lastSavedAt: autosaveLastSavedAt,
  });

  return (
    <header className="sticky top-0 z-20 -mx-4 border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/admin/posts" className="text-[var(--primary)] underline">
              ← Posts
            </Link>
            <AdminStatusBadge status={post.status} />
            {post.readingTimeMinutes ? (
              <span className="text-[var(--muted)]">{post.readingTimeMinutes} min read</span>
            ) : null}
          </div>
          <h1 className="truncate text-lg font-semibold">{displayTitle}</h1>
          <p className="truncate font-mono text-xs text-[var(--muted)]">
            /blog/{post.slug}
            {isPublished ? (
              <>
                {" "}
                ·{" "}
                <a
                  href={publicPostPath(post.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--primary)] underline"
                >
                  Public URL ↗
                </a>
              </>
            ) : null}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Updated {formatEditorDate(post.updatedAt)}
            {lastMessage ? ` · ${lastMessage}` : null}
          </p>
          <p
            role="status"
            className={`text-xs ${
              autosaveStatus === "error"
                ? "text-red-600 dark:text-red-400"
                : autosaveStatus === "unsaved"
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-[var(--muted)]"
            }`}
          >
            {autosaveLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/posts/${post.id}/preview`}
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-subtle)]"
          >
            Preview
          </Link>
          <button
            type="submit"
            form={POST_EDITOR_FORM_ID}
            name="intent"
            value="save"
            disabled={pending}
            className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {pending ? "Saving…" : saveLabel}
          </button>
          {!isPublished ? (
            <button
              type="submit"
              form={POST_EDITOR_FORM_ID}
              name="intent"
              value="publish"
              disabled={pending}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Publishing…" : publishLabel}
            </button>
          ) : (
            <button
              type="button"
              disabled={unpublishPending}
              onClick={() => {
                onPauseAutosave?.();
                startUnpublish(async () => {
                  try {
                    const result = await unpublishPostAction(post.id);
                    if (!result.ok) {
                      window.alert(result.error ?? "Could not unpublish");
                      return;
                    }
                    router.refresh();
                  } finally {
                    onResumeAutosave?.();
                  }
                });
              }}
              className="rounded-md border border-orange-300 px-3 py-2 text-sm text-orange-800 disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
