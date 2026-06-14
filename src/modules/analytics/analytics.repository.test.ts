import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  insertMock,
  selectMock,
  fromMock,
  whereMock,
  limitMock,
  onConflictDoUpdateMock,
  valuesMock,
} = vi.hoisted(() => {
  const insertMock = vi.fn();
  const selectMock = vi.fn();
  const fromMock = vi.fn();
  const whereMock = vi.fn();
  const limitMock = vi.fn();
  const onConflictDoUpdateMock = vi.fn();
  const valuesMock = vi.fn();

  return {
    insertMock,
    selectMock,
    fromMock,
    whereMock,
    limitMock,
    onConflictDoUpdateMock,
    valuesMock,
  };
});

vi.mock("@/db/get-db", () => ({
  db: {
    insert: insertMock,
    select: selectMock,
  },
}));

import { trackPostViewEvent } from "@/modules/analytics/analytics.repository";

describe("analytics repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    limitMock.mockResolvedValue([]);
    whereMock.mockReturnValue({ limit: limitMock });
    fromMock.mockReturnValue({ where: whereMock });
    selectMock.mockReturnValue({ from: fromMock });

    valuesMock.mockReturnValueOnce(Promise.resolve()).mockReturnValue({
      onConflictDoUpdate: onConflictDoUpdateMock,
    });
    insertMock.mockReturnValue({ values: valuesMock });
    onConflictDoUpdateMock.mockResolvedValue(undefined);
  });

  it("trackPostViewEvent upserts post_daily_stats on each view", async () => {
    await trackPostViewEvent({
      postId: "post-1",
      sessionHash: "session-hash",
      referrer: "https://example.com",
      deviceType: "desktop",
    });

    expect(insertMock).toHaveBeenCalledTimes(2);
    expect(valuesMock).toHaveBeenCalledTimes(2);
    expect(onConflictDoUpdateMock).toHaveBeenCalledTimes(1);
  });

  it("trackPostViewEvent stores only aggregate-friendly event fields", async () => {
    await trackPostViewEvent({
      postId: "post-1",
      sessionHash: "hashed-client-key",
      referrer: null,
      deviceType: "mobile",
    });

    const eventValues = valuesMock.mock.calls[0]?.[0];
    expect(eventValues).toMatchObject({
      postId: "post-1",
      sessionHash: "hashed-client-key",
      eventType: "post_view",
    });
    expect(eventValues).not.toHaveProperty("ipAddress");
    expect(eventValues).not.toHaveProperty("ip");
  });
});
