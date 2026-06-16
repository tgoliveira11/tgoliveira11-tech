export function readEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function requireEnv(key: string): string {
  const value = readEnv(key);
  if (!value) {
    throw new Error(`${key} is not set`);
  }
  return value;
}

export function readAdminEmail(): string | undefined {
  return readEnv("ADMIN_EMAIL")?.toLowerCase();
}

export function readUploadLocalDir(): string {
  return readEnv("UPLOAD_LOCAL_DIR") ?? "./storage/uploads";
}

export function readUploadPublicBaseUrl(): string {
  return readEnv("UPLOAD_PUBLIC_BASE_URL") ?? "/api/assets";
}

export function readUploadMaxFileSizeBytes(): number {
  const raw =
    readEnv("UPLOAD_MAX_FILE_SIZE_BYTES") ??
    readEnv("UPLOAD_MAX_FILE_SIZE") ??
    readEnv("STORAGE_MAX_UPLOAD_BYTES");
  if (!raw) return 5 * 1024 * 1024;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5 * 1024 * 1024;
}

export type UploadProviderName = "local" | "vercel-blob";

export function readUploadProvider(): string | undefined {
  return readEnv("UPLOAD_PROVIDER");
}

export function readBlobReadWriteToken(): string | undefined {
  return readEnv("BLOB_READ_WRITE_TOKEN");
}

const DEFAULT_PUBLIC_POSTS_PAGE_SIZE = 5;
const MAX_PUBLIC_POSTS_PAGE_SIZE = 50;

export function readPublicPostsPageSize(): number {
  const raw = readEnv("PUBLIC_POSTS_PAGE_SIZE");
  if (!raw) return DEFAULT_PUBLIC_POSTS_PAGE_SIZE;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_PUBLIC_POSTS_PAGE_SIZE;
  }
  return Math.min(parsed, MAX_PUBLIC_POSTS_PAGE_SIZE);
}
