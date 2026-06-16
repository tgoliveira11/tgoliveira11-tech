"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Post } from "@/modules/posts/posts.types";
import {
  clearPostPublicOrderAction,
  movePostPublicOrderAction,
  updatePostPublicOrderAction,
} from "@/modules/posts/admin-posts.actions";

const MAX_PUBLIC_ORDER = 9999;

export function PublicOrderControls({
  post,
  canMoveUp,
  canMoveDown,
}: {
  post: Post;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const currentOrder = post.publicOrder ?? 0;
  const [value, setValue] = useState(currentOrder.toString());

  if (post.status !== "published") {
    return (
      <span className="text-xs text-[var(--muted)]" title="Only published posts appear in public ordering">
        —
      </span>
    );
  }

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="flex min-w-40 flex-col gap-1">
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={MAX_PUBLIC_ORDER}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-16 rounded border border-[var(--border)] px-2 py-1 text-xs"
          aria-label={`Public order for ${post.title}`}
          disabled={pending}
        />
        <button
          type="button"
          disabled={pending || value === ""}
          className="rounded border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-50"
          onClick={() => {
            const formData = new FormData();
            formData.set("publicOrder", value);
            run(() => updatePostPublicOrderAction(post.id, { ok: false }, formData));
          }}
        >
          Set
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          disabled={pending || !canMoveUp}
          className="rounded border border-[var(--border)] px-2 py-0.5 text-xs disabled:opacity-50"
          onClick={() => run(() => movePostPublicOrderAction(post.id, "up"))}
          aria-label={`Move ${post.title} up in public order`}
          title={!canMoveUp ? "Already at minimum public order (0)" : undefined}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={pending || !canMoveDown}
          className="rounded border border-[var(--border)] px-2 py-0.5 text-xs disabled:opacity-50"
          onClick={() => run(() => movePostPublicOrderAction(post.id, "down"))}
          aria-label={`Move ${post.title} down in public order`}
          title={!canMoveDown ? "Already at maximum public order" : undefined}
        >
          ↓
        </button>
        <button
          type="button"
          disabled={pending || currentOrder === 0}
          className="rounded border border-[var(--border)] px-2 py-0.5 text-xs disabled:opacity-50"
          onClick={() => run(() => clearPostPublicOrderAction(post.id))}
        >
          Reset
        </button>
      </div>
      <span className="text-xs text-[var(--muted)]">#{currentOrder}</span>
    </div>
  );
}
