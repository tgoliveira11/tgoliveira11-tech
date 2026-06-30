import { describe, expect, it } from "vitest";
import { buildAuthActionUrl, extractFirstUrl } from "@/lib/email/templates/email-url";

describe("email url helpers", () => {
  it("builds auth action URLs with normalized base and path", () => {
    expect(buildAuthActionUrl("https://example.com/", "/reset", "tok en")).toBe(
      "https://example.com/reset?token=tok%20en"
    );
    expect(buildAuthActionUrl("https://example.com", "verify", "abc")).toBe(
      "https://example.com/verify?token=abc"
    );
  });

  it("extracts the first URL from text", () => {
    expect(extractFirstUrl(undefined)).toBeUndefined();
    expect(extractFirstUrl("")).toBeUndefined();
    expect(extractFirstUrl("Visit https://example.com/path today")).toBe("https://example.com/path");
    expect(extractFirstUrl("No links here")).toBeUndefined();
  });
});
