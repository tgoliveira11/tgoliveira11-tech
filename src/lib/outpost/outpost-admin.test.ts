import { beforeEach, describe, expect, it, vi } from "vitest";

const { createOutpostAdminMock } = vi.hoisted(() => ({
  createOutpostAdminMock: vi.fn(() => ({ routes: {} })),
}));

vi.mock("@tgoliveira/outpost/admin", () => ({
  createOutpostAdmin: createOutpostAdminMock,
}));

vi.mock("@/lib/outpost/outpost", () => ({
  getOutpost: vi.fn(() => ({ name: "outpost" })),
  getOutpostConfigOverrideRepository: vi.fn(() => ({ name: "config-repo" })),
}));

vi.mock("@/lib/outpost/require-outpost-admin", () => ({
  requireOutpostAdmin: vi.fn(),
}));

describe("getOutpostAdmin", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("creates a singleton admin instance with enabled admin config", async () => {
    const { getOutpost } = await import("@/lib/outpost/outpost");
    const { getOutpostConfigOverrideRepository } = await import("@/lib/outpost/outpost");
    const { requireOutpostAdmin } = await import("@/lib/outpost/require-outpost-admin");
    const { getOutpostAdmin } = await import("./outpost-admin");

    const first = getOutpostAdmin();
    const second = getOutpostAdmin();

    expect(first).toBe(second);
    expect(createOutpostAdminMock).toHaveBeenCalledTimes(1);
    expect(createOutpostAdminMock).toHaveBeenCalledWith({
      outpost: getOutpost(),
      requireAdmin: requireOutpostAdmin,
      configOverrideRepository: getOutpostConfigOverrideRepository(),
      env: process.env,
      admin: { enabled: true },
    });
  });
});
