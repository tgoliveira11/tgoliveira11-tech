import { afterEach, describe, expect, it, vi } from "vitest";

const { createSecureAuthMiddlewareMock } = vi.hoisted(() => ({
  createSecureAuthMiddlewareMock: vi.fn(() => vi.fn()),
}));

vi.mock("@tgoliveira/secure-auth/next/middleware", () => ({
  buildMiddlewareConfigFromUi: vi.fn(() => ({})),
  buildPublicUIConfig: vi.fn(() => ({})),
  createSecureAuthMiddleware: createSecureAuthMiddlewareMock,
}));

import { createSecureAuthProxyHandler } from "./secure-auth-proxy";

describe("createSecureAuthProxyHandler", () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalSecret;
    vi.clearAllMocks();
  });

  it("returns null when NEXTAUTH_SECRET is missing", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(createSecureAuthProxyHandler()).toBeNull();
  });

  it("returns null when NEXTAUTH_SECRET is blank", () => {
    process.env.NEXTAUTH_SECRET = "   ";
    expect(createSecureAuthProxyHandler()).toBeNull();
  });

  it("returns middleware handler when NEXTAUTH_SECRET is set", () => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    const handler = createSecureAuthProxyHandler();
    expect(handler).toBeTypeOf("function");
    expect(createSecureAuthMiddlewareMock).toHaveBeenCalledTimes(1);
  });
});
