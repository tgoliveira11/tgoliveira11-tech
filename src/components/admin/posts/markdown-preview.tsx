"use client";

import { useEffect, useState, useTransition } from "react";
import { previewMarkdownAction } from "@/modules/posts/admin-posts.actions";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await previewMarkdownAction(markdown);
        setHtml(result.html);
        setError(null);
      } catch {
        setError("Preview failed");
      }
    });
  }, [markdown]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="relative">
      {pending ? <p className="mb-2 text-xs text-[var(--muted)]">Updating preview…</p> : null}
      <div className="prose min-h-48 rounded-md border border-[var(--border)] bg-white p-4" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
