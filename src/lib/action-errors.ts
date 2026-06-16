import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

const SENSITIVE_PATTERNS = [
  /postgres/i,
  /password/i,
  /secret/i,
  /DATABASE_URL/i,
  /connection refused/i,
  /ECONNREFUSED/i,
];

export const ASSET_UPLOAD_ERROR_MESSAGE =
  "Image upload failed. Please check the file type and size.";

export const AUTOSAVE_FAILED_MESSAGE =
  "Autosave failed. Your changes are still in the editor.";

export function mapActionError(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Validation failed";
  }

  const message =
    error instanceof AppError
      ? error.message
      : error instanceof Error
        ? error.message
        : fallback;

  if (!message || SENSITIVE_PATTERNS.some((pattern) => pattern.test(message))) {
    return fallback;
  }

  return message;
}
