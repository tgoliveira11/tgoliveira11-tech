import { describe, expect, it } from "vitest";
import { getMarkdownSanitizeSchema, sanitizeSchema } from "./markdown-sanitizer";

describe("markdown sanitizer", () => {
  it("exposes the default rehype sanitize schema", () => {
    expect(getMarkdownSanitizeSchema()).toBe(sanitizeSchema);
    expect(sanitizeSchema.tagNames).toBeTruthy();
  });
});
