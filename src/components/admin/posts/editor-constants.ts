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

/** Summary field — tall enough for a real excerpt without dominating the page. */
export const EDITOR_EXCERPT_CLASS =
  "min-h-[7rem] w-full resize-y rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] md:min-h-[8rem]";

/** Main writing surface — grows on desktop to balance the metadata sidebar. */
export const EDITOR_CONTENT_MIN_HEIGHT_CLASS =
  "min-h-[clamp(20rem,50vh,32.5rem)] xl:min-h-[clamp(32.5rem,65vh,47.5rem)]";

export const EDITOR_CONTENT_TEXTAREA_CLASS = `w-full flex-1 rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${EDITOR_CONTENT_MIN_HEIGHT_CLASS}`;

export const EDITOR_CONTENT_PREVIEW_PANEL_CLASS = `flex flex-col ${EDITOR_CONTENT_MIN_HEIGHT_CLASS}`;

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
