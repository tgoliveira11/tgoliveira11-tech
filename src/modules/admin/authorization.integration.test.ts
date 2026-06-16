import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const { redirectMock, forbiddenMock, getServerSessionMock, getServicesMock } = vi.hoisted(
  () => ({
    redirectMock: vi.fn(),
    forbiddenMock: vi.fn(),
    getServerSessionMock: vi.fn(),
    getServicesMock: vi.fn(),
  })
);

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  forbidden: forbiddenMock,
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth/secure-auth", () => ({
  secureAuth: {
    getServices: getServicesMock,
  },
}));

import { requireAdminSession } from "@/modules/admin/authorization";

describe("requireAdminSession integration", () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAIL = "admin@postforge.test";
    getServicesMock.mockResolvedValue({
      getAuthOptions: vi.fn(() => ({})),
    });
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalAdminEmail;
  });

  it("redirects to login when session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`);
    });

    await expect(requireAdminSession()).rejects.toThrow(/redirect:/);
    expect(redirectMock).toHaveBeenCalledWith("/login?callbackUrl=/admin");
  });

  it("calls forbidden when session email is not admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "u1", email: "not-admin@postforge.test" },
    });
    forbiddenMock.mockImplementation(() => {
      throw new Error("forbidden");
    });

    await expect(requireAdminSession()).rejects.toThrow(/forbidden/);
    expect(forbiddenMock).toHaveBeenCalled();
  });

  it("returns normalized admin user for admin email", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "u1", email: "admin@postforge.test" },
    });

    const result = await requireAdminSession();
    expect(result.user.id).toBe("u1");
  });
});

