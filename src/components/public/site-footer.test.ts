import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("site footer links", () => {
  it("opens rss in a new tab with noopener noreferrer", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/public/site-footer.tsx"),
      "utf8"
    );

    expect(source).toContain('href="/rss.xml"');
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener noreferrer"');
  });

  it("prioritizes professional links before editorial navigation", () => {
    const footerSource = readFileSync(
      resolve(process.cwd(), "src/components/public/site-footer.tsx"),
      "utf8"
    );
    const authorProfileSource = readFileSync(
      resolve(process.cwd(), "src/modules/public/author-profile.ts"),
      "utf8"
    );

    const linkedInIndex = footerSource.indexOf("LinkedIn");
    const githubIndex = footerSource.indexOf("GitHub");
    const rssIndex = footerSource.indexOf("RSS");
    const aiEngineeringIndex = footerSource.indexOf("AI Engineering");

    expect(footerSource).not.toContain("download=");
    expect(footerSource).not.toContain("data-analytics-file");
    expect(footerSource).not.toContain("mailto:");
    expect(footerSource).not.toContain("email_contact_click");
    expect(authorProfileSource).not.toContain("email:");
    expect(authorProfileSource).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(footerSource).toContain('target="_blank"');
    expect(footerSource).toContain('rel="noopener noreferrer"');
    expect(linkedInIndex).toBeGreaterThan(-1);
    expect(githubIndex).toBeGreaterThan(linkedInIndex);
    expect(rssIndex).toBeGreaterThan(githubIndex);
    expect(aiEngineeringIndex).toBeGreaterThan(rssIndex);
  });
});
