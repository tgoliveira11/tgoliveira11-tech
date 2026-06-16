"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminCategoryRow } from "@/modules/categories/categories.repository";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type TaxonomyActionResult,
} from "@/modules/categories/admin-categories.actions";

const initialState: TaxonomyActionResult = { ok: false };

export function AdminCategoriesManager({ categories }: { categories: AdminCategoryRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, createPending] = useActionState(createCategoryAction, initialState);
  const [pending, startTransition] = useTransition();

  const filtered = categories.filter((category) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      category.name.toLowerCase().includes(needle) ||
      category.slug.toLowerCase().includes(needle) ||
      (category.description ?? "").toLowerCase().includes(needle)
    );
  });

  function handleDelete(category: AdminCategoryRow) {
    if (category.totalPostCount > 0) {
      return;
    }
    if (!window.confirm(`Delete category “${category.name}”?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-lg font-semibold">Create category</h2>
        <form action={createAction} className="mt-4 grid gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Name</span>
            <input
              name="name"
              required
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Slug</span>
            <input
              name="slug"
              placeholder="optional"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Description</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
          <div>
            <button
              type="submit"
              disabled={createPending}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {createPending ? "Creating…" : "Create category"}
            </button>
          </div>
        </form>
        {createState.error ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {createState.error}
          </p>
        ) : null}
        {createState.message && !createState.error ? (
          <p className="mt-3 text-sm text-emerald-700">{createState.message}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Categories</h2>
          <label className="block text-sm">
            <span className="sr-only">Search categories</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories"
              className="w-full min-w-[12rem] rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No categories match your search.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Published</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    editing={editingId === category.id}
                    pending={pending}
                    onEdit={() => setEditingId(category.id)}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                    onDelete={() => handleDelete(category)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryRow({
  category,
  editing,
  pending,
  onEdit,
  onCancel,
  onSaved,
  onDelete,
}: {
  category: AdminCategoryRow;
  editing: boolean;
  pending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const boundUpdate = updateCategoryAction.bind(null, category.id);
  const [state, formAction, updatePending] = useActionState(boundUpdate, initialState);

  useEffect(() => {
    if (state.ok && state.message && !state.error) {
      onSaved();
    }
  }, [onSaved, state.error, state.message, state.ok]);

  if (editing) {
    return (
      <tr className="border-b border-[var(--border)]">
        <td colSpan={6} className="px-3 py-3">
          <form action={formAction} className="grid gap-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Name</span>
              <input
                name="name"
                defaultValue={category.name}
                required
                className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Slug</span>
              <input
                name="slug"
                defaultValue={category.slug}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Description</span>
              <textarea
                name="description"
                defaultValue={category.description ?? ""}
                rows={3}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatePending}
                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm text-white"
              >
                Save
              </button>
              <button type="button" onClick={onCancel} className="rounded-md border px-3 py-2 text-sm">
                Cancel
              </button>
            </div>
          </form>
          {state.error ? (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {state.error}
            </p>
          ) : null}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[var(--border)]">
      <td className="px-3 py-3">{category.name}</td>
      <td className="px-3 py-3 font-mono text-xs">{category.slug}</td>
      <td className="px-3 py-3 text-[var(--muted)]">{category.description ?? "—"}</td>
      <td className="px-3 py-3">{category.publishedPostCount}</td>
      <td className="px-3 py-3">{category.totalPostCount}</td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onEdit} className="text-sm text-[var(--primary)]">
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending || category.totalPostCount > 0}
            title={
              category.totalPostCount > 0
                ? "This category is used by posts and cannot be deleted."
                : "Delete category"
            }
            className="text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
