"use client";

import Link from "next/link";
import type { Asset } from "@/modules/assets/assets.types";
import { AssetGrid } from "./asset-grid";
import { AssetUploadForm } from "./asset-upload-form";
import { CoverImagePicker } from "./cover-image-picker";
import { OgImagePicker } from "./og-image-picker";

export function PostAssetsPanel({
  postId,
  postTitle,
  assets,
  coverAssetId,
  ogAssetId,
  onInsertMarkdown,
}: {
  postId: string;
  postTitle: string;
  assets: Asset[];
  coverAssetId: string | null;
  ogAssetId: string | null;
  onInsertMarkdown?: (markdown: string) => void;
}) {
  return (
    <section className="space-y-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Post images</h2>
          <p className="text-sm text-[var(--muted)]">Assets for “{postTitle}”</p>
        </div>
        <Link href={`/admin/posts/${postId}/assets`} className="text-sm text-[var(--primary)] underline">
          Manage all assets
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CoverImagePicker postId={postId} assets={assets} coverAssetId={coverAssetId} />
        <OgImagePicker postId={postId} assets={assets} ogAssetId={ogAssetId} />
      </div>

      {assets.length > 0 ? (
        <AssetGrid
          assets={assets.slice(0, 3)}
          coverAssetId={coverAssetId}
          ogAssetId={ogAssetId}
          onInsert={onInsertMarkdown}
        />
      ) : (
        <p className="text-sm text-[var(--muted)]">No images yet. Upload below or on the assets page.</p>
      )}

      <AssetUploadForm postId={postId} />
    </section>
  );
}
