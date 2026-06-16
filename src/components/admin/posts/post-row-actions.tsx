import type { Post } from "@/modules/posts/posts.types";
import {
  AdminActionIconButton,
  AdminActionIconLink,
} from "@/components/admin/admin-action-icon";

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
      <AdminActionIconLink
        href={`/admin/posts/${post.id}/edit`}
        icon="edit"
        label={`Edit ${post.title}`}
        title="Edit"
      />
      <AdminActionIconLink
        href={`/admin/posts/${post.id}/preview`}
        icon="preview"
        label={`Preview ${post.title}`}
        title="Preview"
      />
      {post.status !== "published" ? (
        <AdminActionIconButton
          icon="publish"
          label={`Publish ${post.title}`}
          title="Publish"
          disabled={pending}
          onClick={onPublish}
        />
      ) : (
        <AdminActionIconButton
          icon="unpublish"
          label={`Unpublish ${post.title}`}
          title="Unpublish"
          disabled={pending}
          onClick={onUnpublish}
        />
      )}
      <AdminActionIconButton
        icon="duplicate"
        label={`Duplicate ${post.title}`}
        title="Duplicate"
        disabled={pending}
        onClick={onDuplicate}
      />
      {post.status !== "archived" ? (
        <AdminActionIconButton
          icon="archive"
          label={`Archive ${post.title}`}
          title="Archive"
          destructive
          disabled={pending}
          onClick={onArchive}
        />
      ) : null}
    </div>
  );
}
