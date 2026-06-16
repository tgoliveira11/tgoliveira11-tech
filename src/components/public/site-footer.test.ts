import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("site footer rss link", () => {
  it("opens rss in a new tab with noopener noreferrer", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/public/site-footer.tsx"),
      "utf8"
    );

    expect(source).toContain('href="/rss.xml"');
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener noreferrer"');
  });
});
