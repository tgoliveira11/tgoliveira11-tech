import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const selectMock = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => selectMock(...args),
  },
}));

import { isAuthorizedAdmin } from "./is-authorized-admin";

describe("isAuthorizedAdmin", () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAIL = "tgoliveira11@gmail.com";
    selectMock.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    });
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalAdminEmail;
  });

  it("allows configured bootstrap admin email", async () => {
    await expect(
      isAuthorizedAdmin({ id: "u1", email: "tgoliveira11@gmail.com" })
    ).resolves.toBe(true);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("allows users with admin role in session", async () => {
    await expect(
      isAuthorizedAdmin({ id: "u2", email: "other@example.com", role: "admin" })
    ).resolves.toBe(true);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("allows users with admin role in database", async () => {
    selectMock.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ role: "admin" }])),
        })),
      })),
    });

    await expect(
      isAuthorizedAdmin({ id: "u3", email: "other@example.com" })
    ).resolves.toBe(true);
  });

  it("denies non-admin users", async () => {
    selectMock.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ role: "user" }])),
        })),
      })),
    });

    await expect(
      isAuthorizedAdmin({ id: "u4", email: "other@example.com" })
    ).resolves.toBe(false);
  });
});
