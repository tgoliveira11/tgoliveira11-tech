import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("site header admin convenience link", () => {
  it("renders Admin link when showAdminLink is true", () => {
    const source = readSource("src/components/public/site-header.tsx");

    expect(source).toContain("showAdminLink");
    expect(source).toContain("AdminConvenienceLink");
    expect(source).toContain("showAdminLink ? <AdminConvenienceLink /> : null");
  });

  it("loads session server-side in public layout", () => {
    const source = readSource("src/components/public/public-layout.tsx");

    expect(source).toContain("hasAuthenticatedSession");
    expect(source).toContain("showAdminLink={showAdminLink}");
  });

  it("points Admin convenience link to /admin", () => {
    const source = readSource("src/components/public/admin-convenience-link.tsx");

    expect(source).toContain('href="/admin"');
    expect(source).toContain("Admin");
  });
});
