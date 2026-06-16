import { describe, expect, it } from "vitest";
import { extractPostViewRequest, hashIpAddress, parseUserAgent } from "@/modules/analytics/analytics.request";

describe("analytics request extraction", () => {
  it("hashes IP addresses and omits raw IP by default", () => {
    const request = new Request("https://example.com/blog/post?utm_source=newsletter", {
      headers: {
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        referer: "https://google.com/search?q=postforge",
        "x-vercel-ip-country": "US",
        "x-vercel-ip-country-region": "CA",
        "x-vercel-ip-city": "San Francisco",
        "accept-language": "en-US,en;q=0.9",
      },
    });

    const extracted = extractPostViewRequest(request, { postSlug: "hello-world" });

    expect(extracted.ipHash).toBe(hashIpAddress("203.0.113.10"));
    expect(extracted.ipAddress).toBeNull();
    expect(extracted.referrerHost).toBe("google.com");
    expect(extracted.utmSource).toBe("newsletter");
    expect(extracted.country).toBe("US");
    expect(extracted.region).toBe("CA");
    expect(extracted.city).toBe("San Francisco");
    expect(extracted.browserName).toBe("Chrome");
    expect(extracted.osName).toBe("macOS");
    expect(extracted.requestMetadata.postSlug).toBe("hello-world");
    expect(extracted.requestMetadata.eventSource).toBe("client");
  });

  it("stores raw IP only when env enables it", () => {
    process.env.ANALYTICS_STORE_RAW_IP = "true";
    const request = new Request("https://example.com/blog/post", {
      headers: {
        "x-real-ip": "198.51.100.20",
        "user-agent": "Mozilla/5.0",
      },
    });

    const extracted = extractPostViewRequest(request);
    expect(extracted.ipAddress).toBe("198.51.100.20");
    delete process.env.ANALYTICS_STORE_RAW_IP;
  });

  it("handles missing headers safely", () => {
    const extracted = extractPostViewRequest(new Request("https://example.com/blog/post"));
    expect(extracted.referrerHost).toBeNull();
    expect(extracted.utmSource).toBeNull();
    expect(extracted.country).toBeNull();
    expect(extracted.deviceType).toBe("unknown");
  });
});

describe("parseUserAgent", () => {
  it("detects mobile devices", () => {
    const parsed = parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
    expect(parsed.deviceType).toBe("mobile");
    expect(parsed.osName).toBe("iOS");
  });
});
