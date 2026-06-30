import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, isAuthorizedAdminMock, bootstrapMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  isAuthorizedAdminMock: vi.fn(),
  bootstrapMock: vi.fn(() => Promise.resolve()),
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth/bootstrap-secure-auth-admin", () => ({
  bootstrapSecureAuthAdmin: bootstrapMock,
}));

vi.mock("@/lib/auth/auth-options", () => ({
  getAuthOptions: vi.fn(() => Promise.resolve({})),
}));

vi.mock("@/modules/admin/is-authorized-admin", () => ({
  isAuthorizedAdmin: isAuthorizedAdminMock,
}));

import { requireOutpostAdmin } from "./require-outpost-admin";

describe("requireOutpostAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAuthorizedAdminMock.mockResolvedValue(true);
  });

  it("throws when session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);

    await expect(requireOutpostAdmin(new Request("http://localhost"))).rejects.toThrow(
      /Authentication required/
    );
    expect(bootstrapMock).toHaveBeenCalled();
  });

  it("throws when session user has no id", async () => {
    getServerSessionMock.mockResolvedValue({ user: { email: "a@b.com" } });

    await expect(requireOutpostAdmin(new Request("http://localhost"))).rejects.toThrow(
      /Authentication required/
    );
  });

  it("throws when user is not an admin", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "u1", email: "a@b.com" } });
    isAuthorizedAdminMock.mockResolvedValue(false);

    await expect(requireOutpostAdmin(new Request("http://localhost"))).rejects.toThrow(
      /Admin access required/
    );
  });

  it("returns actor id for authorized admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
    });

    await expect(requireOutpostAdmin(new Request("http://localhost"))).resolves.toEqual({
      actor: "admin-1",
    });
  });
});
