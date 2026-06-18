import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("secure-auth 0.1.20 consumer integration", () => {
  it("passes uiConfig into SecureAuthUIProvider from root layout", () => {
    const layoutSource = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");
    const providersSource = readFileSync(resolve(process.cwd(), "src/components/providers.tsx"), "utf8");

    expect(layoutSource).toContain("secureAuth.uiConfig");
    expect(providersSource).toContain("SecureAuthUIProvider");
    expect(providersSource).toContain("config={uiConfig}");
  });

  it("wires optional proxy middleware for guest auth redirects", () => {
    const proxySource = readFileSync(resolve(process.cwd(), "src/proxy.ts"), "utf8");

    expect(proxySource).toContain("createSecureAuthProxyHandler");
    expect(proxySource).toContain("/login");
    expect(proxySource).toContain("/register");
    expect(proxySource).toContain("/forgot-password");
  });
});
