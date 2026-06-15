"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong");
        setMessage(null);
        return;
      }
      setError(null);
      setMessage(result.message ?? null);
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Publish</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {status === "published"
          ? "This post is live on the public blog."
          : "Publishes the last saved version from the database. Open the editor and use Save and publish to include unsaved changes."}
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {status !== "published" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => publishPostAction(postId))}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Publish saved version
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
