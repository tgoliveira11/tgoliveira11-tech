export type MarkdownToolbarAction =
  | "bold"
  | "italic"
  | "heading2"
  | "heading3"
  | "link"
  | "quote"
  | "bulletList"
  | "numberList"
  | "inlineCode"
  | "codeBlock";

export type MarkdownSelection = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type MarkdownEditResult = MarkdownSelection;

export function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
  placeholder = "text"
): MarkdownEditResult {
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const nextValue =
    value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  const start = selectionStart + before.length;
  const end = start + selected.length;
  return { value: nextValue, selectionStart: start, selectionEnd: end };
}

export function insertAtCursor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insertText: string
): MarkdownEditResult {
  const nextValue = value.slice(0, selectionStart) + insertText + value.slice(selectionEnd);
  const cursor = selectionStart + insertText.length;
  return { value: nextValue, selectionStart: cursor, selectionEnd: cursor };
}

function prefixLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string | ((lineIndex: number) => string),
  placeholder = "List item"
): MarkdownEditResult {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const after = value.slice(selectionEnd);
  const lines = selected.split("\n");
  const prefixed = lines
    .map((line, index) => {
      const marker = typeof prefix === "function" ? prefix(index) : prefix;
      const trimmed = line.trim();
      return trimmed ? `${marker}${trimmed}` : marker.trimEnd();
    })
    .join("\n");
  const nextValue = before + prefixed + after;
  const start = before.length;
  const end = start + prefixed.length;
  return { value: nextValue, selectionStart: start, selectionEnd: end };
}

function prefixBlock(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  placeholder = "Heading"
): MarkdownEditResult {
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const lines = selected.split("\n");
  const prefixed = lines.map((line) => `${prefix}${line}`).join("\n");
  const nextValue = value.slice(0, selectionStart) + prefixed + value.slice(selectionEnd);
  const start = selectionStart;
  const end = selectionStart + prefixed.length;
  return { value: nextValue, selectionStart: start, selectionEnd: end };
}

export function applyMarkdownToolbarAction(
  selection: MarkdownSelection,
  action: MarkdownToolbarAction
): MarkdownEditResult {
  const { value, selectionStart, selectionEnd } = selection;

  switch (action) {
    case "bold":
      return wrapSelection(value, selectionStart, selectionEnd, "**", "**", "bold text");
    case "italic":
      return wrapSelection(value, selectionStart, selectionEnd, "*", "*", "italic text");
    case "heading2":
      return prefixBlock(value, selectionStart, selectionEnd, "## ", "Heading");
    case "heading3":
      return prefixBlock(value, selectionStart, selectionEnd, "### ", "Heading");
    case "link":
      return wrapSelection(
        value,
        selectionStart,
        selectionEnd,
        "[",
        "](https://example.com)",
        "link text"
      );
    case "quote":
      return prefixBlock(value, selectionStart, selectionEnd, "> ", "Quote");
    case "bulletList":
      return prefixLines(value, selectionStart, selectionEnd, "- ", "List item");
    case "numberList":
      return prefixLines(value, selectionStart, selectionEnd, (index) => `${index + 1}. `, "List item");
    case "inlineCode":
      return wrapSelection(value, selectionStart, selectionEnd, "`", "`", "code");
    case "codeBlock":
      return wrapSelection(value, selectionStart, selectionEnd, "```ts\n", "\n```", "code");
    default:
      return selection;
  }
}
