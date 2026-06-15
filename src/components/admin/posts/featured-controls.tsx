"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markFeaturedAction } from "@/modules/posts/admin-posts.actions";

export function FeaturedControls({ postId, featured }: { postId: string; featured: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Featured</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Featured posts can be highlighted on the public home page.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await markFeaturedAction(postId, !featured);
            router.refresh();
          })
        }
        className="mt-3 rounded-md border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
      >
        {featured ? "Unmark featured" : "Mark featured"}
      </button>
    </section>
  );
}
