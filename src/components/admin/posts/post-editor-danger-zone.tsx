import { AdminDangerZone } from "../admin-danger-zone";
import { ArchiveButton } from "./archive-button";

export function PostEditorDangerZone({ postId }: { postId: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 p-1 dark:border-red-900 dark:bg-red-950/20">
      <AdminDangerZone
        title="Archive post"
        description="Archived posts are hidden from public surfaces but preserved in the admin."
      >
        <ArchiveButton postId={postId} />
      </AdminDangerZone>
    </div>
  );
}
