"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminTagRow } from "@/modules/tags/tags.repository";
import {
  createTagAction,
  deleteTagAction,
  updateTagAction,
  type TaxonomyActionResult,
} from "@/modules/tags/admin-tags.actions";

const initialState: TaxonomyActionResult = { ok: false };

export function AdminTagsManager({ tags }: { tags: AdminTagRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, createPending] = useActionState(createTagAction, initialState);
  const [pending, startTransition] = useTransition();

  const filtered = tags.filter((tag) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return tag.name.toLowerCase().includes(needle) || tag.slug.toLowerCase().includes(needle);
  });

  function handleDelete(tag: AdminTagRow) {
    if (tag.totalPostCount > 0) {
      return;
    }
    if (!window.confirm(`Delete tag “${tag.name}”?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteTagAction(tag.id);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-lg font-semibold">Create tag</h2>
        <form action={createAction} className="mt-4 grid gap-3 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createPending}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {createPending ? "Creating…" : "Create tag"}
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
          <h2 className="text-lg font-semibold">Tags</h2>
          <label className="block text-sm">
            <span className="sr-only">Search tags</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tags"
              className="w-full min-w-[12rem] rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No tags match your search.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Published</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tag) => (
                  <TagRow
                    key={tag.id}
                    tag={tag}
                    editing={editingId === tag.id}
                    pending={pending}
                    onEdit={() => setEditingId(tag.id)}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                    onDelete={() => handleDelete(tag)}
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

function TagRow({
  tag,
  editing,
  pending,
  onEdit,
  onCancel,
  onSaved,
  onDelete,
}: {
  tag: AdminTagRow;
  editing: boolean;
  pending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const boundUpdate = updateTagAction.bind(null, tag.id);
  const [state, formAction, updatePending] = useActionState(boundUpdate, initialState);

  useEffect(() => {
    if (state.ok && state.message && !state.error) {
      onSaved();
    }
  }, [onSaved, state.error, state.message, state.ok]);

  if (editing) {
    return (
      <tr className="border-b border-[var(--border)]">
        <td colSpan={5} className="px-3 py-3">
          <form action={formAction} className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Name</span>
              <input
                name="name"
                defaultValue={tag.name}
                required
                className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Slug</span>
              <input
                name="slug"
                defaultValue={tag.slug}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-sm"
              />
            </label>
            <div className="flex gap-2 sm:col-span-2">
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
      <td className="px-3 py-3">{tag.name}</td>
      <td className="px-3 py-3 font-mono text-xs">{tag.slug}</td>
      <td className="px-3 py-3">{tag.publishedPostCount}</td>
      <td className="px-3 py-3">{tag.totalPostCount}</td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onEdit} className="text-sm text-[var(--primary)]">
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending || tag.totalPostCount > 0}
            title={
              tag.totalPostCount > 0
                ? "This tag is used by posts and cannot be deleted."
                : "Delete tag"
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
