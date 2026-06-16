import { createHash } from "node:crypto";
import { readAnalyticsStoreRawIp } from "@/lib/env";
import { normalizeReferrer } from "./analytics.helpers";

export type ParsedUserAgent = {
  userAgentFamily: string | null;
  browserName: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceVendor: string | null;
  deviceModel: string | null;
  deviceType: string;
};

export type ExtractedPostViewRequest = {
  referrer: string | null;
  referrerHost: string | null;
  userAgentFamily: string | null;
  browserName: string | null;
  osName: string | null;
  deviceType: string;
  country: string | null;
  region: string | null;
  city: string | null;
  acceptLanguage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ipHash: string | null;
  ipAddress: string | null;
  sessionHash: string;
  requestMetadata: {
    utmTerm: string | null;
    utmContent: string | null;
    browserVersion: string | null;
    osVersion: string | null;
    deviceVendor: string | null;
    deviceModel: string | null;
    userAgent: string | null;
    timezone: string | null;
    path: string | null;
    postSlug: string | null;
    requestHost: string | null;
    requestProtocol: string | null;
    eventSource: string;
  };
};

function readClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || null;
}

export function hashIpAddress(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function buildAnalyticsSessionHash(request: Request): string {
  const ip = readClientIp(request) ?? "anonymous";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return createHash("sha256").update(`${ip}:${userAgent}`).digest("hex").slice(0, 48);
}

function readUtmParam(request: Request, key: string): string | null {
  try {
    const value = new URL(request.url).searchParams.get(key);
    return value?.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      userAgentFamily: null,
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,
      deviceVendor: null,
      deviceModel: null,
      deviceType: "unknown",
    };
  }

  const ua = userAgent;
  const lower = ua.toLowerCase();
  let deviceType = "desktop";
  if (lower.includes("ipad") || (lower.includes("tablet") && !lower.includes("mobile"))) {
    deviceType = "tablet";
  } else if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android")) {
    deviceType = "mobile";
  }

  let browserName: string | null = null;
  let browserVersion: string | null = null;
  const edgeMatch = ua.match(/Edg\/([\d.]+)/);
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
  const firefoxMatch = ua.match(/Firefox\/([\d.]+)/);
  const safariMatch = ua.match(/Version\/([\d.]+).*Safari/);
  if (edgeMatch) {
    browserName = "Edge";
    browserVersion = edgeMatch[1] ?? null;
  } else if (firefoxMatch) {
    browserName = "Firefox";
    browserVersion = firefoxMatch[1] ?? null;
  } else if (safariMatch && !chromeMatch) {
    browserName = "Safari";
    browserVersion = safariMatch[1] ?? null;
  } else if (chromeMatch) {
    browserName = "Chrome";
    browserVersion = chromeMatch[1] ?? null;
  }

  let osName: string | null = null;
  let osVersion: string | null = null;
  const windowsMatch = ua.match(/Windows NT ([\d.]+)/);
  const macMatch = ua.match(/Mac OS X ([\d_]+)/);
  const iosMatch = ua.match(/OS ([\d_]+) like Mac OS X/);
  const androidMatch = ua.match(/Android ([\d.]+)/);
  if (windowsMatch) {
    osName = "Windows";
    osVersion = windowsMatch[1] ?? null;
  } else if (iosMatch) {
    osName = "iOS";
    osVersion = iosMatch[1]?.replace(/_/g, ".") ?? null;
  } else if (androidMatch) {
    osName = "Android";
    osVersion = androidMatch[1] ?? null;
  } else if (macMatch) {
    osName = "macOS";
    osVersion = macMatch[1]?.replace(/_/g, ".") ?? null;
  } else if (lower.includes("linux")) {
    osName = "Linux";
  }

  const userAgentFamily = browserName ?? ua.split(" ")[0] ?? null;

  return {
    userAgentFamily,
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceVendor: null,
    deviceModel: null,
    deviceType,
  };
}

export function extractPostViewRequest(
  request: Request,
  options: { postSlug?: string | null } = {}
): ExtractedPostViewRequest {
  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");
  const parsedUa = parseUserAgent(userAgent);
  const clientIp = readClientIp(request);
  const storeRawIp = readAnalyticsStoreRawIp();

  let requestUrl: URL | null = null;
  try {
    requestUrl = new URL(request.url);
  } catch {
    requestUrl = null;
  }

  return {
    referrer,
    referrerHost: referrer ? normalizeReferrer(referrer) : null,
    userAgentFamily: parsedUa.userAgentFamily,
    browserName: parsedUa.browserName,
    osName: parsedUa.osName,
    deviceType: parsedUa.deviceType,
    country: request.headers.get("x-vercel-ip-country"),
    region: request.headers.get("x-vercel-ip-country-region"),
    city: request.headers.get("x-vercel-ip-city"),
    acceptLanguage: request.headers.get("accept-language"),
    utmSource: readUtmParam(request, "utm_source"),
    utmMedium: readUtmParam(request, "utm_medium"),
    utmCampaign: readUtmParam(request, "utm_campaign"),
    ipHash: clientIp ? hashIpAddress(clientIp) : null,
    ipAddress: storeRawIp && clientIp ? clientIp : null,
    sessionHash: buildAnalyticsSessionHash(request),
    requestMetadata: {
      utmTerm: readUtmParam(request, "utm_term"),
      utmContent: readUtmParam(request, "utm_content"),
      browserVersion: parsedUa.browserVersion,
      osVersion: parsedUa.osVersion,
      deviceVendor: parsedUa.deviceVendor,
      deviceModel: parsedUa.deviceModel,
      userAgent,
      timezone: request.headers.get("x-vercel-ip-timezone"),
      path: requestUrl?.pathname ?? null,
      postSlug: options.postSlug ?? null,
      requestHost: requestUrl?.host ?? request.headers.get("host"),
      requestProtocol: requestUrl?.protocol.replace(":", "") ?? null,
      eventSource: "client",
    },
  };
}
