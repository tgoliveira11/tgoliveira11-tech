import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();

vi.mock("@/db/get-db", () => ({
  db: {
    select: (...args: unknown[]) => selectMock(...args),
  },
}));

import { getBlogConfig, getBlogSetting } from "./blog-config";

describe("blog config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReturnValue({
      from: vi.fn(() => Promise.resolve([])),
    });
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses defaults when database and env are empty", async () => {
    const config = await getBlogConfig();
    expect(config.title).toBe("PostForge");
    expect(config.postsPerPage).toBe(12);
    expect(config.rssEnabled).toBe(true);
    expect(config.analyticsEnabled).toBe(true);
  });

  it("merges database overrides and env fallbacks", async () => {
    selectMock.mockReturnValueOnce({
      from: vi.fn(() =>
        Promise.resolve([
          { key: "blogTitle", value: "Custom Blog" },
          { key: "postsPerPage", value: "0" },
          { key: "rssEnabled", value: "false" },
        ])
      ),
    });
    process.env.APP_BASE_URL = "https://example.com";

    const config = await getBlogConfig();
    expect(config.title).toBe("Custom Blog");
    expect(config.baseUrl).toBe("https://example.com");
    expect(config.postsPerPage).toBe(12);
    expect(config.rssEnabled).toBe(false);
  });

  it("reads individual blog settings", async () => {
    selectMock.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ key: "blogTitle", value: "Custom Blog" }])),
        })),
      })),
    });

    await expect(getBlogSetting("blogTitle")).resolves.toBe("Custom Blog");
  });
});
