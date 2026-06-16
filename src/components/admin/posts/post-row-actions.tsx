import Link from "next/link";
import type { Post } from "@/modules/posts/posts.types";
import {
  ArchiveIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  UploadIcon,
} from "@/components/admin/admin-icons";

const actionButtonClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:opacity-50";

export function PostRowActions({
  post,
  pending,
  onPublish,
  onUnpublish,
  onDuplicate,
  onArchive,
}: {
  post: Post;
  pending: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link
        href={`/admin/posts/${post.id}/edit`}
        className={actionButtonClassName}
        aria-label={`Edit ${post.title}`}
        title="Edit"
      >
        <PencilIcon />
      </Link>
      <Link
        href={`/admin/posts/${post.id}/preview`}
        className={actionButtonClassName}
        aria-label={`Preview ${post.title}`}
        title="Preview"
      >
        <EyeIcon />
      </Link>
      {post.status !== "published" ? (
        <button
          type="button"
          disabled={pending}
          className={`${actionButtonClassName} text-emerald-700 hover:text-emerald-800`}
          aria-label={`Publish ${post.title}`}
          title="Publish"
          onClick={onPublish}
        >
          <UploadIcon />
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          className={`${actionButtonClassName} text-orange-700 hover:text-orange-800`}
          aria-label={`Unpublish ${post.title}`}
          title="Unpublish"
          onClick={onUnpublish}
        >
          <EyeOffIcon />
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        className={actionButtonClassName}
        aria-label={`Duplicate ${post.title}`}
        title="Duplicate"
        onClick={onDuplicate}
      >
        <CopyIcon />
      </button>
      {post.status !== "archived" ? (
        <button
          type="button"
          disabled={pending}
          className={`${actionButtonClassName} text-red-700 hover:text-red-800`}
          aria-label={`Archive ${post.title}`}
          title="Archive"
          onClick={onArchive}
        >
          <ArchiveIcon />
        </button>
      ) : null}
    </div>
  );
}
