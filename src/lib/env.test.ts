import { afterEach, describe, expect, it } from "vitest";
import {
  readAnalyticsStoreRawIp,
  readEnv,
  readUploadMaxFileSizeBytes,
  requireEnv,
} from "@/lib/env";

describe("env readers", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("trims env values and treats blanks as undefined", () => {
    process.env.TEST_VALUE = "  hello  ";
    expect(readEnv("TEST_VALUE")).toBe("hello");

    process.env.TEST_VALUE = "   ";
    expect(readEnv("TEST_VALUE")).toBeUndefined();
  });

  it("requires env values to be set", () => {
    delete process.env.REQUIRED_VALUE;
    expect(() => requireEnv("REQUIRED_VALUE")).toThrow(/REQUIRED_VALUE is not set/);
  });

  it("falls back to default upload size for invalid values", () => {
    delete process.env.UPLOAD_MAX_FILE_SIZE_BYTES;
    expect(readUploadMaxFileSizeBytes()).toBe(5 * 1024 * 1024);

    process.env.UPLOAD_MAX_FILE_SIZE_BYTES = "not-a-number";
    expect(readUploadMaxFileSizeBytes()).toBe(5 * 1024 * 1024);

    process.env.UPLOAD_MAX_FILE_SIZE_BYTES = "1048576";
    expect(readUploadMaxFileSizeBytes()).toBe(1048576);
  });

  it("reads analytics raw-ip flag variants", () => {
    process.env.ANALYTICS_STORE_RAW_IP = "yes";
    expect(readAnalyticsStoreRawIp()).toBe(true);

    process.env.ANALYTICS_STORE_RAW_IP = "0";
    expect(readAnalyticsStoreRawIp()).toBe(false);
  });
});
