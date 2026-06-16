import { describe, expect, it } from "vitest";
import {
  getLegacyPostRedirectPath,
  LEGACY_ROOT_POST_PATH_PATTERN,
  parseLegacyRootPostSlug,
} from "./legacy-post-redirect";

describe("legacy root post redirect", () => {
  it("matches date-prefixed legacy post slugs", () => {
    expect(LEGACY_ROOT_POST_PATH_PATTERN.test("/2022-06-01-remote-work")).toBe(true);
    expect(LEGACY_ROOT_POST_PATH_PATTERN.test("/2023-06-16-software-solution-system-architecture")).toBe(
      true
    );
    expect(LEGACY_ROOT_POST_PATH_PATTERN.test("/2022-06-01-remote-work/")).toBe(true);
  });

  it("parses slug without trailing slash", () => {
    expect(parseLegacyRootPostSlug("/2022-06-01-remote-work")).toBe("2022-06-01-remote-work");
  });

  it("parses slug with trailing slash", () => {
    expect(parseLegacyRootPostSlug("/2022-06-01-remote-work/")).toBe("2022-06-01-remote-work");
  });

  it("normalizes slug casing", () => {
    expect(parseLegacyRootPostSlug("/2022-06-01-Remote-Work")).toBe("2022-06-01-remote-work");
  });

  it("builds canonical /blog redirect targets", () => {
    expect(getLegacyPostRedirectPath("/2023-06-16-software-solution-system-architecture")).toBe(
      "/blog/2023-06-16-software-solution-system-architecture"
    );
    expect(getLegacyPostRedirectPath("/2022-06-01-remote-work/")).toBe("/blog/2022-06-01-remote-work");
  });

  it("does not match canonical blog routes", () => {
    expect(getLegacyPostRedirectPath("/blog/2022-06-01-remote-work")).toBeNull();
  });

  it("does not match public pages", () => {
    for (const path of ["/", "/blog", "/search", "/tags", "/categories", "/about"]) {
      expect(getLegacyPostRedirectPath(path)).toBeNull();
    }
  });

  it("does not match admin, auth, or API routes", () => {
    for (const path of ["/admin", "/login", "/register", "/api/auth/session"]) {
      expect(getLegacyPostRedirectPath(path)).toBeNull();
    }
  });

  it("does not match metadata or framework paths", () => {
    for (const path of ["/robots.txt", "/sitemap.xml", "/favicon.ico", "/_next/static/chunk.js"]) {
      expect(getLegacyPostRedirectPath(path)).toBeNull();
    }
  });

  it("does not match multi-segment paths", () => {
    expect(getLegacyPostRedirectPath("/2022/06/01/remote-work")).toBeNull();
    expect(getLegacyPostRedirectPath("/tags/2022-06-01-remote-work")).toBeNull();
  });

  it("does not match slugs without a date prefix", () => {
    expect(getLegacyPostRedirectPath("/remote-work")).toBeNull();
    expect(getLegacyPostRedirectPath("/about-me")).toBeNull();
  });
});
