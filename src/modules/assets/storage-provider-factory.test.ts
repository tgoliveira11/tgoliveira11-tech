import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalStorageProvider } from "@/modules/assets/local-storage-provider";
import {
  createStorageProvider,
  resolveUploadProviderName,
} from "@/modules/assets/storage-provider-factory";
import { VercelBlobStorageProvider } from "@/modules/assets/vercel-blob-storage-provider";

describe("storage provider factory", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("defaults to local provider", () => {
    delete process.env.UPLOAD_PROVIDER;
    const provider = createStorageProvider();
    expect(provider).toBeInstanceOf(LocalStorageProvider);
    expect(provider.name).toBe("local");
  });

  it("returns LocalStorageProvider for UPLOAD_PROVIDER=local", () => {
    process.env.UPLOAD_PROVIDER = "local";
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const provider = createStorageProvider("local");
    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });

  it("returns VercelBlobStorageProvider for UPLOAD_PROVIDER=vercel-blob", () => {
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    const provider = createStorageProvider("vercel-blob");
    expect(provider).toBeInstanceOf(VercelBlobStorageProvider);
    expect(provider.name).toBe("vercel-blob");
  });

  it("requires BLOB_READ_WRITE_TOKEN only for vercel-blob", () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    expect(() => createStorageProvider("vercel-blob")).toThrow(/BLOB_READ_WRITE_TOKEN/);
    expect(() => createStorageProvider("local")).not.toThrow();
  });

  it("rejects unknown UPLOAD_PROVIDER values", () => {
    expect(() => resolveUploadProviderName("s3")).toThrow(/Unsupported UPLOAD_PROVIDER/);
  });
});
