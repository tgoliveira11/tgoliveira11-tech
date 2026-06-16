import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  getByIdMock,
  setPostPublicOrderMock,
  clearPostPublicOrderMock,
  revalidatePublicPathsMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  getByIdMock: vi.fn(),
  setPostPublicOrderMock: vi.fn(),
  clearPostPublicOrderMock: vi.fn(),
  revalidatePublicPathsMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/posts/posts.service", () => ({
  getById: getByIdMock,
  setPostPublicOrder: setPostPublicOrderMock,
  clearPostPublicOrder: clearPostPublicOrderMock,
}));

vi.mock("@/modules/admin/revalidate-public", () => ({
  revalidatePublicPaths: revalidatePublicPathsMock,
}));

import {
  clearPostPublicOrderAction,
  updatePostPublicOrderAction,
} from "@/modules/posts/admin-posts.actions";

const postId = "post-123";

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: postId,
    status: "published",
    slug: "test-post",
    ...overrides,
  };
}

describe("public order admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1", email: "admin@example.com" } });
  });

  it("allows admin to set public order for published post", async () => {
    getByIdMock.mockResolvedValue(makePost());
    setPostPublicOrderMock.mockResolvedValue(makePost({ publicOrder: 2 }));

    const formData = new FormData();
    formData.set("publicOrder", "2");

    const result = await updatePostPublicOrderAction(postId, { ok: false }, formData);

    expect(result.ok).toBe(true);
    expect(setPostPublicOrderMock).toHaveBeenCalledWith(postId, "admin-1", { publicOrder: 2 });
    expect(revalidatePublicPathsMock).toHaveBeenCalledWith("test-post");
  });

  it("rejects invalid public order", async () => {
    getByIdMock.mockResolvedValue(makePost());

    const formData = new FormData();
    formData.set("publicOrder", "0");

    const result = await updatePostPublicOrderAction(postId, { ok: false }, formData);

    expect(result.ok).toBe(false);
    expect(setPostPublicOrderMock).not.toHaveBeenCalled();
  });

  it("clears public order", async () => {
    getByIdMock.mockResolvedValue(makePost({ publicOrder: 1 }));
    clearPostPublicOrderMock.mockResolvedValue(makePost({ publicOrder: null }));

    const result = await clearPostPublicOrderAction(postId);

    expect(result.ok).toBe(true);
    expect(clearPostPublicOrderMock).toHaveBeenCalledWith(postId, "admin-1");
  });

  it("requires admin session", async () => {
    requireAdminSessionMock.mockRejectedValue(new Error("Forbidden"));

    const formData = new FormData();
    formData.set("publicOrder", "1");

    const result = await updatePostPublicOrderAction(postId, { ok: false }, formData);
    expect(result.ok).toBe(false);
  });
});
