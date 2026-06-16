import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  importPostFromUrlMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  importPostFromUrlMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/import/url-post-importer", () => ({
  importPostFromUrl: importPostFromUrlMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT");
    (error as Error & { digest: string }).digest = `NEXT_REDIRECT;${url}`;
    throw error;
  }),
}));

import { importFromUrlAction } from "@/modules/import/url-post-import.actions";
import { redirect } from "next/navigation";

describe("importFromUrlAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1", email: "admin@test.com" } });
    importPostFromUrlMock.mockResolvedValue({
      postId: "post-1",
      report: { warnings: [] },
    });
  });

  it("requires admin session and redirects to edit page on success", async () => {
    const formData = new FormData();
    formData.set("url", "https://example.com/post/");

    await expect(importFromUrlAction({ ok: true }, formData)).rejects.toThrow("NEXT_REDIRECT");
    expect(requireAdminSessionMock).toHaveBeenCalled();
    expect(importPostFromUrlMock).toHaveBeenCalledWith({
      url: "https://example.com/post/",
      createRedirect: false,
      userId: "admin-1",
    });
    expect(redirect).toHaveBeenCalledWith("/admin/posts/post-1/edit?imported=1");
  });

  it("returns validation error for invalid URL", async () => {
    const formData = new FormData();
    formData.set("url", "not-a-url");

    const result = await importFromUrlAction({ ok: true }, formData);
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
