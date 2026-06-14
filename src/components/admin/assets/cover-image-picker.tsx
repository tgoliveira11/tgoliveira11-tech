"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Asset } from "@/modules/assets/assets.types";
import { setPostCoverAssetAction } from "@/modules/assets/admin-assets.actions";

export function CoverImagePicker({
  postId,
  assets,
  coverAssetId,
}: {
  postId: string;
  assets: Asset[];
  coverAssetId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (assets.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Upload an image to set a cover.</p>;
  }

  function apply(assetId: string | null) {
    startTransition(async () => {
      await setPostCoverAssetAction(postId, assetId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Cover image</span>
        <select
          defaultValue={coverAssetId ?? ""}
          disabled={pending}
          onChange={(event) => apply(event.target.value || null)}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        >
          <option value="">No cover image</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.originalFilename}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
