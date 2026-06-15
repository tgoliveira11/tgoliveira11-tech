"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Category } from "@/modules/categories/categories.types";
import { taxonomyNamesMatch } from "@/modules/taxonomy/taxonomy-name";
import {
  createOrFindCategoryAction,
  searchCategoriesAction,
} from "@/modules/taxonomy/admin-taxonomy.actions";

type SuggestionItem =
  | { type: "category"; category: Category }
  | { type: "create"; name: string };

function mergeCategories(base: Category[], extra: Category[]): Category[] {
  const merged = new Map(base.map((category) => [category.id, category]));
  for (const category of extra) {
    merged.set(category.id, category);
  }
  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function CategoryCombobox({
  formId,
  categories,
  categoryId,
}: {
  formId: string;
  categories: Category[];
  categoryId: string | null;
}) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const helperId = `${inputId}-helper`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [createdCategories, setCreatedCategories] = useState<Category[]>([]);
  const knownCategories = useMemo(
    () => mergeCategories(categories, createdCategories),
    [categories, createdCategories]
  );
  const [selected, setSelected] = useState<Category | null>(
    () => categories.find((category) => category.id === categoryId) ?? null
  );
  const [query, setQuery] = useState(() => selected?.name ?? "");
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const trimmedQuery = query.trim();

  const defaultSuggestions = useMemo(() => knownCategories.slice(0, 8), [knownCategories]);
  const suggestions = trimmedQuery ? searchResults : defaultSuggestions;

  const showCreateOption =
    trimmedQuery.length > 0 &&
    !suggestions.some((category) => taxonomyNamesMatch(category.name, trimmedQuery)) &&
    !(selected && taxonomyNamesMatch(selected.name, trimmedQuery));

  const options: SuggestionItem[] = useMemo(() => {
    const items: SuggestionItem[] = suggestions.map((category) => ({ type: "category", category }));
    if (showCreateOption) {
      items.push({ type: "create", name: trimmedQuery });
    }
    return items;
  }, [showCreateOption, suggestions, trimmedQuery]);

  const activeHighlightIndex = Math.min(highlightIndex, Math.max(options.length - 1, 0));

  useEffect(() => {
    if (!open || !trimmedQuery) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const result = await searchCategoriesAction(trimmedQuery);
      if (result.ok) {
        setSearchResults(result.data.categories);
      }
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [open, trimmedQuery]);

  function selectCategory(category: Category | null) {
    setSelected(category);
    setQuery(category?.name ?? "");
    setHighlightIndex(0);
    setOpen(false);
    setError(null);
  }

  async function createAndSelectCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const existing =
      knownCategories.find((category) => taxonomyNamesMatch(category.name, trimmed)) ??
      (selected && taxonomyNamesMatch(selected.name, trimmed) ? selected : null);
    if (existing) {
      selectCategory(existing);
      return;
    }

    setPending(true);
    setError(null);
    const result = await createOrFindCategoryAction(trimmed);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCreatedCategories((current) =>
      current.some((category) => category.id === result.data.category.id)
        ? current
        : [...current, result.data.category]
    );
    selectCategory(result.data.category);
  }

  function selectHighlighted() {
    const option = options[activeHighlightIndex];
    if (!option) {
      if (trimmedQuery) {
        void createAndSelectCategory(trimmedQuery);
      }
      return;
    }

    if (option.type === "category") {
      selectCategory(option.category);
      return;
    }

    void createAndSelectCategory(option.name);
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
      setQuery(selected?.name ?? "");
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
        void createAndSelectCategory(trimmedQuery);
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div
          className={`min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--input-bg)] focus-within:ring-2 focus-within:ring-[var(--ring)] ${
            pending ? "opacity-70" : ""
          }`}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightIndex(0);
              setOpen(true);
              if (!event.target.value.trim()) {
                selectCategory(null);
              }
            }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder="Search or create a category"
            className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm outline-none"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-describedby={helperId}
            disabled={pending}
          />
        </div>
        {selected ? (
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className="shrink-0 rounded-md border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] hover:bg-[var(--surface-subtle)]"
          >
            Clear
          </button>
        ) : null}
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
                    onClick={() => void createAndSelectCategory(option.name)}
                  >
                    Create category “{option.name}”
                  </button>
                </li>
              );
            }

            return (
              <li key={option.category.id} role="presentation">
                <button
                  id={optionId}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    active ? "bg-[var(--surface-subtle)]" : "hover:bg-[var(--surface-subtle)]"
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCategory(option.category)}
                >
                  {option.category.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p id={helperId} className="text-xs text-[var(--muted)]">
        Use one broad category for the post. Tags can be more specific.
      </p>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}

      <input type="hidden" name="categoryId" form={formId} value={selected?.id ?? ""} />
    </div>
  );
}
