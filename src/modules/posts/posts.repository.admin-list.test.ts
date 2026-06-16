import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  selectMock,
  selectDistinctMock,
  fromMock,
  innerJoinMock,
  whereMock,
  orderByMock,
  limitMock,
  offsetMock,
} = vi.hoisted(() => {
  const offsetMock = vi.fn();
  const limitMock = vi.fn();
  const orderByMock = vi.fn();
  const whereMock = vi.fn();
  const innerJoinMock = vi.fn();
  const fromMock = vi.fn();
  const selectDistinctMock = vi.fn();
  const selectMock = vi.fn();

  return {
    selectMock,
    selectDistinctMock,
    fromMock,
    innerJoinMock,
    whereMock,
    orderByMock,
    limitMock,
    offsetMock,
  };
});

vi.mock("@/db/get-db", () => ({
  db: {
    select: selectMock,
    selectDistinct: selectDistinctMock,
  },
}));

import { getMaxPublicOrder, getNextPublicOrder, listAdminPosts } from "@/modules/posts/posts.repository";

function mockMaxPublicOrder(max: number | null) {
  const whereForMax = vi.fn().mockResolvedValue([{ max }]);
  const fromForMax = vi.fn().mockReturnValue({ where: whereForMax });
  selectMock.mockReturnValueOnce({ from: fromForMax });
}

describe("posts repository admin helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    offsetMock.mockResolvedValue([]);
    limitMock.mockReturnValue({ offset: offsetMock });
    orderByMock.mockReturnValue({ limit: limitMock });
    whereMock.mockReturnValue({ orderBy: orderByMock });
    innerJoinMock.mockReturnValue({ where: whereMock });
    fromMock.mockReturnValue({ where: whereMock, innerJoin: innerJoinMock });
    selectMock.mockReturnValue({ from: fromMock });
    selectDistinctMock.mockReturnValue({ from: fromMock });
  });

  it("getMaxPublicOrder returns null when no posts have publicOrder", async () => {
    mockMaxPublicOrder(null);
    await expect(getMaxPublicOrder()).resolves.toBeNull();
  });

  it("getNextPublicOrder returns 1 when max publicOrder is null", async () => {
    mockMaxPublicOrder(null);
    await expect(getNextPublicOrder()).resolves.toBe(1);
  });

  it("getNextPublicOrder increments the current max publicOrder", async () => {
    mockMaxPublicOrder(5);
    await expect(getNextPublicOrder()).resolves.toBe(6);
  });

  it("listAdminPosts joins post_tags when tagId filter is provided", async () => {
    const post = { id: "post-1", title: "Tagged post" };
    offsetMock.mockResolvedValue([{ post }]);

    const rows = await listAdminPosts({ tagId: "tag-1", status: "published" });

    expect(selectDistinctMock).toHaveBeenCalled();
    expect(innerJoinMock).toHaveBeenCalled();
    expect(rows).toEqual([post]);
  });

  it("listAdminPosts uses a plain select when tagId is omitted", async () => {
    offsetMock.mockResolvedValue([{ id: "post-1" }]);

    await listAdminPosts({ status: "draft" });

    expect(selectMock).toHaveBeenCalled();
    expect(selectDistinctMock).not.toHaveBeenCalled();
  });
});
