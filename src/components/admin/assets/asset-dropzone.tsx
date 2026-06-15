"use client";

import { useId, useRef, useState } from "react";
import { formatBytesHuman } from "@/lib/format-bytes";
import {
  ASSET_UPLOAD_ACCEPT,
  ASSET_UPLOAD_INPUT_NAME,
  assignFileToInput,
  pickFirstImageFile,
} from "./asset-upload.helpers";

export function AssetDropzone({
  selectedFile,
  onFileChange,
  maxSizeBytes,
  disabled = false,
  inputName = ASSET_UPLOAD_INPUT_NAME,
  error,
}: {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  maxSizeBytes: number;
  disabled?: boolean;
  inputName?: string;
  error?: string | null;
}) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [dragActive, setDragActive] = useState(false);
  const [dropHint, setDropHint] = useState<string | null>(null);

  const maxSizeLabel = formatBytesHuman(maxSizeBytes);

  function applyFile(file: File | null, ignoredExtraCount = 0) {
    onFileChange(file);
    assignFileToInput(inputRef.current, file);
    setDropHint(
      ignoredExtraCount > 0 ? `Only one file at a time. Using the first of ${ignoredExtraCount + 1} files.` : null
    );
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { file, ignoredExtraCount } = pickFirstImageFile(event.target.files ?? []);
    applyFile(file, ignoredExtraCount);
  }

  function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragEnter(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    dragCounter.current += 1;
    setDragActive(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    dragCounter.current = 0;
    setDragActive(false);
    const { file, ignoredExtraCount } = pickFirstImageFile(event.dataTransfer.files);
    applyFile(file, ignoredExtraCount);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={inputName}
        accept={ASSET_UPLOAD_ACCEPT}
        disabled={disabled}
        className="sr-only"
        onChange={handleInputChange}
        aria-describedby={helperId}
      />
      <label
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragActive
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--border)] bg-[var(--surface-subtle)] hover:border-[var(--primary)]/60 hover:bg-[var(--surface-muted)]"
        } focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="text-sm font-medium text-[var(--foreground)]">
          Drop an image here or click to upload
        </span>
        <span id={helperId} className="mt-2 max-w-xs text-xs text-[var(--muted)]">
          JPEG, PNG, WebP or GIF up to {maxSizeLabel}. SVG is not allowed.
        </span>
        {selectedFile ? (
          <span className="mt-3 rounded-md bg-[var(--background)] px-2 py-1 font-mono text-xs text-[var(--foreground)]">
            Selected: {selectedFile.name}
          </span>
        ) : null}
      </label>
      {dropHint ? <p className="text-xs text-[var(--muted)]">{dropHint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
