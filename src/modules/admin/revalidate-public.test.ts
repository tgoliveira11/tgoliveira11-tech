import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePathMock } = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { revalidatePublicPaths } from "./revalidate-public";

describe("revalidatePublicPaths", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
  });

  it("revalidates core public routes", () => {
    revalidatePublicPaths();

    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/blog");
    expect(revalidatePathMock).toHaveBeenCalledWith("/tags");
    expect(revalidatePathMock).toHaveBeenCalledWith("/categories");
    expect(revalidatePathMock).toHaveBeenCalledWith("/search");
    expect(revalidatePathMock).toHaveBeenCalledWith("/rss.xml");
    expect(revalidatePathMock).toHaveBeenCalledWith("/sitemap.xml");
    expect(revalidatePathMock).toHaveBeenCalledTimes(7);
  });

  it("also revalidates the post path when slug is provided", () => {
    revalidatePublicPaths("hello-world");

    expect(revalidatePathMock).toHaveBeenCalledWith("/blog/hello-world");
    expect(revalidatePathMock).toHaveBeenCalledTimes(8);
  });
});
