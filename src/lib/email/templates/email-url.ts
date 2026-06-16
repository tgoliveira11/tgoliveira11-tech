export function buildAuthActionUrl(baseUrl: string, path: string, token: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}?token=${encodeURIComponent(token)}`;
}

export function extractFirstUrl(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/https?:\/\/\S+/);
  return match?.[0];
}
