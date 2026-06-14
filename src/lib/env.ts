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
  const raw = readEnv("UPLOAD_MAX_FILE_SIZE_BYTES") ?? readEnv("STORAGE_MAX_UPLOAD_BYTES");
  if (!raw) return 5 * 1024 * 1024;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5 * 1024 * 1024;
}
