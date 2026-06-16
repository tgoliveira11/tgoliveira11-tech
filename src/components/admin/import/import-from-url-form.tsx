"use client";

import { useActionState } from "react";
import {
  importFromUrlAction,
  type ImportFromUrlActionResult,
} from "@/modules/import/url-post-import.actions";

const initialState: ImportFromUrlActionResult = { ok: true };

export function ImportFromUrlForm() {
  const [state, formAction, pending] = useActionState(importFromUrlAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Post URL</span>
        <input
          type="url"
          name="url"
          required
          placeholder="https://example.com/2023-06-16-my-post/"
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
          disabled={pending}
        />
        <span className="mt-1 block text-xs text-[var(--muted)]">
          Only import posts you own or have permission to reuse.
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="createRedirect"
          className="mt-1"
          disabled={pending}
        />
        <span>
          <span className="font-medium">Create redirect from source path to new post</span>
          <span className="mt-1 block text-xs text-[var(--muted)]">
            Use this only when the old URL belongs to a domain this PostForge site will serve.
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Importing post…" : "Import as draft"}
      </button>
    </form>
  );
}
