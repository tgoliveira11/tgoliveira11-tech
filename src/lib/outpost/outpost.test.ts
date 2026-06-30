import { beforeEach, describe, expect, it, vi } from "vitest";

const { createOutpostMock, DrizzleOutboxRepositoryMock } = vi.hoisted(() => ({
  createOutpostMock: vi.fn(() => ({ name: "outpost" })),
  DrizzleOutboxRepositoryMock: vi.fn(),
}));

vi.mock("@tgoliveira/outpost", () => ({
  createOutpost: createOutpostMock,
}));

vi.mock("@tgoliveira/outpost/drizzle", () => ({
  DrizzleOutboxRepository: DrizzleOutboxRepositoryMock,
  DrizzleSuppressionRepository: vi.fn(),
  DrizzleAuditRepository: vi.fn(),
  DrizzleApiKeyRepository: vi.fn(),
  DrizzleWebhookEventRepository: vi.fn(),
  DrizzleConfigOverrideRepository: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: { query: {} },
}));

vi.mock("@/lib/outpost/outpost-from-env", () => ({
  buildOutpostClientOptions: vi.fn(() => ({ providers: [], encryption: { mode: "none" } })),
}));

describe("getOutpost", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("creates a singleton outpost instance with drizzle repositories", async () => {
    const { getOutpost } = await import("./outpost");

    const first = getOutpost();
    const second = getOutpost();

    expect(first).toBe(second);
    expect(createOutpostMock).toHaveBeenCalledTimes(1);
    expect(DrizzleOutboxRepositoryMock).toHaveBeenCalledTimes(1);
  });
});

describe("getOutpostConfigOverrideRepository", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns a singleton config override repository", async () => {
    const { getOutpostConfigOverrideRepository } = await import("./outpost");

    const first = getOutpostConfigOverrideRepository();
    const second = getOutpostConfigOverrideRepository();

    expect(first).toBe(second);
  });
});
