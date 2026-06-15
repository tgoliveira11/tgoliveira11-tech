"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { archivePostAction } from "@/modules/posts/admin-posts.actions";

export function ArchiveButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Archive this post? It will be removed from public surfaces.")) {
          return;
        }
        startTransition(async () => {
          await archivePostAction(postId);
          router.refresh();
        });
      }}
      className="rounded-md border border-red-300 bg-[var(--card)] px-3 py-2 text-sm text-red-700 disabled:opacity-50"
    >
      Archive post
    </button>
  );
}
