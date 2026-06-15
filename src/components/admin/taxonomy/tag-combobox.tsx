"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Tag } from "@/modules/tags/tags.types";
import { taxonomyNamesMatch } from "@/modules/taxonomy/taxonomy-name";
import { createOrFindTagAction, searchTagsAction } from "@/modules/taxonomy/admin-taxonomy.actions";
import { TagChip } from "./tag-chip";

type SuggestionItem =
  | { type: "tag"; tag: Tag }
  | { type: "create"; name: string };

function tokenizeInput(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function mergeTags(base: Tag[], extra: Tag[]): Tag[] {
  const merged = new Map(base.map((tag) => [tag.id, tag]));
  for (const tag of extra) {
    merged.set(tag.id, tag);
  }
  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function TagCombobox({
  formId,
  allTags,
  selectedTagIds,
}: {
  formId: string;
  allTags: Tag[];
  selectedTagIds: string[];
}) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const helperId = `${inputId}-helper`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [createdTags, setCreatedTags] = useState<Tag[]>([]);
  const knownTags = useMemo(() => mergeTags(allTags, createdTags), [allTags, createdTags]);
  const [selected, setSelected] = useState<Tag[]>(() =>
    selectedTagIds
      .map((id) => allTags.find((tag) => tag.id === id))
      .filter((tag): tag is Tag => Boolean(tag))
  );
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedIds = useMemo(() => new Set(selected.map((tag) => tag.id)), [selected]);
  const trimmedQuery = query.trim();

  const defaultSuggestions = useMemo(
    () => knownTags.filter((tag) => !selectedIds.has(tag.id)).slice(0, 8),
    [knownTags, selectedIds]
  );

  const suggestions = trimmedQuery ? searchResults : defaultSuggestions;

  const filteredSuggestions = useMemo(
    () => suggestions.filter((tag) => !selectedIds.has(tag.id)),
    [selectedIds, suggestions]
  );

  const showCreateOption =
    trimmedQuery.length > 0 &&
    !filteredSuggestions.some((tag) => taxonomyNamesMatch(tag.name, trimmedQuery)) &&
    !selected.some((tag) => taxonomyNamesMatch(tag.name, trimmedQuery));

  const options: SuggestionItem[] = useMemo(() => {
    const items: SuggestionItem[] = filteredSuggestions.map((tag) => ({ type: "tag", tag }));
    if (showCreateOption) {
      items.push({ type: "create", name: trimmedQuery });
    }
    return items;
  }, [filteredSuggestions, showCreateOption, trimmedQuery]);

  const activeHighlightIndex = Math.min(highlightIndex, Math.max(options.length - 1, 0));

  useEffect(() => {
    if (!open || !trimmedQuery) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const result = await searchTagsAction(trimmedQuery);
      if (result.ok) {
        setSearchResults(result.data.tags);
      }
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [open, trimmedQuery]);

  const addTag = useCallback((tag: Tag) => {
    setSelected((current) => {
      if (current.some((item) => item.id === tag.id)) {
        return current;
      }
      return [...current, tag];
    });
    setCreatedTags((current) => (current.some((item) => item.id === tag.id) ? current : [...current, tag]));
    setQuery("");
    setHighlightIndex(0);
    setOpen(false);
    setError(null);
  }, []);

  const createAndAddTag = useCallback(
    async (rawName: string) => {
      const name = rawName.trim();
      if (!name) {
        return;
      }

      const existing =
        knownTags.find((tag) => taxonomyNamesMatch(tag.name, name)) ??
        selected.find((tag) => taxonomyNamesMatch(tag.name, name));
      if (existing) {
        addTag(existing);
        return;
      }

      setPending(true);
      setError(null);
      const result = await createOrFindTagAction(name);
      setPending(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      addTag(result.data.tag);
    },
    [addTag, knownTags, selected]
  );

  function selectHighlighted() {
    const option = options[activeHighlightIndex];
    if (!option) {
      if (trimmedQuery) {
        void createAndAddTag(trimmedQuery);
      }
      return;
    }

    if (option.type === "tag") {
      addTag(option.tag);
      return;
    }

    void createAndAddTag(option.name);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex((current) => Math.min(current + 1, Math.max(options.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Backspace" && query.length === 0 && selected.length > 0) {
      setSelected((current) => current.slice(0, -1));
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      if (open && options.length > 0) {
        event.preventDefault();
        selectHighlighted();
        return;
      }

      if (event.key === "Enter" && trimmedQuery) {
        event.preventDefault();
        void createAndAddTag(trimmedQuery);
      }
    }

    if (event.key === "," || event.key === " ") {
      const parts = tokenizeInput(query);
      const last = parts.at(-1);
      if (last) {
        event.preventDefault();
        void createAndAddTag(last);
        setQuery("");
        setHighlightIndex(0);
      }
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setHighlightIndex(0);

    if (value.includes(",") || /\s$/.test(value)) {
      const parts = tokenizeInput(value);
      const remainder = value.endsWith(",") || value.endsWith(" ") ? "" : (parts.pop() ?? "");
      for (const part of parts) {
        void createAndAddTag(part);
      }
      setQuery(remainder);
      setOpen(Boolean(remainder));
      return;
    }

    setQuery(value);
    setOpen(true);
  }

  return (
    <div className="space-y-2">
      <div
        className={`rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-2 py-2 focus-within:ring-2 focus-within:ring-[var(--ring)] ${
          pending ? "opacity-70" : ""
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <TagChip key={tag.id} label={tag.name} onRemove={() => setSelected((c) => c.filter((t) => t.id !== tag.id))} />
          ))}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder={selected.length === 0 ? "Type a tag and press Enter" : "Add another tag"}
            className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-describedby={helperId}
            disabled={pending}
          />
        </div>
      </div>

      {open && options.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="max-h-44 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--card)] py-1 shadow-[var(--shadow-sm)]"
        >
          {options.map((option, index) => {
            const active = index === activeHighlightIndex;
            const optionId = `${listboxId}-option-${index}`;
            if (option.type === "create") {
              return (
                <li key={`create-${option.name}`} role="presentation">
                  <button
                    id={optionId}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`block w-full px-3 py-2 text-left text-sm ${
                      active ? "bg-[var(--surface-subtle)]" : "hover:bg-[var(--surface-subtle)]"
                    } text-[var(--primary)]`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => void createAndAddTag(option.name)}
                  >
                    Create tag “{option.name}”
                  </button>
                </li>
              );
            }

            return (
              <li key={option.tag.id} role="presentation">
                <button
                  id={optionId}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    active ? "bg-[var(--surface-subtle)]" : "hover:bg-[var(--surface-subtle)]"
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addTag(option.tag)}
                >
                  {option.tag.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p id={helperId} className="text-xs text-[var(--muted)]">
        Use tags for specific topics. Press Enter to create or select a tag.
      </p>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}

      {selected.map((tag) => (
        <input key={tag.id} type="hidden" name="tagIds" form={formId} value={tag.id} />
      ))}
    </div>
  );
}
