"use client";

import { useEffect, useState } from "react";
import { MarkdownPreview } from "./markdown-preview";

export function MarkdownEditor({
  name,
  defaultValue,
  label = "Content (Markdown)",
  onRegisterInsert,
}: {
  name: string;
  defaultValue: string;
  label?: string;
  onRegisterInsert?: (insert: (markdown: string) => void) => void;
}) {
  const [value, setValue] = useState(defaultValue);

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
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">{label}</span>
        <textarea
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={24}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 font-mono text-sm"
          spellCheck={false}
        />
      </label>
      <div>
        <p className="mb-1 text-sm font-medium">Live preview</p>
        <MarkdownPreview markdown={value} />
      </div>
    </div>
  );
}
