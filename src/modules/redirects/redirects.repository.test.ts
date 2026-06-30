import { beforeEach, describe, expect, it, vi } from "vitest";

const { insertReturningMock, selectLimitMock, selectMock, deleteReturningMock, orderByMock } =
  vi.hoisted(() => {
    const insertReturningMock = vi.fn();
    const selectLimitMock = vi.fn();
    const orderByMock = vi.fn();
    const selectMock = vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: selectLimitMock })),
        orderBy: orderByMock,
      })),
    }));
    const deleteReturningMock = vi.fn();

    return {
      insertReturningMock,
      selectLimitMock,
      selectMock,
      deleteReturningMock,
      orderByMock,
      insertMock: vi.fn(() => ({
        values: vi.fn(() => ({ returning: insertReturningMock })),
      })),
      deleteMock: vi.fn(() => ({
        where: vi.fn(() => ({ returning: deleteReturningMock })),
      })),
    };
  });

vi.mock("@/db/get-db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturningMock })),
    })),
    select: selectMock,
    delete: vi.fn(() => ({
      where: vi.fn(() => ({ returning: deleteReturningMock })),
    })),
  },
}));

import {
  deleteRedirectById,
  findRedirectBySourcePath,
  insertRedirect,
  listRedirects,
} from "./redirects.repository";

const sampleRedirect = {
  id: "redirect-1",
  sourcePath: "/old",
  targetPath: "/new",
  statusCode: 301,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("redirects repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertReturningMock.mockResolvedValue([sampleRedirect]);
    selectLimitMock.mockResolvedValue([sampleRedirect]);
    orderByMock.mockResolvedValue([sampleRedirect]);
    deleteReturningMock.mockResolvedValue([{ id: "redirect-1" }]);
  });

  it("inserts redirects", async () => {
    await expect(
      insertRedirect({ sourcePath: "/old", targetPath: "/new", statusCode: 301 })
    ).resolves.toEqual(sampleRedirect);
  });

  it("finds redirect by source path", async () => {
    await expect(findRedirectBySourcePath("/old")).resolves.toEqual(sampleRedirect);
    selectLimitMock.mockResolvedValueOnce([]);
    await expect(findRedirectBySourcePath("/missing")).resolves.toBeUndefined();
  });

  it("lists redirects", async () => {
    await expect(listRedirects()).resolves.toEqual([sampleRedirect]);
  });

  it("deletes redirects by id", async () => {
    await expect(deleteRedirectById("redirect-1")).resolves.toBe(true);
    deleteReturningMock.mockResolvedValueOnce([]);
    await expect(deleteRedirectById("missing")).resolves.toBe(false);
  });
});
