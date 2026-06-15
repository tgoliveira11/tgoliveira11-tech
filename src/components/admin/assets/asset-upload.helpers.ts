export const ASSET_UPLOAD_INPUT_NAME = "file";
export const ASSET_UPLOAD_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

const ACCEPTED_MIME_TYPES = new Set(ASSET_UPLOAD_ACCEPT.split(","));

export type PickedUploadFile = {
  file: File | null;
  ignoredExtraCount: number;
};

export function pickFirstImageFile(files: FileList | File[]): PickedUploadFile {
  const list = Array.from(files);
  if (list.length === 0) {
    return { file: null, ignoredExtraCount: 0 };
  }

  const first = list.find((file) => ACCEPTED_MIME_TYPES.has(file.type)) ?? list[0] ?? null;
  return {
    file: first,
    ignoredExtraCount: Math.max(0, list.length - 1),
  };
}

export function assignFileToInput(input: HTMLInputElement | null, file: File | null) {
  if (!input) {
    return;
  }

  const dataTransfer = new DataTransfer();
  if (file) {
    dataTransfer.items.add(file);
  }
  input.files = dataTransfer.files;
}
