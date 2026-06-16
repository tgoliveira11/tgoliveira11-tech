"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import {
  ALL_TAGS_OPTION_ID,
  buildAdminPostsFilterUrl,
  getTagFilterOptions,
  type AdminPostsFilterParams,
} from "@/modules/admin/admin-posts-filter-url";
import type { Tag } from "@/modules/tags/tags.types";

type TagFilterOption =
  | { type: "all" }
  | { type: "tag"; tag: Tag };

function buildOptions(tags: Tag[], query: string, showAllTags: boolean): TagFilterOption[] {
  const filtered = getTagFilterOptions(tags, query, showAllTags);
  return [{ type: "all" as const }, ...filtered.map((tag) => ({ type: "tag" as const, tag }))];
}

export function TagFilterCombobox({
  tags,
  current,
}: {
  tags: Tag[];
  current: AdminPostsFilterParams;
}) {
  const router = useRouter();
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedTag = tags.find((tag) => tag.id === current.tagId) ?? null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const options = useMemo(
    () => buildOptions(tags, query, showAllTags),
    [query, showAllTags, tags]
  );
  const activeHighlightIndex = Math.min(highlightIndex, Math.max(options.length - 1, 0));
  const hasMatches = options.length > 1;
  const inputValue = open ? query : selectedTag?.name ?? "";

  function navigateWithTag(tagId: string | null) {
    router.push(buildAdminPostsFilterUrl(current, { tagId }));
  }

  function selectOption(option: TagFilterOption) {
    if (option.type === "all") {
      navigateWithTag(null);
      setQuery("");
    } else {
      navigateWithTag(option.tag.id);
      setQuery(option.tag.name);
    }
    setShowAllTags(false);
    setHighlightIndex(0);
    setOpen(false);
  }

  function selectHighlighted() {
    const option = options[activeHighlightIndex];
    if (option) {
      selectOption(option);
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex((index) => Math.min(index + 1, Math.max(options.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
      setShowAllTags(false);
      return;
    }

    if ((event.key === "Enter" || event.key === "Tab") && open && options.length > 0) {
      event.preventDefault();
      selectHighlighted();
    }
  }

  if (tags.length === 0) {
    return (
      <div className="text-sm">
        <span className="mb-1 block font-medium">Tag</span>
        <div
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-[var(--muted)] opacity-60"
          id={inputId}
        >
          No tags yet
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <label htmlFor={inputId} className="mb-1 block font-medium">
        Tag
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={inputValue}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowAllTags(false);
              setHighlightIndex(0);
              setOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              setOpen(true);
              setQuery(selectedTag?.name ?? "");
            }}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder="Search tags..."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] py-2 pl-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
          />
          <button
            type="button"
            aria-label="Show all tags"
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setShowAllTags(true);
              setQuery("");
              setHighlightIndex(0);
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            ▾
          </button>

          {open ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--card)] py-1 shadow-[var(--shadow-sm)]"
            >
              {options.map((option, index) => {
                const active = index === activeHighlightIndex;
                const optionId = `${listboxId}-option-${index}`;
                const label = option.type === "all" ? "All tags" : option.tag.name;
                const selected =
                  option.type === "all"
                    ? !current.tagId
                    : current.tagId === option.tag.id;

                return (
                  <li key={option.type === "all" ? ALL_TAGS_OPTION_ID : option.tag.id} role="presentation">
                    <button
                      id={optionId}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`block w-full px-3 py-2 text-left text-sm ${
                        active ? "bg-[var(--surface-subtle)]" : "hover:bg-[var(--surface-subtle)]"
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectOption(option)}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
              {!hasMatches ? (
                <li className="px-3 py-2 text-sm text-[var(--muted)]" role="presentation">
                  No tags found
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        {selectedTag ? (
          <button
            type="button"
            onClick={() => selectOption({ type: "all" })}
            className="shrink-0 rounded-md border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] hover:bg-[var(--surface-subtle)]"
          >
            Clear tag filter
          </button>
        ) : null}
      </div>
    </div>
  );
}
