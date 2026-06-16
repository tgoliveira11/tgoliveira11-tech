"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  EDITOR_CONTENT_MIN_HEIGHT_CLASS,
  EDITOR_CONTENT_PREVIEW_PANEL_CLASS,
  EDITOR_CONTENT_TEXTAREA_CLASS,
} from "./editor-constants";
import { EditorToolbar } from "./editor-toolbar";
import { MarkdownPreview } from "./markdown-preview";

type EditorMode = "write" | "preview" | "split";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debounced;
}

export function MarkdownEditor({
  name,
  defaultValue,
  label = "Content",
  onRegisterInsert,
  textareaRef,
  onInsertImage,
}: {
  name: string;
  defaultValue: string;
  label?: string;
  onRegisterInsert?: (insert: (markdown: string) => void) => void;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onInsertImage?: () => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<EditorMode>("write");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const resolvedRef = textareaRef ?? internalRef;
  const debouncedPreviewMarkdown = useDebouncedValue(value, 400);

  useEffect(() => {
    if (!onRegisterInsert) return;
    onRegisterInsert((markdown) => {
      const textarea = resolvedRef.current;
      setValue((current) => {
        if (!textarea) {
          const prefix = current.length === 0 || current.endsWith("\n") ? "" : "\n";
          return `${current}${prefix}${markdown}\n`;
        }

        const selectionStart = textarea.selectionStart ?? current.length;
        const selectionEnd = textarea.selectionEnd ?? selectionStart;
        const insertText = `${markdown}\n`;
        const nextValue = `${current.slice(0, selectionStart)}${insertText}${current.slice(selectionEnd)}`;

        requestAnimationFrame(() => {
          textarea.focus();
          const cursor = selectionStart + insertText.length;
          textarea.setSelectionRange(cursor, cursor);
        });

        return nextValue;
      });
    });
  }, [onRegisterInsert, resolvedRef]);

  function applyToolbarValue(nextValue: string, selectionStart: number, selectionEnd: number) {
    setValue(nextValue);
    const textarea = resolvedRef.current;
    if (!textarea) return;
    textarea.value = nextValue;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.setSelectionRange(selectionStart, selectionEnd);
  }

  const panelClass =
    mode === "split"
      ? `grid gap-4 lg:grid-cols-2 ${EDITOR_CONTENT_MIN_HEIGHT_CLASS}`
      : EDITOR_CONTENT_MIN_HEIGHT_CLASS;

  return (
    <div className={`flex flex-col space-y-3 ${EDITOR_CONTENT_MIN_HEIGHT_CLASS}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label htmlFor="post-content-markdown" className="text-sm font-medium">
          {label}
        </label>
        <div
          className="inline-flex rounded-md border border-[var(--border)] p-0.5 text-sm"
          role="tablist"
          aria-label="Editor view"
        >
          {(
            [
              ["write", "Write"],
              ["preview", "Preview"],
              ["split", "Split"],
            ] as const
          ).map(([key, tabLabel]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              className={`rounded px-3 py-2 ${
                mode === key
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"
              }`}
            >
              {tabLabel}
            </button>
          ))}
        </div>
      </div>

      {mode !== "preview" ? (
        <EditorToolbar
          textareaRef={resolvedRef}
          onApply={applyToolbarValue}
          onInsertImage={onInsertImage}
        />
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        Supports Markdown. Use the toolbar or insert images from the assets panel.
      </p>

      <div className={panelClass}>
        <textarea
          ref={resolvedRef}
          id="post-content-markdown"
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={
            mode === "preview"
              ? "sr-only"
              : EDITOR_CONTENT_TEXTAREA_CLASS
          }
          spellCheck={false}
          aria-hidden={mode === "preview" ? true : undefined}
          tabIndex={mode === "preview" ? -1 : undefined}
        />
        {(mode === "preview" || mode === "split") && (
          <div className={EDITOR_CONTENT_PREVIEW_PANEL_CLASS}>
            <p className="mb-2 text-xs font-medium text-[var(--muted)]">Live preview</p>
            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
              <MarkdownPreview markdown={debouncedPreviewMarkdown} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
