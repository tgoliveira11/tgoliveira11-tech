import { describe, expect, it } from "vitest";
import { calculateReadingTimeMinutes } from "@/modules/posts/reading-time";

describe("reading time", () => {
  it("returns at least one minute", () => {
    expect(calculateReadingTimeMinutes("")).toBe(1);
  });

  it("estimates based on word count", () => {
    const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
    expect(calculateReadingTimeMinutes(words)).toBe(2);
  });

  it("ignores fenced code blocks for word count", () => {
    const markdown = "```js\nconst value = 1;\n```\n\nshort text";
    expect(calculateReadingTimeMinutes(markdown)).toBe(1);
  });
});
