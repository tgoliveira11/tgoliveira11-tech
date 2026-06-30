import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findRedirectBySourcePathMock,
  insertRedirectMock,
  listRedirectsMock,
  deleteRedirectByIdMock,
} = vi.hoisted(() => ({
  findRedirectBySourcePathMock: vi.fn(),
  insertRedirectMock: vi.fn(),
  listRedirectsMock: vi.fn(),
  deleteRedirectByIdMock: vi.fn(),
}));

vi.mock("./redirects.repository", () => ({
  findRedirectBySourcePath: findRedirectBySourcePathMock,
  insertRedirect: insertRedirectMock,
  listRedirects: listRedirectsMock,
  deleteRedirectById: deleteRedirectByIdMock,
}));

import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  createRedirect,
  deleteRedirect,
  getRedirectBySourcePath,
  listRedirects,
} from "./redirects.service";

describe("redirects service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findRedirectBySourcePathMock.mockResolvedValue(undefined);
    insertRedirectMock.mockResolvedValue({
      id: "r1",
      sourcePath: "/old",
      targetPath: "/new",
      statusCode: 301,
    });
  });

  it("creates redirect when source path is free", async () => {
    const redirect = await createRedirect({ sourcePath: "/old", targetPath: "/new" });
    expect(redirect.sourcePath).toBe("/old");
    expect(insertRedirectMock).toHaveBeenCalled();
  });

  it("rejects duplicate source path", async () => {
    findRedirectBySourcePathMock.mockResolvedValue({ id: "existing" });
    await expect(
      createRedirect({ sourcePath: "/old", targetPath: "/new" })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("gets redirect by source path", async () => {
    findRedirectBySourcePathMock.mockResolvedValue({
      id: "r1",
      sourcePath: "/old",
      targetPath: "/new",
      statusCode: 301,
    });
    await expect(getRedirectBySourcePath("/old")).resolves.toMatchObject({ id: "r1" });
  });

  it("throws when redirect is missing", async () => {
    await expect(getRedirectBySourcePath("/missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lists redirects", async () => {
    listRedirectsMock.mockResolvedValue([]);
    await expect(listRedirects()).resolves.toEqual([]);
  });

  it("deletes redirect", async () => {
    deleteRedirectByIdMock.mockResolvedValue(true);
    await deleteRedirect("r1");
    expect(deleteRedirectByIdMock).toHaveBeenCalledWith("r1");
  });

  it("throws when delete misses redirect", async () => {
    deleteRedirectByIdMock.mockResolvedValue(false);
    await expect(deleteRedirect("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
