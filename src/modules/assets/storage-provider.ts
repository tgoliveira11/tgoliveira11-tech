export type StorageUploadInput = {
  storageKey: string;
  buffer: Buffer;
  mimeType: string;
};

export type StorageUploadResult = {
  storageKey: string;
  publicUrl: string;
};

export interface StorageProvider {
  readonly name: string;
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  delete(storageKey: string): Promise<void>;
  getPublicUrl(storageKey: string): string;
}
