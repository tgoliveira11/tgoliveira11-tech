import { describe, expect, it } from "vitest";
import { sanitizeRecentVisitForDisplay } from "@/modules/analytics/analytics.display";

describe("analytics display privacy", () => {
  it("hides raw IP by default", () => {
    const row = sanitizeRecentVisitForDisplay(
      {
        occurredAt: new Date("2026-06-14T12:00:00.000Z"),
        ipAddress: "203.0.113.10",
        ipHash: "hash-value",
      },
      false
    );

    expect(row.ipAddress).toBeNull();
    expect(row.ipHash).toBe("hash-value");
  });

  it("shows raw IP only when explicitly enabled", () => {
    const row = sanitizeRecentVisitForDisplay(
      {
        occurredAt: new Date("2026-06-14T12:00:00.000Z"),
        ipAddress: "203.0.113.10",
        ipHash: "hash-value",
      },
      true
    );

    expect(row.ipAddress).toBe("203.0.113.10");
  });
});
