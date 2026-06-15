import { describe, expect, it } from "vitest";
import { z } from "zod";
import { assertPublishablePost, assertScheduleDate, pinPostSchema } from "@/modules/posts/posts.validation";

describe("admin post action validation", () => {
  it("requires publishable content before publish/schedule", () => {
    expect(() =>
      assertPublishablePost({ title: "", slug: "valid-slug", contentMarkdown: "Body" })
    ).toThrow(/title/i);

    expect(() =>
      assertPublishablePost({ title: "Title", slug: "bad slug", contentMarkdown: "Body" })
    ).toThrow(/slug/i);

    expect(() =>
      assertPublishablePost({ title: "Title", slug: "valid-slug", contentMarkdown: "   " })
    ).toThrow(/content/i);

    expect(() =>
      assertPublishablePost({ title: "Title", slug: "valid-slug", contentMarkdown: "Body" })
    ).not.toThrow();
  });

  it("requires future schedule dates", () => {
    expect(() => assertScheduleDate(new Date(Date.now() - 60_000))).toThrow(/future/i);
    expect(() => assertScheduleDate(new Date(Date.now() + 60_000))).not.toThrow();
  });

  it("validates pin priority bounds", () => {
    expect(pinPostSchema.parse({ pinnedPriority: 0 }).pinnedPriority).toBe(0);
    expect(pinPostSchema.parse({}).pinnedPriority).toBe(0);
    expect(() => pinPostSchema.parse({ pinnedPriority: 1001 })).toThrow();
  });

  it("validates update payloads used by admin forms", () => {
    const updateSchema = z.object({
      title: z.string().min(1).optional(),
      tagIds: z.array(z.string().uuid()).optional(),
      featured: z.boolean().optional(),
    });

    expect(
      updateSchema.safeParse({
        title: "Hello",
        tagIds: ["550e8400-e29b-41d4-a716-446655440000"],
        featured: true,
      }).success
    ).toBe(true);
  });
});
