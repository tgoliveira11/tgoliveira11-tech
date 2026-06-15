import { describe, expect, it } from "vitest";
import { sanitizeFilename, assertSafeStorageKey } from "@/modules/assets/assets.validation";

describe("asset validation", () => {
  it("sanitizes unsafe filenames", () => {
    expect(sanitizeFilename("../../etc/passwd")).not.toContain("..");
    expect(sanitizeFilename("my photo (1).png")).toMatch(/my-photo/);
  });

  it("rejects path traversal in storage keys", () => {
    expect(() => assertSafeStorageKey("../secret")).toThrow();
    expect(() => assertSafeStorageKey("/absolute/path")).toThrow();
    expect(() => assertSafeStorageKey("posts/id/file.png")).not.toThrow();
  });
});
