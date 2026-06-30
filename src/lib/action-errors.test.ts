import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import { AppError } from "@/lib/errors";
import { mapActionError } from "@/lib/action-errors";

describe("mapActionError", () => {
  it("returns the first Zod issue message", () => {
    const schema = z.object({ title: z.string().min(1, "Title is required") });
    const result = schema.safeParse({ title: "" });
    if (!result.success) {
      expect(mapActionError(result.error)).toBe("Title is required");
    }
  });

  it("falls back when Zod issues are empty", () => {
    const error = new ZodError([]);
    expect(mapActionError(error)).toBe("Validation failed");
  });

  it("returns AppError and generic Error messages", () => {
    expect(mapActionError(new AppError("Not allowed"))).toBe("Not allowed");
    expect(mapActionError(new Error("Boom"))).toBe("Boom");
  });

  it("uses fallback for unknown values and sensitive messages", () => {
    expect(mapActionError("nope")).toBe("Something went wrong");
    expect(mapActionError(new Error("postgres connection refused"))).toBe("Something went wrong");
    expect(mapActionError(new Error("invalid password"), "Custom fallback")).toBe("Custom fallback");
    expect(mapActionError(new Error(""), "Custom fallback")).toBe("Custom fallback");
  });
});
