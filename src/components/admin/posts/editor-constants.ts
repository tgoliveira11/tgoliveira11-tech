export const POST_EDITOR_FORM_ID = "post-editor-form";

/** Field names submitted by the post editor and parsed by updatePostAction. */
export const POST_EDITOR_FIELD_NAMES = [
  "createRevision",
  "title",
  "slug",
  "excerpt",
  "contentMarkdown",
  "categoryId",
  "tagIds",
  "seoTitle",
  "seoDescription",
  "canonicalUrl",
  "ogTitle",
  "ogDescription",
  "featured",
  "pinned",
  "pinnedPriority",
  "intent",
] as const;

export function formatEditorDate(value: Date | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
