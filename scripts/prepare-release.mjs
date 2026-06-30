#!/usr/bin/env node
/**
 * Prepare a semver release from CHANGELOG.md [Unreleased] and VERSION.
 *
 * Usage:
 *   node scripts/prepare-release.mjs --bump auto|patch|minor|major|X.Y.Z [--recovery]
 *   node scripts/prepare-release.mjs extract-notes X.Y.Z
 *
 * Writes GITHUB_OUTPUT keys when run in Actions: version, changed, recovery, notes.
 * Prints a JSON summary to stdout.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const VERSION_FILE = path.join(ROOT, "VERSION");
const CHANGELOG_FILE = path.join(ROOT, "CHANGELOG.md");
const PACKAGE_JSON_FILE = path.join(ROOT, "package.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function readVersion() {
  const raw = readText(VERSION_FILE).trim();
  if (!/^\d+\.\d+\.\d+$/.test(raw)) {
    throw new Error(`Invalid VERSION file contents: "${raw}" (expected X.Y.Z)`);
  }
  return raw;
}

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bumpSemver(current, kind) {
  const { major, minor, patch } = parseSemver(current);
  switch (kind) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump kind: ${kind}`);
  }
}

function extractUnreleased(changelog) {
  const header = "## [Unreleased]";
  const start = changelog.indexOf(header);
  if (start === -1) {
    throw new Error("CHANGELOG.md is missing ## [Unreleased]");
  }

  const afterHeader = changelog.slice(start + header.length);
  const nextSection = afterHeader.search(/\n## \[/);
  const body = nextSection === -1 ? afterHeader : afterHeader.slice(0, nextSection);
  return body.trim();
}

function extractVersionSection(changelog, version) {
  const header = `## [${version}]`;
  const start = changelog.indexOf(header);
  if (start === -1) {
    throw new Error(`CHANGELOG.md is missing ${header}`);
  }

  const afterHeader = changelog.slice(start + header.length);
  const dateLine = afterHeader.match(/^\s*-\s*\d{4}-\d{2}-\d{2}/);
  const bodyStart = dateLine ? dateLine[0].length : 0;
  const rest = afterHeader.slice(bodyStart);
  const nextSection = rest.search(/\n## \[/);
  const body = nextSection === -1 ? rest : rest.slice(0, nextSection);
  return body.trim();
}

function isUnreleasedEmpty(body) {
  if (!body) {
    return true;
  }
  const meaningful = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("<!--"));
  return meaningful.length === 0;
}

function inferAutoBump(unreleasedBody) {
  if (/\bBREAKING\b/i.test(unreleasedBody) || /^### Removed/m.test(unreleasedBody)) {
    return "major";
  }
  if (/^### Added/m.test(unreleasedBody) || /^### Changed/m.test(unreleasedBody)) {
    return "minor";
  }
  return "patch";
}

function resolveTargetVersion(current, bumpArg, unreleasedBody) {
  const explicit = bumpArg.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (explicit) {
    return explicit[0];
  }

  const kind =
    bumpArg === "auto" || bumpArg === "" ? inferAutoBump(unreleasedBody) : bumpArg;

  if (!["patch", "minor", "major"].includes(kind)) {
    throw new Error(
      `Invalid --bump value "${bumpArg}". Use auto, patch, minor, major, or X.Y.Z.`,
    );
  }

  return bumpSemver(current, kind);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function rollChangelog(changelog, version, unreleasedBody) {
  const header = "## [Unreleased]";
  const start = changelog.indexOf(header);
  if (start === -1) {
    throw new Error("CHANGELOG.md is missing ## [Unreleased]");
  }

  const afterHeader = changelog.slice(start + header.length);
  const nextSection = afterHeader.search(/\n## \[/);
  const tailStart = start + header.length + (nextSection === -1 ? afterHeader.length : nextSection);

  const newUnreleased = `${header}\n\n`;
  const releasedBlock = `## [${version}] - ${todayIsoDate()}\n\n${unreleasedBody}\n\n`;
  const before = changelog.slice(0, start);
  const tail = changelog.slice(tailStart);

  let rolled = `${before}${newUnreleased}${releasedBlock}${tail}`;

  const compareLink = `[Unreleased]: https://github.com/tgoliveira11/tgoliveira11-tech/compare/v${version}...HEAD`;
  const releaseLink = `[${version}]: https://github.com/tgoliveira11/tgoliveira11-tech/releases/tag/v${version}`;

  if (/\[Unreleased\]:/.test(rolled)) {
    rolled = rolled.replace(/\[Unreleased\]:[^\n]*/, compareLink);
  } else {
    rolled = `${rolled.trimEnd()}\n\n${compareLink}\n`;
  }

  if (!new RegExp(`\\[${version.replace(/\./g, "\\.")}\\]:`).test(rolled)) {
    rolled = `${rolled.trimEnd()}\n${releaseLink}\n`;
  }

  return rolled;
}

