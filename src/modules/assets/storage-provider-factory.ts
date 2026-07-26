import {
  readBlobReadWriteToken,
  readBlobStoreId,
  readUploadProvider,
  readVercelOidcToken,
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

  const oidcToken = readVercelOidcToken();
  const storeId = readBlobStoreId();
  if (oidcToken && storeId) {
    return new VercelBlobStorageProvider({ oidcToken, storeId });
  }

  const token = readBlobReadWriteToken();
  if (token) {
    return new VercelBlobStorageProvider({ token });
  }

  throw new Error(
    "Vercel Blob credentials are required when UPLOAD_PROVIDER=vercel-blob; set " +
      "VERCEL_OIDC_TOKEN with BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN"
  );
}
