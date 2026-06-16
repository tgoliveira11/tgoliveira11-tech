import { describe, expect, it } from "vitest";
import * as route from "@/app/api/assets/[...path]/route";

describe("assets route security", () => {
  it("rejects path traversal attempts (404)", async () => {
    const request = new Request("http://localhost/api/assets");
    const context = {
      params: Promise.resolve({ path: ["..", "secret.txt"] }),
    } as unknown as { params: Promise<{ path: string[] }> };

    const response = await route.GET(request, context);
    expect(response.status).toBe(404);
  });
});

