import { describe, expect, it } from "vitest";
import { z } from "zod";

const bodySchema = z
  .object({
    slug: z.string().min(1).optional(),
    postId: z.string().uuid().optional(),
  })
  .refine((value) => value.slug || value.postId, {
    message: "slug or postId is required",
  });

describe("post-view analytics validation", () => {
  it("requires slug or postId", () => {
    expect(bodySchema.safeParse({}).success).toBe(false);
    expect(bodySchema.safeParse({ slug: "hello-world" }).success).toBe(true);
    expect(
      bodySchema.safeParse({ postId: "550e8400-e29b-41d4-a716-446655440000" }).success
    ).toBe(true);
  });

  it("rejects empty slug", () => {
    expect(bodySchema.safeParse({ slug: "" }).success).toBe(false);
  });

  it("rejects invalid postId", () => {
    expect(bodySchema.safeParse({ postId: "not-a-uuid" }).success).toBe(false);
  });
});
