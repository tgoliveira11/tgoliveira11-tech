import { describe, expect, it } from "vitest";
import { getSecurityHeaders } from "./http-security-headers";

describe("getSecurityHeaders", () => {
  it("includes baseline hardening headers", () => {
    const headers = getSecurityHeaders({ includeHsts: false });
    const keys = headers.map((header) => header.key);

    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("Permissions-Policy");
    expect(keys).toContain("X-Frame-Options");
  });

  it("adds HSTS only when enabled", () => {
    expect(getSecurityHeaders({ includeHsts: false }).some((h) => h.key === "Strict-Transport-Security")).toBe(
      false
    );
    expect(getSecurityHeaders({ includeHsts: true }).some((h) => h.key === "Strict-Transport-Security")).toBe(
      true
    );
  });
});
