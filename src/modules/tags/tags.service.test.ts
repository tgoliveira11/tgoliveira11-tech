import { beforeEach, describe, expect, it, vi } from "vitest";

const { countTagUsageMock, deleteTagByIdMock, findTagByNameCaseInsensitiveMock, findTagBySlugMock, insertTagMock, findTagByIdMock, updateTagByIdMock, listTagsMock, listAdminTagsMock } =
  vi.hoisted(() => ({
    countTagUsageMock: vi.fn(),
    deleteTagByIdMock: vi.fn(),
    findTagByNameCaseInsensitiveMock: vi.fn(),
    findTagBySlugMock: vi.fn(),
    insertTagMock: vi.fn(),
    findTagByIdMock: vi.fn(),
    updateTagByIdMock: vi.fn(),
    listTagsMock: vi.fn(),
    listAdminTagsMock: vi.fn(),
  }));

vi.mock("./tags.repository", () => ({
  countTagUsage: countTagUsageMock,
  deleteTagById: deleteTagByIdMock,
  findTagByNameCaseInsensitive: findTagByNameCaseInsensitiveMock,
  findTagBySlug: findTagBySlugMock,
  insertTag: insertTagMock,
  listTags: listTagsMock,
  listAdminTags: listAdminTagsMock,
  updateTagById: updateTagByIdMock,
  findTagById: findTagByIdMock,
}));

import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  createTag,
  deleteTag,
  getTagBySlug,
  getTagUsageCount,
  listAdminTags,
  listTags,
  updateTag,
} from "./tags.service";

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

  it("rejects invalid slug on create", async () => {
    await expect(createTag({ name: "News", slug: "!!!" })).rejects.toThrow(/Invalid tag slug/);
  });

  it("rejects duplicate slug on create", async () => {
    findTagBySlugMock.mockResolvedValue({ id: "existing", name: "News", slug: "news" });

    await expect(createTag({ name: "News 2", slug: "news" })).rejects.toThrow(/slug already exists/i);
  });

  it("creates tag with generated slug", async () => {
    insertTagMock.mockResolvedValueOnce({ id: "tag-2", name: "DevOps", slug: "devops" });

    const tag = await createTag({ name: "DevOps" });
    expect(tag.slug).toBe("devops");
    expect(insertTagMock).toHaveBeenCalledWith({ name: "DevOps", slug: "devops" });
  });

  it("updates tag and normalizes slug", async () => {
    findTagByIdMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "news" });
    updateTagByIdMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "breaking-news" });

    const updated = await updateTag("tag-1", { slug: "Breaking News" });
    expect(updated.slug).toBe("breaking-news");
  });

  it("rejects update when tag is missing", async () => {
    findTagByIdMock.mockResolvedValue(undefined);

    await expect(updateTag("missing", { name: "X" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects slug conflict on update", async () => {
    findTagByIdMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "news" });
    findTagBySlugMock.mockResolvedValue({ id: "tag-2", name: "Other", slug: "other" });

    await expect(updateTag("tag-1", { slug: "other" })).rejects.toThrow(/slug already exists/i);
  });

  it("throws when update returns null", async () => {
    findTagByIdMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "news" });
    updateTagByIdMock.mockResolvedValue(null);

    await expect(updateTag("tag-1", { name: "News" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("gets tag by slug", async () => {
    findTagBySlugMock.mockResolvedValue({ id: "tag-1", name: "News", slug: "news" });
    await expect(getTagBySlug("news")).resolves.toEqual({
      id: "tag-1",
      name: "News",
      slug: "news",
    });
  });

  it("throws when tag slug is missing", async () => {
    findTagBySlugMock.mockResolvedValue(undefined);
    await expect(getTagBySlug("missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lists tags and admin tags", async () => {
    listTagsMock.mockResolvedValue([{ id: "1", name: "A", slug: "a" }]);
    listAdminTagsMock.mockResolvedValue([{ id: "1", name: "A", slug: "a", postCount: 0 }]);

    await expect(listTags()).resolves.toHaveLength(1);
    await expect(listAdminTags()).resolves.toHaveLength(1);
  });

  it("returns usage count", async () => {
    countTagUsageMock.mockResolvedValue(3);
    await expect(getTagUsageCount("tag-1")).resolves.toBe(3);
  });

  it("deletes unused tag", async () => {
    countTagUsageMock.mockResolvedValue(0);
    deleteTagByIdMock.mockResolvedValue(true);

    await deleteTag("tag-1");
    expect(deleteTagByIdMock).toHaveBeenCalledWith("tag-1");
  });

  it("throws when deleting missing tag", async () => {
    countTagUsageMock.mockResolvedValue(0);
    deleteTagByIdMock.mockResolvedValue(false);

    await expect(deleteTag("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
