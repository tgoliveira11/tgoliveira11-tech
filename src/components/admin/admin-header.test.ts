import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("admin header view site link", () => {
  it("renders an accessible link to the public home page before the theme toggle", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/admin/admin-header.tsx"),
      "utf8"
    );

    const viewSiteIndex = source.indexOf("View site");
    const themeToggleIndex = source.indexOf("<ThemeToggle");

    expect(source).toContain('href="/"');
    expect(source).toContain("View site");
    expect(viewSiteIndex).toBeGreaterThan(-1);
    expect(themeToggleIndex).toBeGreaterThan(-1);
    expect(viewSiteIndex).toBeLessThan(themeToggleIndex);
  });
});
