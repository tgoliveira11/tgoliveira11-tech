import { assertSafeStorageKey } from "./assets.validation";

/** Shared storage pathname for post assets across providers. */
export function buildPostAssetStorageKey(postId: string, safeFilename: string): string {
  const storageKey = `posts/${postId}/${safeFilename}`;
  assertSafeStorageKey(storageKey);
  return storageKey;
}
