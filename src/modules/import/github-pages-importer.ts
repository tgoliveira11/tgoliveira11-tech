import path from "node:path";
import { publicPostPath } from "@/modules/posts/slug";
import { readLegacyMarkdownFiles } from "./github-pages-parser";
import {
  extractMarkdownImageReferences,
  localImageExists,
  resolveCoverImagePath,
  resolveLocalImagePath,
  rewriteMarkdownImages,
} from "./github-pages-images";
import {
  addReportEntry,
  createEmptyImportReport,
  finalizeImportReport,
  formatImportReportSummary,
  writeImportReportFile,
} from "./github-pages-report";
import { mapTargetPath, normalizeLegacyPath } from "./github-pages-writer";
import { normalizeUrlPath } from "./github-pages.validation";
import type {
  GitHubPagesImportConfig,
  ImportReport,
  ImportWriter,
  ParsedLegacyPost,
} from "./github-pages.types";

function shouldPublishPost(
  parsed: ParsedLegacyPost,
  config: GitHubPagesImportConfig
): boolean {
  if (!config.publishImported) {
    return false;
  }
  if (config.defaultStatus === "published") {
    return true;
  }
  return parsed.sourceStatus === "published";
}

async function planRedirects(input: {
  parsed: ParsedLegacyPost;
  targetPath: string;
  config: GitHubPagesImportConfig;
  writer: ImportWriter;
  report: ImportReport;
}): Promise<void> {
  if (!input.config.preserveUrls) {
    return;
  }

  const uniqueOldPaths = [...new Set(input.parsed.oldPaths.map((value) => normalizeUrlPath(value)))];

  for (const oldPath of uniqueOldPaths) {
    const normalizedOld = normalizeLegacyPath(oldPath, input.config.baseOldPath);
    if (normalizedOld === input.targetPath) {
      continue;
    }

    if (await input.writer.redirectExists(normalizedOld)) {
      input.report.redirectsSkipped.push({
        sourcePath: normalizedOld,
        reason: "Redirect already exists",
      });
      continue;
    }

    if (input.config.mode === "import") {
      await input.writer.createRedirect(normalizedOld, input.targetPath);
    }

    input.report.redirectsCreated.push({
      sourcePath: normalizedOld,
      targetPath: input.targetPath,
    });
  }
}

async function processImages(input: {
  parsed: ParsedLegacyPost;
  postId: string;
  config: GitHubPagesImportConfig;
  writer: ImportWriter;
  report: ImportReport;
}): Promise<{ contentMarkdown: string; coverAssetId: string | null; ogAssetId: string | null }> {
  const replacements = new Map<string, string>();
  let coverAssetId: string | null = null;
  let ogAssetId: string | null = null;

  const references = extractMarkdownImageReferences(input.parsed.contentMarkdown);
  for (const reference of references) {
    if (reference.isRemote) {
      input.report.remoteImagesPreserved.push({
        url: reference.url,
        file: input.parsed.relativePath,
      });
      continue;
    }

    const absolutePath = resolveLocalImagePath({
      markdownFilePath: input.parsed.sourcePath,
      imageRef: reference.url,
      sourceRoot: input.config.sourceRoot,
      assetsRoot: input.config.assetsRoot,
    });

    if (!(await localImageExists(absolutePath))) {
      input.report.imagesMissing.push({
        reference: reference.url,
        file: input.parsed.relativePath,
      });
      input.report.warnings.push(
        `Missing local image "${reference.url}" in ${input.parsed.relativePath}`
      );
      continue;
    }

    if (input.config.mode === "dry-run") {
      input.report.imagesCopied.push({
        source: absolutePath!,
        publicUrl: `(dry-run) ${reference.url}`,
        file: input.parsed.relativePath,
      });
      continue;
    }

    const uploaded = await input.writer.uploadLocalImage({
      postId: input.postId,
      absolutePath: absolutePath!,
      altText: reference.alt,
    });
    replacements.set(reference.url, uploaded.publicUrl);
    input.report.imagesCopied.push({
      source: absolutePath!,
      publicUrl: uploaded.publicUrl,
      file: input.parsed.relativePath,
    });
  }

  const contentMarkdown = rewriteMarkdownImages(input.parsed.contentMarkdown, replacements);

  if (input.parsed.coverImageRef) {
    if (/^https?:\/\//i.test(input.parsed.coverImageRef)) {
      input.report.warnings.push(
        `Remote cover image preserved in frontmatter for ${input.parsed.relativePath}`
      );
    } else {
      const coverPath = resolveCoverImagePath({
        coverImageRef: input.parsed.coverImageRef,
        markdownFilePath: input.parsed.sourcePath,
        sourceRoot: input.config.sourceRoot,
        assetsRoot: input.config.assetsRoot,
      });

      if (!(await localImageExists(coverPath))) {
        input.report.imagesMissing.push({
          reference: input.parsed.coverImageRef,
          file: input.parsed.relativePath,
        });
      } else if (input.config.mode === "dry-run") {
        input.report.imagesCopied.push({
          source: coverPath!,
          publicUrl: `(dry-run cover) ${input.parsed.coverImageRef}`,
          file: input.parsed.relativePath,
        });
      } else {
        const uploaded = await input.writer.uploadLocalImage({
          postId: input.postId,
          absolutePath: coverPath!,
          altText: input.parsed.title,
        });
        coverAssetId = uploaded.assetId;
        ogAssetId = uploaded.assetId;
      }
    }
  }

  if (input.parsed.ogImageRef && input.parsed.ogImageRef !== input.parsed.coverImageRef) {
    input.report.warnings.push(
      `Separate OG image frontmatter is not imported as asset in M6: ${input.parsed.relativePath}`
    );
  }

  return { contentMarkdown, coverAssetId, ogAssetId };
}

