"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteAssetAction } from "@/modules/assets/admin-assets.actions";

export function AssetDeleteButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            "Delete this image? Markdown references will not be rewritten automatically and may break."
          )
        ) {
          return;
        }
        startTransition(async () => {
          await deleteAssetAction(assetId);
          router.refresh();
        });
      }}
      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
