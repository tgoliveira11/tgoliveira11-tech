import { describe, expect, it } from "vitest";
import { buildPostAssetStorageKey } from "@/modules/assets/storage-keys";
import { isRemoteAssetUrl } from "@/modules/assets/assets.utils";

describe("asset storage helpers", () => {
  it("builds post-scoped storage keys", () => {
    expect(buildPostAssetStorageKey("post-id", "photo.png")).toBe("posts/post-id/photo.png");
  });

  it("rejects traversal in storage keys", () => {
    expect(() => buildPostAssetStorageKey("post-id", "../escape.png")).toThrow(/Invalid storage key/);
  });

  it("detects remote asset URLs", () => {
    expect(isRemoteAssetUrl("https://abc.public.blob.vercel-storage.com/a.png")).toBe(true);
    expect(isRemoteAssetUrl("/api/assets/posts/id/a.png")).toBe(false);
  });
});
