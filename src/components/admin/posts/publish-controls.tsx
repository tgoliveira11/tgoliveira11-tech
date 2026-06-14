"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { PostStatus } from "@/modules/posts/posts.types";
import { publishPostAction, unpublishPostAction } from "@/modules/posts/admin-posts.actions";
import { publicPostPath } from "@/modules/posts/slug";

export function PublishControls({
  postId,
  status,
  slug,
}: {
  postId: string;
  status: PostStatus;
  slug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Publish</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {status === "published"
          ? "This post is live on the public blog."
          : "Publish when title, slug, and content are ready."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {status !== "published" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => publishPostAction(postId))}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Publish
          </button>
        ) : (
          <>
            <a
              href={publicPostPath(slug)}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
            >
              View public post ↗
            </a>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => unpublishPostAction(postId))}
              className="rounded-md border border-orange-300 px-4 py-2 text-sm text-orange-800 disabled:opacity-50"
            >
              Unpublish
            </button>
          </>
        )}
      </div>
    </section>
  );
}
