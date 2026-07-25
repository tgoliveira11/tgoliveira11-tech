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

    const linkedInIndex = footerSource.indexOf("LinkedIn");
    const resumeIndex = footerSource.indexOf("Résumé");
    const githubIndex = footerSource.indexOf("GitHub");
    const emailIndex = footerSource.indexOf("Email");
    const rssIndex = footerSource.indexOf("RSS");
    const aiEngineeringIndex = footerSource.indexOf("AI Engineering");

    expect(footerSource).toContain("resume_download");
    expect(footerSource).toContain("RESUME_DOWNLOAD_FILENAME");
    expect(footerSource).toContain("email_contact_click");
    expect(footerSource).toContain('target="_blank"');
    expect(footerSource).toContain('rel="noopener noreferrer"');
    expect(linkedInIndex).toBeGreaterThan(-1);
    expect(resumeIndex).toBeGreaterThan(linkedInIndex);
    expect(githubIndex).toBeGreaterThan(resumeIndex);
    expect(emailIndex).toBeGreaterThan(githubIndex);
    expect(rssIndex).toBeGreaterThan(emailIndex);
    expect(aiEngineeringIndex).toBeGreaterThan(rssIndex);
  });
});
