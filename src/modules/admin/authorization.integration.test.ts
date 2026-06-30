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

vi.mock("@/lib/auth/bootstrap-secure-auth-admin", () => ({
  bootstrapSecureAuthAdmin: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/db/client", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
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

  it("returns normalized admin user when session role is admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "u2", email: "other@example.com", role: "admin" },
    });

    const result = await requireAdminSession();
    expect(result.user.id).toBe("u2");
  });
});

describe("hasAuthenticatedSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServicesMock.mockResolvedValue({
      getAuthOptions: vi.fn(() => ({})),
    });
  });

  it("returns false when session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const { hasAuthenticatedSession } = await import("@/modules/admin/authorization");
    await expect(hasAuthenticatedSession()).resolves.toBe(false);
  });

  it("returns true when session has a user id", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "u1", email: "anyone@example.com" },
    });

    const { hasAuthenticatedSession } = await import("@/modules/admin/authorization");
    await expect(hasAuthenticatedSession()).resolves.toBe(true);
  });
});

describe("requireAdminApiSession", () => {
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

  it("throws ForbiddenError when session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const { requireAdminApiSession } = await import("@/modules/admin/authorization");
    await expect(requireAdminApiSession()).rejects.toMatchObject({
      message: "Admin access required",
    });
  });

  it("throws ForbiddenError when user is not admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "u1", email: "not-admin@postforge.test" },
    });

    const { requireAdminApiSession } = await import("@/modules/admin/authorization");
    await expect(requireAdminApiSession()).rejects.toMatchObject({
      message: "Admin access required",
    });
  });

  it("returns normalized admin user for authorized session", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "u1", email: "admin@postforge.test" },
    });

    const { requireAdminApiSession } = await import("@/modules/admin/authorization");
    const result = await requireAdminApiSession();
    expect(result.user.id).toBe("u1");
  });
});

describe("requireAdminSession missing user id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServicesMock.mockResolvedValue({
      getAuthOptions: vi.fn(() => ({})),
    });
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`);
    });
  });

  it("redirects when session user has no id", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@postforge.test" },
    });

    await expect(requireAdminSession()).rejects.toThrow(/redirect:/);
  });
});

