import { describe, expect, it } from "vitest";
import { formatBytesHuman } from "@/lib/format-bytes";

describe("formatBytesHuman", () => {
  it("formats bytes, kilobytes, and megabytes", () => {
    expect(formatBytesHuman(512)).toBe("512 B");
    expect(formatBytesHuman(1024)).toBe("1 KB");
    expect(formatBytesHuman(1536)).toBe("1.5 KB");
    expect(formatBytesHuman(1024 * 1024)).toBe("1 MB");
    expect(formatBytesHuman(1024 * 1024 * 1.5)).toBe("1.5 MB");
  });
});
