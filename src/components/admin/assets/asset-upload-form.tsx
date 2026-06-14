"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AssetUploadForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/admin/posts/${postId}/assets`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Upload failed");
      }

      setMessage("Image uploaded");
      form.reset();
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Upload image</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        JPEG, PNG, WebP, or GIF. SVG is not allowed. Max size uses UPLOAD_MAX_FILE_SIZE_BYTES.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium">Image file</span>
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            className="block w-full text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Alt text</span>
          <input name="altText" className="w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Caption</span>
          <input name="caption" className="w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
