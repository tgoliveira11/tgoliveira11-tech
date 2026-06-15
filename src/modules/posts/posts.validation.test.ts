import { describe, expect, it } from "vitest";
import {
  assertPublishablePost,
  assertScheduleDate,
  schedulePostSchema,
} from "@/modules/posts/posts.validation";

describe("post validation", () => {
  it("requires title, slug, and content for publishing", () => {
    expect(() =>
      assertPublishablePost({ title: "", slug: "valid-slug", contentMarkdown: "Body" })
    ).toThrow("title");

    expect(() =>
      assertPublishablePost({ title: "Title", slug: "bad_slug", contentMarkdown: "Body" })
    ).toThrow("slug");

    expect(() =>
      assertPublishablePost({ title: "Title", slug: "valid-slug", contentMarkdown: "   " })
    ).toThrow("Markdown");
  });

  it("requires future schedule date", () => {
    const past = new Date(Date.now() - 60_000);
    expect(() => assertScheduleDate(past)).toThrow("future");

    const future = new Date(Date.now() + 60_000);
    expect(() => assertScheduleDate(future)).not.toThrow();
  });

  it("parses schedule input", () => {
    const parsed = schedulePostSchema.parse({
      scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
    });
    expect(parsed.scheduledAt.getTime()).toBeGreaterThan(Date.now());
  });
});
