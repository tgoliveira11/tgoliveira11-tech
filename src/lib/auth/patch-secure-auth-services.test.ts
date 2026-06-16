import { describe, expect, it, vi } from "vitest";
import type { SecureAuthServices } from "@tgoliveira/secure-auth";
import {
  createSecureAuthServicesPatcher,
  patchSecureAuthServices,
} from "@/lib/auth/patch-secure-auth-services";

describe("patchSecureAuthServices", () => {
  it("augments getAuthOptions once for the shared services instance", () => {
    const baseOptions = {
      secret: "secret",
      providers: [],
      cookies: {
        sessionToken: { name: "next-auth.session-token", options: {} },
      },
    };

    const getAuthOptionsMock = vi.fn(() => baseOptions);

    const services = {
      config: {
        app: { slug: "tgoliveira11-tech", name: "Test", baseUrl: "http://localhost:3011" },
        server: { cookieSecure: false },
      },
      getAuthOptions: getAuthOptionsMock,
    } as unknown as SecureAuthServices;

    patchSecureAuthServices(services);
    patchSecureAuthServices(services);

    const augmented = services.getAuthOptions();
    expect(augmented.cookies?.sessionToken.name).toBe(
      "tgoliveira11-tech.next-auth.session-token"
    );
    expect(getAuthOptionsMock).toHaveBeenCalledTimes(1);
  });

  it("wraps route handlers so services are patched before handling requests", async () => {
    const baseOptions = {
      secret: "secret",
      providers: [],
    };

    const services = {
      config: {
        app: { slug: "tgoliveira11-tech", name: "Test", baseUrl: "http://localhost:3011" },
        server: { cookieSecure: false },
      },
      getAuthOptions: vi.fn(() => baseOptions),
    } as unknown as SecureAuthServices;

    const getServices = vi.fn(async () => services);
    const { wrapRoutes } = createSecureAuthServicesPatcher(getServices);

    const handler = vi.fn(async () => new Response("ok"));
    const wrapped = wrapRoutes({ sessionsList: { GET: handler } });

    await wrapped.sessionsList.GET(new Request("https://example.com/api/account/sessions"));

    expect(getServices).toHaveBeenCalledTimes(1);
    expect(services.getAuthOptions().cookies?.sessionToken.name).toBe(
      "tgoliveira11-tech.next-auth.session-token"
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
