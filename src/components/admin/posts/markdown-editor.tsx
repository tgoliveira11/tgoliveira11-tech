"use client";

import { useEffect, useState } from "react";
import { MarkdownPreview } from "./markdown-preview";

type EditorMode = "write" | "preview" | "split";

export function MarkdownEditor({
  name,
  defaultValue,
  label = "Content",
  onRegisterInsert,
}: {
  name: string;
  defaultValue: string;
  label?: string;
  onRegisterInsert?: (insert: (markdown: string) => void) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<EditorMode>("write");

  useEffect(() => {
    if (!onRegisterInsert) return;
    onRegisterInsert((markdown) => {
      setValue((current) => {
        const prefix = current.length === 0 || current.endsWith("\n") ? "" : "\n";
        return `${current}${prefix}${markdown}\n`;
      });
    });
  }, [onRegisterInsert]);

  return (
    <div className="space-y-3">
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
              className={`rounded px-3 py-1.5 ${
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

      <p className="text-xs text-[var(--muted)]">
        Supports Markdown. Images can be inserted from the assets panel.
      </p>

      <div
        className={
          mode === "split"
            ? "grid gap-4 lg:grid-cols-2"
            : mode === "preview"
              ? "block"
              : "block"
        }
      >
        {(mode === "write" || mode === "split") && (
          <textarea
            id="post-content-markdown"
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={28}
            className="min-h-[28rem] w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            spellCheck={false}
          />
        )}
        {(mode === "preview" || mode === "split") && (
          <div className={mode === "preview" ? "min-h-[28rem]" : ""}>
            <p className="mb-2 text-xs font-medium text-[var(--muted)]">Live preview</p>
            <MarkdownPreview markdown={value} />
          </div>
        )}
      </div>
    </div>
  );
}
