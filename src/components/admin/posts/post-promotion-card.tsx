"use client";

import { useState } from "react";
import { EditorCard } from "./editor-card";

export function PostPromotionCard({
  formId,
  featured,
  pinned,
  pinnedPriority,
}: {
  formId: string;
  featured: boolean;
  pinned: boolean;
  pinnedPriority: number;
}) {
  const [featuredChecked, setFeaturedChecked] = useState(featured);
  const [pinnedChecked, setPinnedChecked] = useState(pinned);

  return (
    <EditorCard
      title="Promotion"
      description="Featured and pinned posts can be highlighted on the public home page."
    >
      <input type="hidden" name="featured" form={formId} value={featuredChecked ? "true" : "false"} />
      <input type="hidden" name="pinned" form={formId} value={pinnedChecked ? "true" : "false"} />
      {!pinnedChecked ? <input type="hidden" name="pinnedPriority" form={formId} value="0" /> : null}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={featuredChecked}
          onChange={(event) => setFeaturedChecked(event.target.checked)}
        />
        Featured post
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={pinnedChecked}
          onChange={(event) => setPinnedChecked(event.target.checked)}
        />
        Pinned post
      </label>
      {pinnedChecked ? (
        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-medium">Pinned priority</span>
          <input
            type="number"
            name="pinnedPriority"
            form={formId}
            min={0}
            max={1000}
            defaultValue={pinnedPriority}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
          />
          <span className="mt-1 block text-xs text-[var(--muted)]">Higher values appear first among pinned posts.</span>
        </label>
      ) : null}
    </EditorCard>
  );
}
