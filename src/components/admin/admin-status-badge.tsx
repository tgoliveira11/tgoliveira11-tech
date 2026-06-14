import type { PostStatus } from "@/modules/posts/posts.types";

const styles: Record<PostStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  scheduled: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  unpublished: "bg-orange-100 text-orange-800",
  archived: "bg-zinc-200 text-zinc-700",
};

export function AdminStatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
