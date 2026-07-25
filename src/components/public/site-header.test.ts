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

  it("uses a hamburger menu for mobile public navigation", () => {
    const headerSource = readSource("src/components/public/site-header.tsx");
    const navSource = readSource("src/components/public/site-nav.tsx");

    expect(navSource).toContain("Toggle navigation");
    expect(navSource).toContain("aria-expanded");
    expect(navSource).toContain("md:hidden");
    expect(navSource).toContain("absolute left-4 right-4 top-full");
    expect(headerSource).toContain("grid-cols-[minmax(0,1fr)_auto]");
  });

  it("shows the theme toggle only from the desktop navigation breakpoint", () => {
    const source = readSource("src/components/public/site-header.tsx");

    expect(source).toContain('className="hidden shrink-0 items-center gap-2 md:flex"');
    expect(source).not.toContain("lg:hidden");
  });
});
