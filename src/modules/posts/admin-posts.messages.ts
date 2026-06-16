import type { PostStatus } from "@/modules/posts/posts.types";

export function getSaveSuccessMessage(status: PostStatus): string {
  switch (status) {
    case "draft":
      return "Draft saved";
    case "published":
      return "Published post updated";
    case "scheduled":
      return "Scheduled post updated";
    case "unpublished":
      return "Post updated";
    case "archived":
      return "Archived post updated";
    default:
      return "Post updated";
  }
}

export function getSaveButtonLabel(status: PostStatus): string {
  return status === "draft" ? "Save draft" : "Save changes";
}

export function getAutosaveSuccessMessage(status: PostStatus): string {
  return status === "draft" ? "Draft saved" : "Changes saved";
}
