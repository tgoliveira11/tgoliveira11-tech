import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const PUBLIC_SOURCE_ROOTS = [
  "src/app/(public)",
  "src/app/llms-full.txt",
  "src/app/llms.txt",
  "src/app/rss.xml",
  "src/components/public",
  "src/modules/public",
];

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return listSourceFiles(path);
    }
    if (![".ts", ".tsx"].includes(extname(entry.name)) || entry.name.includes(".test.")) {
      return [];
    }
    return [path];
  });
}

describe("public privacy boundaries", () => {
  it("does not expose direct email contact details or tracking", () => {
    const repositoryRoot = process.cwd();
    const violations = PUBLIC_SOURCE_ROOTS.flatMap((sourceRoot) =>
      listSourceFiles(resolve(repositoryRoot, sourceRoot)).flatMap((path) => {
        const source = readFileSync(path, "utf8");
        const hasDirectEmailAction = source.toLowerCase().includes("mailto:");
        const hasEmailAddress = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(source);
        const hasRemovedAnalyticsEvent = source.includes("email_contact_click");

        return hasDirectEmailAction || hasEmailAddress || hasRemovedAnalyticsEvent
          ? [relative(repositoryRoot, path)]
          : [];
      })
    );

    expect(violations).toEqual([]);
  });
});
