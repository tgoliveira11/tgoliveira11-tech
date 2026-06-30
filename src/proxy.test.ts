import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { secureAuthProxyMock } = vi.hoisted(() => ({
  secureAuthProxyMock: vi.fn(() => new Response("auth", { status: 200 })),
}));

vi.mock("@/lib/auth/secure-auth-proxy", () => ({
  createSecureAuthProxyHandler: vi.fn(() => secureAuthProxyMock),
}));

import { proxy } from "./proxy";

describe("proxy", () => {
  it("redirects legacy root post slugs with 308", async () => {
    const request = new NextRequest("http://localhost:3011/2022-06-01-remote-work");
    const response = await proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3011/blog/2022-06-01-remote-work"
    );
    expect(secureAuthProxyMock).not.toHaveBeenCalled();
  });

  it("delegates to secure-auth proxy for non-legacy paths", async () => {
    const request = new NextRequest("http://localhost:3011/login");
    const response = await proxy(request);

    expect(secureAuthProxyMock).toHaveBeenCalledWith(request);
    expect(response.status).toBe(200);
  });
});

describe("proxy without secure-auth handler", () => {
  it("falls through with NextResponse.next when handler is null", async () => {
    vi.resetModules();
    vi.doMock("@/lib/auth/secure-auth-proxy", () => ({
      createSecureAuthProxyHandler: vi.fn(() => null),
    }));

    const { proxy: proxyWithoutAuth } = await import("./proxy");
    const request = new NextRequest("http://localhost:3011/login");
    const response = await proxyWithoutAuth(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
