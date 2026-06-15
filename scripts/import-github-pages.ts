import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readBooleanArg(name: string, fallback: boolean): boolean {
  const raw = readArg(name);
  if (raw == null) {
    return fallback;
  }
  return ["true", "1", "yes"].includes(raw.toLowerCase());
}

function printHelp(): void {
  console.log(`Usage:
  npm run import:github-pages -- --source ./legacy-blog --mode dry-run
  npm run import:github-pages -- --source ./legacy-blog --mode import

Options:
  --source <path>            Legacy Markdown directory (required)
  --mode <dry-run|import>    Import mode (default: dry-run)
  --assets <path>            Optional assets/images directory
  --default-status <draft|published>  Default imported status (default: draft)
  --publish-imported <true|false>     Publish imported posts (default: false)
  --preserve-urls <true|false>        Create redirects for old paths (default: true)
  --base-old-path <path>     Old site path prefix to strip (default: /)
  --base-new-path <path>     New canonical path prefix (default: /blog)
  --author-email <email>     Import author user email (default: ADMIN_EMAIL)
  --report-dir <path>        JSON report output directory (default: ./.import-reports)
  --dry-run                  Alias for --mode dry-run
  --help                     Show this help
`);
}

async function main(): Promise<void> {
  if (hasFlag("--help")) {
    printHelp();
    return;
  }

  const source = readArg("--source");
  if (!source) {
    console.error("Missing required --source argument.");
    printHelp();
    process.exitCode = 1;
    return;
  }

  const mode = hasFlag("--dry-run")
    ? "dry-run"
    : ((readArg("--mode") as "dry-run" | "import" | undefined) ?? "dry-run");

  if (mode !== "dry-run" && mode !== "import") {
    console.error(`Invalid --mode value: ${mode}`);
    process.exitCode = 1;
    return;
  }

  const sourceRoot = path.resolve(source);
  if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
    console.error(`Source directory not found: ${sourceRoot}`);
    process.exitCode = 1;
    return;
  }

  const {
    buildImportConfigFromOptions,
    runGitHubPagesImportAndPersistReport,
  } = await import("../src/modules/import/github-pages-importer");
  const { createDatabaseImportWriter, resolveImportUserId } = await import(
    "../src/modules/import/github-pages-writer"
  );

  const config = buildImportConfigFromOptions({
    source: sourceRoot,
    mode,
    assets: readArg("--assets"),
    defaultStatus: (readArg("--default-status") as "draft" | "published" | undefined) ?? "draft",
    publishImported: readBooleanArg("--publish-imported", false),
    preserveUrls: readBooleanArg("--preserve-urls", true),
    baseOldPath: readArg("--base-old-path") ?? "/",
    baseNewPath: readArg("--base-new-path") ?? "/blog",
    authorEmail: readArg("--author-email"),
    reportDir: readArg("--report-dir"),
  });

  const userId = await resolveImportUserId(config.authorEmail);
  const writer = createDatabaseImportWriter(userId);
  const result = await runGitHubPagesImportAndPersistReport(config, writer);

  console.log(result.summary);
  console.log("");
  console.log(`Report written to: ${result.reportPath}`);

  if (result.report.validationErrors.length > 0) {
    process.exitCode = 1;
  }

  const { closeDb } = await import("../src/db/get-db");
  await closeDb();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  try {
    const { closeDb } = await import("../src/db/get-db");
    await closeDb();
  } catch {
    // ignore cleanup errors
  }
  process.exitCode = 1;
});
