import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAdminEmail } from "@/modules/admin/is-admin-email";

describe("admin authorization", () => {
  const original = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@postforge.test";
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = original;
  });

  it("matches configured admin email case-insensitively", () => {
    expect(isAdminEmail("admin@postforge.test")).toBe(true);
    expect(isAdminEmail("Admin@PostForge.Test")).toBe(true);
  });

  it("rejects non-admin emails", () => {
    expect(isAdminEmail("other@postforge.test")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("rejects all emails when ADMIN_EMAIL is unset", () => {
    delete process.env.ADMIN_EMAIL;
    expect(isAdminEmail("admin@postforge.test")).toBe(false);
  });
});
