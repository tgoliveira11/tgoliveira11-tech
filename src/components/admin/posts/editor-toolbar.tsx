"use client";

import type { RefObject } from "react";
import {
  applyMarkdownToolbarAction,
  type MarkdownToolbarAction,
} from "@/lib/markdown-editor/toolbar";

type ToolbarItem = {
  action: MarkdownToolbarAction;
  label: string;
  text: string;
};

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { action: "bold", label: "Bold", text: "B" },
  { action: "italic", label: "Italic", text: "I" },
  { action: "heading2", label: "Heading 2", text: "H2" },
  { action: "heading3", label: "Heading 3", text: "H3" },
  { action: "link", label: "Link", text: "Link" },
  { action: "quote", label: "Quote", text: "Quote" },
  { action: "bulletList", label: "Bulleted list", text: "• List" },
  { action: "numberList", label: "Numbered list", text: "1. List" },
  { action: "inlineCode", label: "Inline code", text: "`code`" },
  { action: "codeBlock", label: "Code block", text: "```" },
];

export function EditorToolbar({
  textareaRef,
  onApply,
  onInsertImage,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onApply: (nextValue: string, selectionStart: number, selectionEnd: number) => void;
  onInsertImage?: () => void;
}) {
  function applyAction(action: MarkdownToolbarAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const result = applyMarkdownToolbarAction(
      {
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      },
      action
    );

    onApply(result.value, result.selectionStart, result.selectionEnd);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    <div
      className="flex flex-wrap gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-1"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      {TOOLBAR_ITEMS.map((item) => (
        <button
          key={item.action}
          type="button"
          className="rounded px-2 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ring)]"
          aria-label={item.label}
          title={item.label}
          onClick={() => applyAction(item.action)}
        >
          <span aria-hidden="true">{item.text}</span>
        </button>
      ))}
      {onInsertImage ? (
        <button
          type="button"
          className="rounded px-2 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ring)]"
          aria-label="Insert image from assets"
          title="Insert image from assets"
          onClick={onInsertImage}
        >
          <span aria-hidden="true">Image</span>
        </button>
      ) : null}
    </div>
  );
}
