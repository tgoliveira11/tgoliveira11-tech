"use client";

import Link from "next/link";
import { useState } from "react";
import type { Asset } from "@/modules/assets/assets.types";
import { AssetInsertButton } from "./asset-insert-button";
import { AssetUploadForm } from "./asset-upload-form";
import { CoverImagePicker } from "./cover-image-picker";
import { OgImagePicker } from "./og-image-picker";
import { buildImageMarkdown } from "@/modules/assets/assets.utils";
import { EditorCard } from "@/components/admin/posts/editor-card";

function AssetThumb({
  asset,
  isCover,
  isOg,
  onInsert,
}: {
  asset: Asset;
  isCover: boolean;
  isOg: boolean;
  onInsert?: (markdown: string) => void;
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-2">
      <div className="aspect-video overflow-hidden rounded bg-[var(--surface-muted)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.publicUrl}
          alt={asset.altText ?? asset.originalFilename}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
        {isCover ? <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">Cover</span> : null}
        {isOg ? <span className="rounded bg-purple-100 px-1.5 py-0.5 text-purple-800">OG</span> : null}
      </div>
      <div className="mt-2">
        <AssetInsertButton markdown={buildImageMarkdown(asset)} onInsert={onInsert} />
      </div>
    </div>
  );
}

export function CompactPostAssetsPanel({
  postId,
  assets,
  coverAssetId,
  ogAssetId,
  onInsertMarkdown,
}: {
  postId: string;
  assets: Asset[];
  coverAssetId: string | null;
  ogAssetId: string | null;
  onInsertMarkdown?: (markdown: string) => void;
}) {
  const [showUpload, setShowUpload] = useState(assets.length === 0);
  const coverAsset = assets.find((asset) => asset.id === coverAssetId);
  const ogAsset = assets.find((asset) => asset.id === ogAssetId);

  return (
    <EditorCard
      title="Post images"
      description="Upload images for cover, OG, and Markdown insert."
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-[var(--border)] p-2">
            <p className="mb-1 font-medium text-[var(--muted)]">Cover</p>
            {coverAsset ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverAsset.publicUrl}
                alt=""
                className="aspect-video w-full rounded object-cover"
              />
            ) : (
              <p className="text-[var(--muted)]">Not set</p>
            )}
          </div>
          <div className="rounded-md border border-[var(--border)] p-2">
            <p className="mb-1 font-medium text-[var(--muted)]">OG</p>
            {ogAsset ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ogAsset.publicUrl} alt="" className="aspect-video w-full rounded object-cover" />
            ) : (
              <p className="text-[var(--muted)]">Not set</p>
            )}
          </div>
        </div>

        {assets.length > 0 ? (
          <>
            <CoverImagePicker postId={postId} assets={assets} coverAssetId={coverAssetId} />
            <OgImagePicker postId={postId} assets={assets} ogAssetId={ogAssetId} />
            <div className="grid grid-cols-2 gap-2">
              {assets.slice(0, 4).map((asset) => (
                <AssetThumb
                  key={asset.id}
                  asset={asset}
                  isCover={coverAssetId === asset.id}
                  isOg={ogAssetId === asset.id}
                  onInsert={onInsertMarkdown}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="rounded-md border border-dashed border-[var(--border)] px-3 py-4 text-xs text-[var(--muted)]">
            No images yet. Upload an image to use it as a cover, OG image, or insert it into the
            Markdown body.
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowUpload((current) => !current)}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-subtle)]"
        >
          {showUpload ? "Hide upload form" : assets.length === 0 ? "Upload image" : "Upload another image"}
        </button>

        {showUpload ? <AssetUploadForm postId={postId} compact /> : null}

        <Link
          href={`/admin/posts/${postId}/assets`}
          className="block text-center text-xs text-[var(--primary)] underline"
        >
          Manage all assets
        </Link>
      </div>
    </EditorCard>
  );
}
