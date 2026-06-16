import { beforeEach, describe, expect, it, vi } from "vitest";

const { countTagUsageMock, deleteTagByIdMock, findTagByNameCaseInsensitiveMock, findTagBySlugMock, insertTagMock } =
  vi.hoisted(() => ({
    countTagUsageMock: vi.fn(),
    deleteTagByIdMock: vi.fn(),
    findTagByNameCaseInsensitiveMock: vi.fn(),
    findTagBySlugMock: vi.fn(),
    insertTagMock: vi.fn(),
  }));

vi.mock("./tags.repository", () => ({
  countTagUsage: countTagUsageMock,
  deleteTagById: deleteTagByIdMock,
  findTagByNameCaseInsensitive: findTagByNameCaseInsensitiveMock,
  findTagBySlug: findTagBySlugMock,
  insertTag: insertTagMock,
  listTags: vi.fn(),
  listAdminTags: vi.fn(),
  updateTagById: vi.fn(),
  findTagById: vi.fn(),
}));

import { ConflictError } from "@/lib/errors";
import { createTag, deleteTag } from "./tags.service";

describe("tags service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findTagByNameCaseInsensitiveMock.mockResolvedValue(undefined);
    findTagBySlugMock.mockResolvedValue(undefined);
    insertTagMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "news" });
  });

  it("rejects duplicate tag names", async () => {
    findTagByNameCaseInsensitiveMock.mockResolvedValue({ id: "existing", name: "News", slug: "news" });

    await expect(createTag({ name: "News" })).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks deleting tags used by posts", async () => {
    countTagUsageMock.mockResolvedValue(2);

    await expect(deleteTag("tag-1")).rejects.toThrow(/used by posts/i);
    expect(deleteTagByIdMock).not.toHaveBeenCalled();
  });
});
