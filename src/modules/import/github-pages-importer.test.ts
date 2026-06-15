import { describe, expect, it, vi } from "vitest";
import { runGitHubPagesImport } from "./github-pages-importer";
import { createEmptyImportReport, formatImportReportSummary } from "./github-pages-report";
import type { GitHubPagesImportConfig, ImportWriter, ParsedLegacyPost } from "./github-pages.types";

vi.mock("./github-pages-parser", () => ({
  readLegacyMarkdownFiles: vi.fn(),
}));

import { readLegacyMarkdownFiles } from "./github-pages-parser";

function samplePost(overrides: Partial<ParsedLegacyPost> = {}): ParsedLegacyPost {
  return {
    sourcePath: "/legacy/my-post.md",
    relativePath: "my-post.md",
    title: "My Post",
    desiredSlug: "my-post",
    excerpt: "Summary",
    contentMarkdown: "![cover](./images/cover.png)",
    publishedAt: new Date("2024-01-15T00:00:00.000Z"),
    sourceStatus: "published",
    tags: ["news"],
    categories: ["Updates"],
    coverImageRef: "./images/cover.png",
    ogImageRef: null,
    oldPaths: ["/legacy/my-post"],
    unsupportedFrontmatter: [],
    warnings: [],
    errors: [],
    ...overrides,
  };
}

function createMockWriter(overrides: Partial<ImportWriter> = {}): ImportWriter {
  return {
    slugExists: vi.fn().mockResolvedValue(false),
    findOrCreateTag: vi.fn().mockResolvedValue({ id: "tag-1", created: true }),
    findOrCreateCategory: vi.fn().mockResolvedValue({ id: "cat-1", created: true }),
    redirectExists: vi.fn().mockResolvedValue(false),
    createDraft: vi.fn().mockResolvedValue({ id: "post-1", slug: "my-post" }),
    updateDraft: vi.fn().mockResolvedValue({ id: "post-1", slug: "my-post" }),
    publishPost: vi.fn().mockResolvedValue(undefined),
    uploadLocalImage: vi.fn().mockResolvedValue({
      publicUrl: "/api/assets/posts/post-1/cover.png",
      assetId: "asset-1",
    }),
    createRedirect: vi.fn().mockResolvedValue(undefined),
    resolveUserId: vi.fn().mockResolvedValue("user-1"),
    ...overrides,
  };
}

const config: GitHubPagesImportConfig = {
  sourceRoot: "/legacy",
  assetsRoot: "/legacy/assets",
  mode: "dry-run",
  defaultStatus: "draft",
  publishImported: false,
  preserveUrls: true,
  baseOldPath: "/",
  baseNewPath: "/blog",
  reportDir: ".import-reports",
};

describe("github-pages importer", () => {
  it("dry-run validates posts without writing drafts", async () => {
    vi.mocked(readLegacyMarkdownFiles).mockResolvedValue([samplePost()]);
    const writer = createMockWriter();

    const report = await runGitHubPagesImport(config, writer);

    expect(writer.createDraft).not.toHaveBeenCalled();
    expect(report.entries[0]?.status).toBe("planned");
    expect(report.redirectsCreated.length).toBeGreaterThan(0);
  });

  it("skips slug conflicts instead of overwriting", async () => {
    vi.mocked(readLegacyMarkdownFiles).mockResolvedValue([samplePost()]);
    const writer = createMockWriter({
      slugExists: vi.fn().mockResolvedValue(true),
    });

    const report = await runGitHubPagesImport({ ...config, mode: "import" }, writer);

    expect(writer.createDraft).not.toHaveBeenCalled();
    expect(report.slugConflicts).toHaveLength(1);
    expect(report.entries[0]?.status).toBe("skipped");
  });

  it("imports drafts by default and does not publish", async () => {
    vi.mocked(readLegacyMarkdownFiles).mockResolvedValue([samplePost()]);
    const writer = createMockWriter();

    const report = await runGitHubPagesImport({ ...config, mode: "import" }, writer);

    expect(writer.createDraft).toHaveBeenCalled();
    expect(writer.publishPost).not.toHaveBeenCalled();
    expect(report.postsCreated).toBe(1);
    expect(report.entries[0]?.status).toBe("imported");
  });

  it("formats import report summaries", () => {
    const report = createEmptyImportReport("dry-run");
    report.totalFilesScanned = 2;
    const summary = formatImportReportSummary(report);
    expect(summary).toContain("dry-run");
    expect(summary).toContain("Files scanned: 2");
  });
});
