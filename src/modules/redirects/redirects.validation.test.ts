import { describe, expect, it } from "vitest";
import { createRedirectSchema } from "./redirects.validation";

describe("createRedirectSchema", () => {
  it("requires paths to start with slash", () => {
    expect(createRedirectSchema.safeParse({ sourcePath: "old", targetPath: "/new" }).success).toBe(
      false
    );
    expect(createRedirectSchema.safeParse({ sourcePath: "/old", targetPath: "new" }).success).toBe(
      false
    );
  });

  it("defaults status code to 301", () => {
    const parsed = createRedirectSchema.parse({ sourcePath: "/old", targetPath: "/new" });
    expect(parsed.statusCode).toBe(301);
  });

  it("accepts custom redirect status codes", () => {
    const parsed = createRedirectSchema.parse({
      sourcePath: "/old",
      targetPath: "/new",
      statusCode: 308,
    });
    expect(parsed.statusCode).toBe(308);
  });

  it("rejects invalid status codes", () => {
    expect(
      createRedirectSchema.safeParse({
        sourcePath: "/old",
        targetPath: "/new",
        statusCode: 200,
      }).success
    ).toBe(false);
  });
});
