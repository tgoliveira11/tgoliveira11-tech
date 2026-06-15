import { describe, expect, it } from "vitest";
import { getSaveButtonLabel, getSaveSuccessMessage } from "@/modules/posts/admin-posts.messages";
import type { PostStatus } from "@/modules/posts/posts.types";

describe("admin post save messages", () => {
  it.each<[PostStatus, string]>([
    ["draft", "Draft saved"],
    ["published", "Published post updated"],
    ["scheduled", "Scheduled post updated"],
    ["unpublished", "Post updated"],
    ["archived", "Archived post updated"],
  ])("returns status-aware save message for %s", (status, message) => {
    expect(getSaveSuccessMessage(status)).toBe(message);
  });

  it.each<[PostStatus, string]>([
    ["draft", "Save draft"],
    ["published", "Save changes"],
    ["scheduled", "Save changes"],
    ["unpublished", "Save changes"],
    ["archived", "Save changes"],
  ])("returns status-aware save button label for %s", (status, label) => {
    expect(getSaveButtonLabel(status)).toBe(label);
  });
});
