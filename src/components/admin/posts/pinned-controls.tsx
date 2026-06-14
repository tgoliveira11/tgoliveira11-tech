"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pinPostAction, type ActionResult } from "@/modules/posts/admin-posts.actions";

const initialState: ActionResult = { ok: true };

export function PinnedControls({
  postId,
  pinned,
  pinnedPriority,
}: {
  postId: string;
  pinned: boolean;
  pinnedPriority: number;
}) {
  const router = useRouter();
  const boundAction = pinPostAction.bind(null, postId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.message) {
      router.refresh();
    }
  }, [state.message, router]);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Pinned</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Pinned posts appear first on the public home page, ordered by priority.
      </p>
      {state.message ? <p className="mt-2 text-sm text-emerald-700">{state.message}</p> : null}
      {state.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}
      <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2">
        <input type="hidden" name="pinned" value={pinned ? "false" : "true"} />
        <label className="text-sm">
          <span className="mb-1 block">Priority</span>
          <input
            type="number"
            name="pinnedPriority"
            min={0}
            max={1000}
            defaultValue={pinnedPriority}
            className="w-28 rounded-md border border-[var(--border)] px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
        >
          {pinned ? "Unpin" : "Pin post"}
        </button>
      </form>
    </section>
  );
}
