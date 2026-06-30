import { beforeEach, describe, expect, it, vi } from "vitest";

const { bootstrapAdminIfNeededMock } = vi.hoisted(() => ({
  bootstrapAdminIfNeededMock: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/auth/secure-auth", () => ({
  secureAuth: {
    getServices: vi.fn(() =>
      Promise.resolve({
        adminService: { bootstrapAdminIfNeeded: bootstrapAdminIfNeededMock },
      })
    ),
  },
}));

describe("bootstrapSecureAuthAdmin", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    bootstrapAdminIfNeededMock.mockResolvedValue(undefined);
  });

  it("bootstraps admin once for concurrent callers", async () => {
    const { bootstrapSecureAuthAdmin } = await import("./bootstrap-secure-auth-admin");

    await Promise.all([bootstrapSecureAuthAdmin(), bootstrapSecureAuthAdmin()]);

    expect(bootstrapAdminIfNeededMock).toHaveBeenCalledTimes(1);
  });

  it("allows retry after bootstrap failure", async () => {
    bootstrapAdminIfNeededMock.mockRejectedValueOnce(new Error("db down"));
    bootstrapAdminIfNeededMock.mockResolvedValueOnce(undefined);

    const { bootstrapSecureAuthAdmin } = await import("./bootstrap-secure-auth-admin");

    await expect(bootstrapSecureAuthAdmin()).rejects.toThrow(/db down/);
    await expect(bootstrapSecureAuthAdmin()).resolves.toBeUndefined();
    expect(bootstrapAdminIfNeededMock).toHaveBeenCalledTimes(2);
  });
});
