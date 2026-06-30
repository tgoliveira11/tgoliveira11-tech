import { beforeEach, describe, expect, it, vi } from "vitest";

function drizzleResult<T>(value: T) {
  const promise = Promise.resolve(value);
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return promise.then.bind(promise);
        }
        return () => drizzleResult(value);
      },
    }
  );
}

const { insertMock, selectMock, deleteMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/db/get-db", () => ({
  db: {
    insert: insertMock,
    select: selectMock,
    delete: deleteMock,
  },
}));

import { getTagIdsForPost, getTagsForPost, syncPostTags } from "./post-tags.repository";

const postId = "550e8400-e29b-41d4-a716-446655440000";
const tagId = "660e8400-e29b-41d4-a716-446655440001";

const sampleTag = {
  id: tagId,
  name: "News",
  slug: "news",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("post-tags repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteMock.mockImplementation(() => ({
      where: () => Promise.resolve(undefined),
    }));
    insertMock.mockImplementation(() => ({
      values: () => Promise.resolve(undefined),
    }));
  });

  it("loads tags and tag ids for a post", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        innerJoin: () => drizzleResult([{ tag: sampleTag }]),
      }),
    }));
    await expect(getTagsForPost(postId)).resolves.toEqual([sampleTag]);

    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([{ tagId }]),
    }));
    await expect(getTagIdsForPost(postId)).resolves.toEqual([tagId]);
  });

  it("syncs post tags after validating ids", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([{ id: tagId }]),
    }));

    await syncPostTags(postId, [tagId, tagId]);
    expect(deleteMock).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
  });

  it("clears tags when empty list is provided", async () => {
    await syncPostTags(postId, []);
    expect(deleteMock).toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects invalid tag ids", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([]),
    }));

    await expect(syncPostTags(postId, [tagId])).rejects.toThrow(/One or more tag IDs are invalid/);
  });
});
