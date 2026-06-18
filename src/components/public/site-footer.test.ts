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

  it("renders SK external link after RSS", () => {
    const footerSource = readFileSync(
      resolve(process.cwd(), "src/components/public/site-footer.tsx"),
      "utf8"
    );
    const configSource = readFileSync(
      resolve(process.cwd(), "src/modules/public/public-site-config.ts"),
      "utf8"
    );

    const rssIndex = footerSource.indexOf("RSS");
    const skIndex = footerSource.indexOf("SK");

    expect(configSource).toContain("https://selahkeep.com");
    expect(footerSource).toContain("PUBLIC_SITE_CONFIG.footer.skUrl");
    expect(footerSource).toContain('target="_blank"');
    expect(footerSource).toContain('rel="noopener noreferrer"');
    expect(rssIndex).toBeGreaterThan(-1);
    expect(skIndex).toBeGreaterThan(rssIndex);
  });
});
