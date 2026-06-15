import { ScheduleControls } from "./schedule-controls";
import { EditorCard } from "./editor-card";

export function PostPublishingCard({
  postId,
  scheduledAt,
}: {
  postId: string;
  scheduledAt: Date | null;
}) {
  return (
    <EditorCard
      title="Schedule"
      description="Scheduled posts remain private until the scheduled time. Auto-publish cron is not active yet — publish manually or via cron when configured."
    >
      <ScheduleControls postId={postId} scheduledAt={scheduledAt} embedded />
    </EditorCard>
  );
}
