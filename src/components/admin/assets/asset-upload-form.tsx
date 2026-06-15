"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { readUploadMaxFileSizeBytes } from "@/lib/env";
import { AssetDropzone } from "./asset-dropzone";
import { assignFileToInput } from "./asset-upload.helpers";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export function AssetUploadForm({
  postId,
  compact = false,
  maxSizeBytes = DEFAULT_MAX_BYTES,
}: {
  postId: string;
  compact?: boolean;
  maxSizeBytes?: number;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const resolvedMaxSize = maxSizeBytes > 0 ? maxSizeBytes : DEFAULT_MAX_BYTES;

  function resetForm() {
    setSelectedFile(null);
    formRef.current?.reset();
    const fileInput = formRef.current?.querySelector('input[type="file"]');
    if (fileInput instanceof HTMLInputElement) {
      assignFileToInput(fileInput, null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Choose an image file to upload.");
      return;
    }

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
      resetForm();
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  const fields = (
    <>
      <AssetDropzone
        selectedFile={selectedFile}
        onFileChange={setSelectedFile}
        maxSizeBytes={resolvedMaxSize}
        disabled={pending}
        error={error && !selectedFile ? error : null}
      />
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Alt text (optional)</span>
        <input
          name="altText"
          disabled={pending}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Caption (optional)</span>
        <input
          name="caption"
          disabled={pending}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </label>
      {error && selectedFile ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <button
        type="submit"
        disabled={pending || !selectedFile}
        className={`rounded-md bg-[var(--primary)] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
          compact ? "w-full px-3 py-2 text-sm" : "px-4 py-2 text-sm"
        }`}
      >
        {pending ? "Uploading…" : "Upload image"}
      </button>
    </>
  );

  if (compact) {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        {fields}
      </form>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Upload image</h2>
      <div className="mt-4 space-y-3">{fields}</div>
    </form>
  );
}

/** Server components can pass the configured limit; client fallbacks use env or 5 MB default. */
export function readAssetUploadMaxSizeBytes(): number {
  try {
    return readUploadMaxFileSizeBytes();
  } catch {
    return DEFAULT_MAX_BYTES;
  }
}
