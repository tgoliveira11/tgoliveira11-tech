"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AdminActionIconButton } from "@/components/admin/admin-action-icon";
import { deleteAssetAction } from "@/modules/assets/admin-assets.actions";

export function AssetDeleteButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <AdminActionIconButton
      icon="delete"
      label="Delete image"
      title="Delete"
      destructive
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
    />
  );
}