function syncPackageJson(version) {
  const pkg = JSON.parse(readText(PACKAGE_JSON_FILE));
  pkg.version = version;
  writeText(PACKAGE_JSON_FILE, `${JSON.stringify(pkg, null, 2)}\n`);
}

function appendGithubOutput(result) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) {
    return;
  }
  const lines = Object.entries(result)
    .map(([key, value]) => `${key}=${String(value).replace(/\n/g, "%0A")}`)
    .join("\n");
  fs.appendFileSync(outputFile, `${lines}\n`);
}

function parseArgs(argv) {
  if (argv[0] === "extract-notes") {
    return { command: "extract-notes", version: argv[1] };
  }

  let bump = "auto";
  let recovery = false;

  for (const arg of argv) {
    if (arg === "--recovery") {
      recovery = true;
      continue;
    }
    if (arg.startsWith("--bump=")) {
      bump = arg.slice("--bump=".length);
      continue;
    }
    if (arg === "--bump") {
      continue;
    }
    if (!arg.startsWith("--") && bump === "auto") {
      bump = arg;
    }
  }

  return { command: "prepare", bump, recovery };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.command === "extract-notes") {
    if (!args.version) {
      throw new Error("extract-notes requires a version argument (X.Y.Z)");
    }
    const changelog = readText(CHANGELOG_FILE);
    const notes = extractVersionSection(changelog, args.version);
    process.stdout.write(`${notes}\n`);
    return;
  }

  const changelog = readText(CHANGELOG_FILE);
  const unreleasedBody = extractUnreleased(changelog);
  const unreleasedEmpty = isUnreleasedEmpty(unreleasedBody);
  const current = readVersion();

  if (args.recovery || unreleasedEmpty) {
    if (!args.recovery && !unreleasedEmpty) {
      throw new Error("Internal error: recovery requested with non-empty Unreleased");
    }

    if (!unreleasedEmpty && args.recovery) {
      throw new Error(
        "Recovery mode requires an empty ## [Unreleased] section. Use a normal bump instead.",
      );
    }

    if (!unreleasedEmpty && ["patch", "minor", "major"].includes(args.bump)) {
      throw new Error(
        `Cannot bump ${args.bump}: ## [Unreleased] is empty. Add release notes or run recovery mode.`,
      );
    }

    if (!unreleasedEmpty && /^\d+\.\d+\.\d+$/.test(args.bump)) {
      throw new Error(
        `Cannot release ${args.bump}: ## [Unreleased] is empty. Add release notes or run recovery mode.`,
      );
    }

    const result = {
      version: current,
      changed: "false",
      recovery: "true",
      notes: extractVersionSection(changelog, current),
    };
    appendGithubOutput(result);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }

  const version = resolveTargetVersion(current, args.bump, unreleasedBody);
  writeText(VERSION_FILE, `${version}\n`);
  syncPackageJson(version);
  writeText(CHANGELOG_FILE, rollChangelog(changelog, version, unreleasedBody));

  const result = {
    version,
    changed: "true",
    recovery: "false",
    notes: unreleasedBody,
  };
  appendGithubOutput(result);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
