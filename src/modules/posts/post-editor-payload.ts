import { POST_EDITOR_FORM_ID } from "@/components/admin/posts/editor-constants";

export const POST_EDITOR_DIRTY_EVENT = "postforge:post-editor-dirty";
export const POSTFORGE_AUTOSAVE_PAUSE_EVENT = "postforge:autosave-pause";
export const POSTFORGE_AUTOSAVE_RESUME_EVENT = "postforge:autosave-resume";

/** Fields compared for autosave deduplication (excludes intent and revision flags). */
const AUTOSAVE_PAYLOAD_KEYS = new Set([
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
]);

export function collectPostEditorFormData(
  formId: string = POST_EDITOR_FORM_ID
): FormData | null {
  if (typeof document === "undefined") return null;
  const form = document.getElementById(formId);
  if (!(form instanceof HTMLFormElement)) return null;
  return new FormData(form);
}

export function serializePostEditorPayload(formData: FormData): string {
  const entries = [...formData.entries()]
    .filter(([key]) => AUTOSAVE_PAYLOAD_KEYS.has(key))
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([left], [right]) => left.localeCompare(right));

  return JSON.stringify(entries);
}

export function notifyPostEditorDirty(formId: string = POST_EDITOR_FORM_ID): void {
  if (typeof document === "undefined") return;
  const form = document.getElementById(formId);
  if (!(form instanceof HTMLFormElement)) return;
  form.dispatchEvent(new Event("input", { bubbles: true }));
}

export function dispatchAutosavePause(): void {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new Event(POSTFORGE_AUTOSAVE_PAUSE_EVENT));
}

export function dispatchAutosaveResume(): void {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new Event(POSTFORGE_AUTOSAVE_RESUME_EVENT));
}

export function shouldRunAutosave(options: {
  userEdited: boolean;
  paused: boolean;
  payload: string;
  lastSavedPayload: string | null;
}): boolean {
  if (options.paused || !options.userEdited) return false;
  if (options.lastSavedPayload !== null && options.payload === options.lastSavedPayload) {
    return false;
  }
  return true;
}
