import type { Asset } from "./assets.types";

export function buildImageMarkdown(asset: Pick<Asset, "altText" | "originalFilename" | "publicUrl">): string {
  const alt = asset.altText?.trim() || asset.originalFilename;
  return `![${alt}](${asset.publicUrl})`;
}

export function isRemoteAssetUrl(publicUrl: string): boolean {
  return publicUrl.startsWith("http://") || publicUrl.startsWith("https://");
}
