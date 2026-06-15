export function normalizeUrlPath(input: string): string {
  let value = input.trim().replace(/\\/g, "/");
  if (!value.startsWith("/")) {
    value = `/${value}`;
  }
  if (value.length > 1 && value.endsWith("/")) {
    value = value.slice(0, -1);
  }
  return value;
}
