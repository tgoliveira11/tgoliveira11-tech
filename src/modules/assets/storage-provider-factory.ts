import {
  readBlobReadWriteToken,
  readUploadProvider,
  type UploadProviderName,
} from "@/lib/env";
import { LocalStorageProvider } from "./local-storage-provider";
import type { StorageProvider } from "./storage-provider";
import { VercelBlobStorageProvider } from "./vercel-blob-storage-provider";

export function resolveUploadProviderName(
  raw = readUploadProvider()
): UploadProviderName {
  const value = (raw ?? "local").toLowerCase();
  if (value === "local" || value === "vercel-blob") {
    return value;
  }
  throw new Error(
    `Unsupported UPLOAD_PROVIDER "${raw}". Expected "local" or "vercel-blob".`
  );
}

export function createStorageProvider(providerName?: UploadProviderName): StorageProvider {
  const name = providerName ?? resolveUploadProviderName();

  if (name === "local") {
    return new LocalStorageProvider();
  }

  const token = readBlobReadWriteToken();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required when UPLOAD_PROVIDER=vercel-blob");
  }

  return new VercelBlobStorageProvider(token);
}
