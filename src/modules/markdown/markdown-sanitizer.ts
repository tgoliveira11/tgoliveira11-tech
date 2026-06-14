import { defaultSchema } from "rehype-sanitize";

/** Shared rehype-sanitize schema for Markdown rendering. */
export const sanitizeSchema = defaultSchema;

export function getMarkdownSanitizeSchema() {
  return sanitizeSchema;
}
