import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readPublicSiteTheme } from "@/lib/env";

describe("readPublicSiteTheme", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PUBLIC_SITE_THEME;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns null when env is unset", () => {
    expect(readPublicSiteTheme()).toBeNull();
  });

  it("returns null when env is empty", () => {
    process.env.PUBLIC_SITE_THEME = "   ";
    expect(readPublicSiteTheme()).toBeNull();
  });

  it("returns light when env is light", () => {
    process.env.PUBLIC_SITE_THEME = "light";
    expect(readPublicSiteTheme()).toBe("light");
  });

  it("returns dark when env is dark", () => {
    process.env.PUBLIC_SITE_THEME = "DARK";
    expect(readPublicSiteTheme()).toBe("dark");
  });

  it("returns null for invalid values", () => {
    process.env.PUBLIC_SITE_THEME = "system";
    expect(readPublicSiteTheme()).toBeNull();
  });
});
