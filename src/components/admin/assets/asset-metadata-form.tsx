"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  updateAssetMetadataAction,
  type AssetActionResult,
} from "@/modules/assets/admin-assets.actions";
import type { Asset } from "@/modules/assets/assets.types";

const initialState: AssetActionResult = { ok: true };

export function AssetMetadataForm({ asset }: { asset: Asset }) {
  const router = useRouter();
  const boundAction = updateAssetMetadataAction.bind(null, asset.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 space-y-2 border-t border-[var(--border)] pt-3"
      onSubmit={() => {
        setTimeout(() => router.refresh(), 0);
      }}
    >
      <label className="block text-xs">
        <span className="mb-1 block font-medium">Alt text</span>
        <input
          name="altText"
          defaultValue={asset.altText ?? ""}
          className="w-full rounded-md border border-[var(--border)] px-2 py-1"
        />
      </label>
      <label className="block text-xs">
        <span className="mb-1 block font-medium">Caption</span>
        <input
          name="caption"
          defaultValue={asset.caption ?? ""}
          className="w-full rounded-md border border-[var(--border)] px-2 py-1"
        />
      </label>
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      {state.message ? <p className="text-xs text-emerald-700">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save metadata"}
      </button>
    </form>
  );
}
