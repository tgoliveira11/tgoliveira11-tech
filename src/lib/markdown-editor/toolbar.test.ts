import { describe, expect, it } from "vitest";
import {
  applyMarkdownToolbarAction,
  wrapSelection,
} from "@/lib/markdown-editor/toolbar";

describe("markdown editor toolbar helpers", () => {
  it("wrapSelection inserts placeholders when selection is empty", () => {
    const { value } = wrapSelection("hello", 2, 2, "**", "**", "bold text");
    expect(value).toBe("he**bold text**llo");
  });

  it("wraps bold and returns a selection covering only the original text", () => {
    const value = "hello test world";
    const selectionStart = value.indexOf("test");
    const selectionEnd = selectionStart + "test".length;

    const result = applyMarkdownToolbarAction(
      { value, selectionStart, selectionEnd },
      "bold"
    );

    expect(result.value).toBe("hello **test** world");
    expect(result.selectionStart).toBe(selectionStart + 2); // "**"
    expect(result.selectionEnd).toBe(result.selectionStart + "test".length);
  });

  it("inserts link syntax for selected text", () => {
    const value = "see this";
    const selectionStart = value.indexOf("this");
    const selectionEnd = selectionStart + "this".length;

    const result = applyMarkdownToolbarAction(
      { value, selectionStart, selectionEnd },
      "link"
    );

    expect(result.value).toBe("see [this](https://example.com)");
    expect(result.selectionStart).toBe(selectionStart + 1); // "["
    expect(result.selectionEnd).toBe(result.selectionStart + "this".length);
  });

  it("prefixes selected lines for a bulleted list", () => {
    const value = "a\nb";
    const selectionStart = 0;
    const selectionEnd = value.length;

    const result = applyMarkdownToolbarAction(
      { value, selectionStart, selectionEnd },
      "bulletList"
    );

    expect(result.value).toBe("- a\n- b");
    expect(result.selectionStart).toBe(0);
    expect(result.selectionEnd).toBe(("- a\n- b").length);
  });
});

