const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google",
  "kubernetes.default.svc",
]);

const PRIVATE_IPV4_RANGES: Array<[number, number, number, number]> = [
  [10, 0, 0, 0],
  [127, 0, 0, 0],
  [0, 0, 0, 0],
  [169, 254, 0, 0],
  [172, 16, 0, 0],
  [192, 168, 0, 0],
];

export class UrlFetchSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlFetchSecurityError";
  }
}

export function assertSafeImportUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new UrlFetchSecurityError("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UrlFetchSecurityError("Only http and https URLs are allowed");
  }

  if (parsed.username || parsed.password) {
    throw new UrlFetchSecurityError("URLs with credentials are not allowed");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new UrlFetchSecurityError("This URL is not allowed for security reasons");
  }

  if (isPrivateOrLocalHost(hostname)) {
    throw new UrlFetchSecurityError("Private or local network URLs are not allowed");
  }

  return parsed;
}

function isPrivateOrLocalHost(hostname: string): boolean {
  if (hostname === "::1" || hostname === "0:0:0:0:0:0:0:1") {
    return true;
  }

  if (hostname.startsWith("fe80:") || hostname.startsWith("fc") || hostname.startsWith("fd")) {
    return true;
  }

  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!ipv4Match) {
    return false;
  }

  const octets = ipv4Match.slice(1).map(Number);
  if (octets.some((value) => value > 255)) {
    return true;
  }

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  for (const [startA, startB] of PRIVATE_IPV4_RANGES) {
    if (a === startA && b === startB) {
      return true;
    }
  }

  return false;
}

export type SafeFetchOptions = {
  url: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  allowedContentTypes?: RegExp;
};

export type SafeFetchResult = {
  finalUrl: string;
  contentType: string;
  body: Buffer;
};

export async function safeFetchBinary(options: SafeFetchOptions): Promise<SafeFetchResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const maxBytes = options.maxBytes ?? 2_000_000;
  const maxRedirects = options.maxRedirects ?? 5;
  const allowedContentTypes = options.allowedContentTypes ?? /.*/i;

  let currentUrl = assertSafeImportUrl(options.url).toString();
  let redirectCount = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "*/*",
          "User-Agent": "PostForge-URL-Importer/1.0",
        },
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out while fetching URL");
      }
      throw new Error("Could not fetch URL");
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirectCount >= maxRedirects) {
        throw new Error("Too many redirects while fetching URL");
      }
      const nextUrl = new URL(location, currentUrl).toString();
      currentUrl = assertSafeImportUrl(nextUrl).toString();
      redirectCount += 1;
      continue;
    }

    if (!response.ok) {
      throw new Error(`Could not fetch URL (HTTP ${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    if (!allowedContentTypes.test(contentType)) {
      throw new Error("Unexpected content type for URL");
    }

    const body = await readResponseBodyWithLimit(response, maxBytes);
    return {
      finalUrl: currentUrl,
      contentType,
      body,
    };
  }
}

export async function safeFetchHtml(options: Omit<SafeFetchOptions, "allowedContentTypes">) {
  return safeFetchBinary({
    ...options,
    allowedContentTypes: /text\/html|application\/xhtml\+xml|application\/xml/i,
  });
}

async function readResponseBodyWithLimit(response: Response, maxBytes: number): Promise<Buffer> {
  if (!response.body) {
    return Buffer.from([]);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      throw new Error("Response exceeds maximum allowed size");
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}
