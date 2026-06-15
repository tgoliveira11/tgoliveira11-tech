"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { schedulePostAction, type ActionResult } from "@/modules/posts/admin-posts.actions";

const initialState: ActionResult = { ok: true };

function toDatetimeLocal(value: Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ScheduleControls({
  postId,
  scheduledAt,
  compact = false,
  embedded = false,
}: {
  postId: string;
  scheduledAt?: Date | null;
  compact?: boolean;
  embedded?: boolean;
}) {
  const router = useRouter();
  const boundAction = schedulePostAction.bind(null, postId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.message) {
      router.refresh();
    }
  }, [state.message, router]);

  if (compact) {
    return (
      <form action={formAction} className="flex items-center gap-1">
        <input
          type="datetime-local"
          name="scheduledAt"
          required
          className="rounded border px-1 py-0.5 text-xs"
          aria-label="Schedule date"
        />
        <button type="submit" disabled={pending} className="text-left text-xs underline disabled:opacity-50">
          Schedule
        </button>
      </form>
    );
  }

  const formBody = (
    <>
      {scheduledAt ? (
        <p className="text-sm text-[var(--muted)]">Currently scheduled: {scheduledAt.toLocaleString()}</p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.message ? <p className="text-sm text-emerald-700">{state.message}</p> : null}
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="mb-1 block">Scheduled at</span>
          <input
            type="datetime-local"
            name="scheduledAt"
            defaultValue={toDatetimeLocal(scheduledAt)}
            required
            className="rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? "Scheduling…" : "Schedule post"}
        </button>
      </form>
    </>
  );

  if (embedded) {
    return <div className="space-y-3">{formBody}</div>;
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">Schedule</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Set a future publish date. Cron-based auto-publish is deferred; scheduled posts stay private until published manually or via cron (M3.6).
      </p>
      <div className="mt-3 space-y-3">{formBody}</div>
    </section>
  );
}
