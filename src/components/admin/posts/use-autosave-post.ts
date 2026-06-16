"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PostStatus } from "@/modules/posts/posts.types";
import { autosavePostAction } from "@/modules/posts/admin-posts.actions";
import { getAutosaveSuccessMessage } from "@/modules/posts/admin-posts.messages";
import {
  collectPostEditorFormData,
  POSTFORGE_AUTOSAVE_PAUSE_EVENT,
  POSTFORGE_AUTOSAVE_RESUME_EVENT,
  serializePostEditorPayload,
  shouldRunAutosave,
} from "@/modules/posts/post-editor-payload";

export type AutosaveStatus = "saved" | "saving" | "unsaved" | "error";

export type AutosaveState = {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  message: string | null;
  error: string | null;
};

const DEFAULT_DEBOUNCE_MS = 2000;

export function formatAutosaveTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function useAutosavePost({
  postId,
  postStatus,
  formId,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  paused = false,
  onSaved,
}: {
  postId: string;
  postStatus: PostStatus;
  formId: string;
  debounceMs?: number;
  paused?: boolean;
  onSaved?: () => void;
}): AutosaveState & {
  syncBaseline: () => void;
} {
  const [status, setStatus] = useState<AutosaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pausedInternal, setPausedInternal] = useState(false);

  const userEditedRef = useRef(false);
  const lastSavedPayloadRef = useRef<string | null>(null);
  const lastDirtyAtRef = useRef<number | null>(null);

  const isSavingRef = useRef(false);
  const needsResaveRef = useRef(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runAutosaveRef = useRef<() => void>(() => {});

  const syncBaseline = useCallback(() => {
    const formData = collectPostEditorFormData(formId);
    if (!formData) return;
    lastSavedPayloadRef.current = serializePostEditorPayload(formData);
    userEditedRef.current = false;
    lastDirtyAtRef.current = null;
    needsResaveRef.current = false;

    setStatus("saved");
    setError(null);
    setMessage(null);
    setLastSavedAt(null);
  }, [formId]);

  const runAutosave = useCallback(async () => {
    const formData = collectPostEditorFormData(formId);
    if (!formData) return;

    const payload = serializePostEditorPayload(formData);

    if (
      !shouldRunAutosave({
        userEdited: userEditedRef.current,
        paused: pausedInternal || paused,
        payload,
        lastSavedPayload: lastSavedPayloadRef.current,
      })
    ) {
      return;
    }

    if (isSavingRef.current) {
      needsResaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    needsResaveRef.current = false;

    setStatus("saving");
    setError(null);

    const result = await autosavePostAction(postId, formData);

    isSavingRef.current = false;

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Autosave failed");
      return;
    }

    lastSavedPayloadRef.current = payload;
    userEditedRef.current = false;

    const savedAt = result.savedAt ? new Date(result.savedAt) : new Date();
    setLastSavedAt(savedAt);
    setMessage(result.message ?? getAutosaveSuccessMessage(postStatus));
    setStatus("saved");
    setError(null);
    onSaved?.();

    if (needsResaveRef.current) {
      const lastDirtyAt = lastDirtyAtRef.current ?? Date.now();
      const elapsed = Date.now() - lastDirtyAt;
      const delay = Math.max(0, debounceMs - elapsed);
      needsResaveRef.current = false;

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        runAutosaveRef.current();
      }, delay);
    }
  }, [debounceMs, formId, onSaved, paused, pausedInternal, postId, postStatus]);

  useEffect(() => {
    runAutosaveRef.current = () => {
      void runAutosave();
    };
  }, [runAutosave]);

  const scheduleAutosave = useCallback(
    (delayMs: number) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        runAutosaveRef.current();
      }, delayMs);
    },
    []
  );

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;

    const handleDirty = () => {
      userEditedRef.current = true;
      lastDirtyAtRef.current = Date.now();
      setStatus("unsaved");
      setError(null);

      if (pausedInternal || paused) return;

      if (isSavingRef.current) {
        needsResaveRef.current = true;
        return;
      }

      scheduleAutosave(debounceMs);
    };

    form.addEventListener("input", handleDirty);
    form.addEventListener("change", handleDirty);

    return () => {
      form.removeEventListener("input", handleDirty);
      form.removeEventListener("change", handleDirty);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [debounceMs, formId, paused, pausedInternal, scheduleAutosave]);

  useEffect(() => {
    queueMicrotask(() => {
      syncBaseline();
    });
  }, [postId, syncBaseline]);

  useEffect(() => {
    if (!(paused || pausedInternal) && debounceTimerRef.current) return;
    if (paused || pausedInternal) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    }
  }, [paused, pausedInternal]);

  useEffect(() => {
    const handlePause = () => setPausedInternal(true);
    const handleResume = () => setPausedInternal(false);

    document.addEventListener(POSTFORGE_AUTOSAVE_PAUSE_EVENT, handlePause);
    document.addEventListener(POSTFORGE_AUTOSAVE_RESUME_EVENT, handleResume);
    return () => {
      document.removeEventListener(POSTFORGE_AUTOSAVE_PAUSE_EVENT, handlePause);
      document.removeEventListener(POSTFORGE_AUTOSAVE_RESUME_EVENT, handleResume);
    };
  }, []);

  return {
    status,
    lastSavedAt,
    message,
    error,
    syncBaseline,
  };
}
