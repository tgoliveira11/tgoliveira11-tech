import { describe, expect, it } from "vitest";
import {
  assertSafeImportUrl,
  safeFetchBinary,
  UrlFetchSecurityError,
} from "@/modules/import/url-fetch";

describe("url fetch security", () => {
  it("rejects file URLs", () => {
    expect(() => assertSafeImportUrl("file:///etc/passwd")).toThrow(UrlFetchSecurityError);
  });

  it("rejects localhost and loopback", () => {
    expect(() => assertSafeImportUrl("http://localhost/post")).toThrow(UrlFetchSecurityError);
    expect(() => assertSafeImportUrl("http://127.0.0.1/post")).toThrow(UrlFetchSecurityError);
    expect(() => assertSafeImportUrl("http://0.0.0.0/post")).toThrow(UrlFetchSecurityError);
  });

  it("rejects private IP ranges", () => {
    expect(() => assertSafeImportUrl("http://192.168.1.10/post")).toThrow(UrlFetchSecurityError);
    expect(() => assertSafeImportUrl("http://10.0.0.5/post")).toThrow(UrlFetchSecurityError);
    expect(() => assertSafeImportUrl("http://172.16.0.2/post")).toThrow(UrlFetchSecurityError);
  });

  it("rejects URLs with credentials", () => {
    expect(() => assertSafeImportUrl("https://user:pass@example.com/post")).toThrow(
      UrlFetchSecurityError
    );
  });

  it("allows public https URLs", () => {
    const parsed = assertSafeImportUrl("https://www.example.com/post");
    expect(parsed.hostname).toBe("www.example.com");
  });

  it("enforces response size limit", async () => {
    const fetchImpl = async () =>
      new Response("x".repeat(20), {
        status: 200,
        headers: { "content-type": "text/html" },
      });

    await expect(
      safeFetchBinary({
        url: "https://example.com/post",
        fetchImpl,
        maxBytes: 10,
        allowedContentTypes: /text\/html/i,
      })
    ).rejects.toThrow("Response exceeds maximum allowed size");
  });
});
