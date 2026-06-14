"use client";

import { useState } from "react";
import { buildImageMarkdown } from "@/modules/assets/assets.utils";
import type { Asset } from "@/modules/assets/assets.types";
import { AssetMetadataForm } from "./asset-metadata-form";
import { AssetDeleteButton } from "./asset-delete-button";
import { AssetInsertButton } from "./asset-insert-button";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function AssetCard({
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
  const [copied, setCopied] = useState<string | null>(null);
  const markdown = buildImageMarkdown(asset);

  async function handleCopy(label: string, value: string) {
    await copyText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="aspect-video overflow-hidden rounded-md bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.publicUrl} alt={asset.altText ?? asset.originalFilename} className="h-full w-full object-cover" />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-medium">{asset.originalFilename}</p>
        <p className="break-all text-xs text-[var(--muted)]">{asset.publicUrl}</p>
        <p className="text-xs text-[var(--muted)]">
          {asset.mimeType} · {formatBytes(asset.fileSizeBytes)}
          {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {isCover ? <span className="rounded bg-blue-100 px-2 py-0.5">Cover</span> : null}
          {isOg ? <span className="rounded bg-purple-100 px-2 py-0.5">OG</span> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleCopy("url", asset.publicUrl)}
          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
        >
          {copied === "url" ? "Copied URL" : "Copy URL"}
        </button>
        <button
          type="button"
          onClick={() => handleCopy("markdown", markdown)}
          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
        >
          {copied === "markdown" ? "Copied Markdown" : "Copy Markdown"}
        </button>
        <AssetInsertButton markdown={markdown} onInsert={onInsert} />
      </div>

      <AssetMetadataForm asset={asset} />
      <div className="mt-3">
        <AssetDeleteButton assetId={asset.id} />
      </div>
    </article>
  );
}

export function AssetGrid({
  assets,
  coverAssetId,
  ogAssetId,
  onInsert,
}: {
  assets: Asset[];
  coverAssetId: string | null;
  ogAssetId: string | null;
  onInsert?: (markdown: string) => void;
}) {
  if (assets.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-sm text-[var(--muted)]">
        No images uploaded for this post yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isCover={coverAssetId === asset.id}
          isOg={ogAssetId === asset.id}
          onInsert={onInsert}
        />
      ))}
    </div>
  );
}
