import type { ImportReport, ImportReportEntry } from "./github-pages.types";

export function createEmptyImportReport(mode: ImportReport["mode"]): ImportReport {
  return {
    mode,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    totalFilesScanned: 0,
    filesImported: 0,
    filesSkipped: 0,
    postsCreated: 0,
    postsUpdated: 0,
    slugConflicts: [],
    redirectsCreated: [],
    redirectsSkipped: [],
    tagsCreated: [],
    categoriesCreated: [],
    imagesCopied: [],
    imagesMissing: [],
    remoteImagesPreserved: [],
    unsupportedFrontmatter: [],
    validationErrors: [],
    warnings: [],
    entries: [],
  };
}

export function finalizeImportReport(report: ImportReport): ImportReport {
  report.finishedAt = new Date().toISOString();
  report.filesImported = report.entries.filter((entry) => entry.status === "imported").length;
  report.filesSkipped = report.entries.filter((entry) => entry.status === "skipped").length;
  return report;
}

export function addReportEntry(report: ImportReport, entry: ImportReportEntry): void {
  report.entries.push(entry);
}

export function formatImportReportSummary(report: ImportReport): string {
  const lines = [
    `GitHub Pages import (${report.mode})`,
    `Started: ${report.startedAt}`,
    `Finished: ${report.finishedAt}`,
    "",
    `Files scanned: ${report.totalFilesScanned}`,
    `Imported: ${report.filesImported}`,
    `Skipped: ${report.filesSkipped}`,
    `Posts created: ${report.postsCreated}`,
    `Slug conflicts: ${report.slugConflicts.length}`,
    `Redirects created: ${report.redirectsCreated.length}`,
    `Tags created: ${report.tagsCreated.length}`,
    `Categories created: ${report.categoriesCreated.length}`,
    `Images copied: ${report.imagesCopied.length}`,
    `Images missing: ${report.imagesMissing.length}`,
    `Remote images preserved: ${report.remoteImagesPreserved.length}`,
    `Validation errors: ${report.validationErrors.length}`,
    `Warnings: ${report.warnings.length}`,
  ];

  if (report.slugConflicts.length > 0) {
    lines.push("", "Slug conflicts:");
    for (const conflict of report.slugConflicts) {
      lines.push(`- ${conflict.file}: ${conflict.slug} (${conflict.reason})`);
    }
  }

  if (report.validationErrors.length > 0) {
    lines.push("", "Validation errors:");
    for (const error of report.validationErrors) {
      lines.push(`- ${error.file}: ${error.error}`);
    }
  }

  if (report.warnings.length > 0) {
    lines.push("", "Warnings:");
    for (const warning of report.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  return lines.join("\n");
}

export async function writeImportReportFile(
  reportDir: string,
  report: ImportReport
): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.mkdir(reportDir, { recursive: true });
  const filename = `github-pages-import-${report.finishedAt.replace(/[:.]/g, "-")}.json`;
  const filePath = path.join(reportDir, filename);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
  return filePath;
}
