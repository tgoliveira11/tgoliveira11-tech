"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Asset } from "@/modules/assets/assets.types";
import { setPostOgAssetAction } from "@/modules/assets/admin-assets.actions";

export function OgImagePicker({
  postId,
  assets,
  ogAssetId,
}: {
  postId: string;
  assets: Asset[];
  ogAssetId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (assets.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Upload an image to set an OG image.</p>;
  }

  function apply(assetId: string | null) {
    startTransition(async () => {
      await setPostOgAssetAction(postId, assetId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Open Graph image</span>
        <select
          defaultValue={ogAssetId ?? ""}
          disabled={pending}
          onChange={(event) => apply(event.target.value || null)}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        >
          <option value="">No OG image</option>
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