async function importSinglePost(
  parsed: ParsedLegacyPost,
  config: GitHubPagesImportConfig,
  writer: ImportWriter,
  report: ImportReport
): Promise<void> {
  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) {
      report.validationErrors.push({ file: parsed.relativePath, error });
    }
    addReportEntry(report, {
      sourceFile: parsed.relativePath,
      status: "skipped",
      message: parsed.errors.join("; "),
    });
    return;
  }

  if (await writer.slugExists(parsed.desiredSlug)) {
    report.slugConflicts.push({
      file: parsed.relativePath,
      slug: parsed.desiredSlug,
      reason: "Post slug already exists",
    });
    addReportEntry(report, {
      sourceFile: parsed.relativePath,
      status: "skipped",
      slug: parsed.desiredSlug,
      message: "Slug conflict",
    });
    return;
  }

  if (parsed.unsupportedFrontmatter.length > 0) {
    report.unsupportedFrontmatter.push({
      file: parsed.relativePath,
      fields: parsed.unsupportedFrontmatter,
    });
  }

  for (const warning of parsed.warnings) {
    report.warnings.push(`${parsed.relativePath}: ${warning}`);
  }

  if (parsed.sourceStatus === "published" && !config.publishImported) {
    report.warnings.push(
      `${parsed.relativePath}: source frontmatter indicates published; imported as draft (default safety).`
    );
  }

  const targetPath = mapTargetPath(parsed.desiredSlug, config.baseNewPath);

  if (config.mode === "dry-run") {
    await planRedirects({ parsed, targetPath, config, writer, report });
    addReportEntry(report, {
      sourceFile: parsed.relativePath,
      status: "planned",
      slug: parsed.desiredSlug,
      message: "Validated for import",
    });
    return;
  }

  const tagIds: string[] = [];
  for (const tagName of parsed.tags) {
    const tag = await writer.findOrCreateTag(tagName);
    tagIds.push(tag.id);
    if (tag.created) {
      report.tagsCreated.push(tagName);
    }
  }

  let categoryId: string | null = null;
  const [firstCategory] = parsed.categories;
  if (firstCategory) {
    const category = await writer.findOrCreateCategory(firstCategory);
    categoryId = category.id;
    if (category.created) {
      report.categoriesCreated.push(firstCategory);
    }
    if (parsed.categories.length > 1) {
      report.warnings.push(
        `${parsed.relativePath}: multiple categories found; only "${firstCategory}" was assigned.`
      );
    }
  }

  const created = await writer.createDraft({
    title: parsed.title,
    slug: parsed.desiredSlug,
    excerpt: parsed.excerpt,
    contentMarkdown: parsed.contentMarkdown,
    categoryId,
    tagIds,
  });

  report.postsCreated += 1;

  const images = await processImages({
    parsed,
    postId: created.id,
    config,
    writer,
    report,
  });

  await writer.updateDraft(created.id, {
    contentMarkdown: images.contentMarkdown,
    excerpt: parsed.excerpt,
    categoryId,
    tagIds,
    coverAssetId: images.coverAssetId,
    ogAssetId: images.ogAssetId,
    seoTitle: parsed.title,
    seoDescription: parsed.excerpt,
    createRevision: true,
  });

  if (shouldPublishPost(parsed, config)) {
    await writer.publishPost(created.id, parsed.publishedAt ?? undefined);
  }

  await planRedirects({
    parsed,
    targetPath: publicPostPath(created.slug),
    config,
    writer,
    report,
  });

  addReportEntry(report, {
    sourceFile: parsed.relativePath,
    status: "imported",
    postId: created.id,
    slug: created.slug,
  });
}

export async function runGitHubPagesImport(
  config: GitHubPagesImportConfig,
  writer: ImportWriter
): Promise<ImportReport> {
  const report = createEmptyImportReport(config.mode);
  const parsedPosts = await readLegacyMarkdownFiles(config.sourceRoot);
  report.totalFilesScanned = parsedPosts.length;

  for (const parsed of parsedPosts) {
    try {
      await importSinglePost(parsed, config, writer, report);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown import error";
      report.validationErrors.push({ file: parsed.relativePath, error: message });
      addReportEntry(report, {
        sourceFile: parsed.relativePath,
        status: "error",
        message,
      });
    }
  }

  finalizeImportReport(report);
  return report;
}

export async function runGitHubPagesImportAndPersistReport(
  config: GitHubPagesImportConfig,
  writer: ImportWriter
): Promise<{ report: ImportReport; reportPath: string; summary: string }> {
  const report = await runGitHubPagesImport(config, writer);
  const reportPath = await writeImportReportFile(config.reportDir, report);
  return {
    report,
    reportPath,
    summary: formatImportReportSummary(report),
  };
}

export function buildImportConfigFromOptions(options: {
  source: string;
  mode: "dry-run" | "import";
  assets?: string;
  defaultStatus?: "draft" | "published";
  publishImported?: boolean;
  preserveUrls?: boolean;
  baseOldPath?: string;
  baseNewPath?: string;
  authorEmail?: string;
  reportDir?: string;
}): GitHubPagesImportConfig {
  const sourceRoot = path.resolve(options.source);
  return {
    sourceRoot,
    assetsRoot: options.assets ? path.resolve(options.assets) : undefined,
    mode: options.mode,
    defaultStatus: options.defaultStatus ?? "draft",
    publishImported: options.publishImported ?? false,
    preserveUrls: options.preserveUrls ?? true,
    baseOldPath: options.baseOldPath ?? "/",
    baseNewPath: options.baseNewPath ?? "/blog",
    authorEmail: options.authorEmail,
    reportDir: options.reportDir ?? path.join(process.cwd(), ".import-reports"),
  };
}
