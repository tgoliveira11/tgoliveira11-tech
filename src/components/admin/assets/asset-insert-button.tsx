"use client";

export function AssetInsertButton({
  markdown,
  onInsert,
}: {
  markdown: string;
  onInsert?: (markdown: string) => void;
}) {
  if (!onInsert) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onInsert(markdown)}
      className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
    >
      Insert
    </button>
  );
}
