import fs from "node:fs";
import { FAILSAFE_SCHEMA, load } from "js-yaml";

export type FrontmatterFile = {
  data: Record<string, unknown>;
  content: string;
  excerpt?: string;
  path?: string;
};

const OPEN_DELIMITER = "---";

function stripLeadingNewline(value: string): string {
  if (value.startsWith("\r")) {
    return stripLeadingNewline(value.slice(1));
  }
  if (value.startsWith("\n")) {
    return stripLeadingNewline(value.slice(1));
  }
  return value;
}

export function parseFrontmatter(input: string): FrontmatterFile {
  if (!input.startsWith(OPEN_DELIMITER)) {
    return { data: {}, content: input };
  }

  if (input.charAt(OPEN_DELIMITER.length) === OPEN_DELIMITER.slice(-1)) {
    return { data: {}, content: input };
  }

  const withoutOpen = input.slice(OPEN_DELIMITER.length);
  const closeIndex = withoutOpen.indexOf(`\n${OPEN_DELIMITER}`);
  if (closeIndex === -1) {
    return { data: {}, content: input };
  }

  const matterBlock = withoutOpen
    .slice(0, closeIndex)
    .replace(/^\s*#[^\n]+/gm, "")
    .trim();
  const content = stripLeadingNewline(
    withoutOpen.slice(closeIndex + `\n${OPEN_DELIMITER}`.length)
  );

  let data: Record<string, unknown> = {};
  if (matterBlock) {
    const parsed = load(matterBlock, { schema: FAILSAFE_SCHEMA });
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  }

  const excerptSeparator = data.excerpt_separator;
  let excerpt: string | undefined;
  if (typeof excerptSeparator === "string" && excerptSeparator.length > 0) {
    const separatorIndex = content.indexOf(excerptSeparator);
    if (separatorIndex !== -1) {
      excerpt = content.slice(0, separatorIndex);
    }
  }

  return { data, content, excerpt };
}

export function readFrontmatterFile(filePath: string): FrontmatterFile {
  const input = fs.readFileSync(filePath, "utf8");
  return { ...parseFrontmatter(input), path: filePath };
}
