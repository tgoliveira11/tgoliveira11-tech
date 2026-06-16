import { updatePostSchema, type UpdatePostInput } from "./posts.validation";

export type PostEditorIntent = "save" | "publish";

export function readPostEditorIntent(formData: FormData): PostEditorIntent {
  return formData.get("intent") === "publish" ? "publish" : "save";
}

function parseTagIds(formData: FormData): string[] | undefined {
  if (!formData.has("tagIds")) {
    return undefined;
  }

  return formData
    .getAll("tagIds")
    .map((value) => String(value))
    .filter(Boolean);
}

function nullableField(formData: FormData, key: string): string | null | undefined {
  if (!formData.has(key)) return undefined;
  const value = formData.get(key);
  if (value === null || value === "") return null;
  return String(value);
}

function optionalBoolean(formData: FormData, key: string): boolean | undefined {
  if (!formData.has(key)) return undefined;
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function optionalStringField(formData: FormData, key: string): string | undefined {
  if (!formData.has(key)) return undefined;
  const value = formData.get(key);
  if (value === null) return undefined;
  return String(value);
}

/** Maps editor FormData to the update schema. Omitted fields are left undefined to preserve DB values. */
export function parseUpdatePostFormData(formData: FormData): UpdatePostInput {
  return updatePostSchema.parse({
    title: optionalStringField(formData, "title"),
    slug: optionalStringField(formData, "slug"),
    excerpt: nullableField(formData, "excerpt"),
    contentMarkdown: optionalStringField(formData, "contentMarkdown"),
    categoryId: nullableField(formData, "categoryId"),
    tagIds: parseTagIds(formData),
    seoTitle: nullableField(formData, "seoTitle"),
    seoDescription: nullableField(formData, "seoDescription"),
    canonicalUrl: nullableField(formData, "canonicalUrl"),
    ogTitle: nullableField(formData, "ogTitle"),
    ogDescription: nullableField(formData, "ogDescription"),
    featured: optionalBoolean(formData, "featured"),
    pinned: optionalBoolean(formData, "pinned"),
    pinnedPriority: formData.has("pinnedPriority")
      ? Number(formData.get("pinnedPriority"))
      : undefined,
    createRevision: formData.get("createRevision") === "true",
  });
}
