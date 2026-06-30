import { describe, expect, it } from "vitest";
import {
  readBooleanEnv,
  readCsvEnv,
  readEnumEnv,
  readEnv,
  readFirstEnv,
  readNumberEnv,
  readOAuthPair,
} from "./parse";

describe("env parse helpers", () => {
  it("reads trimmed env values and ignores blanks", () => {
    expect(readEnv({ FOO: "  bar  " }, "FOO")).toBe("bar");
    expect(readEnv({ FOO: "   " }, "FOO")).toBeUndefined();
    expect(readEnv({}, "FOO")).toBeUndefined();
  });

  it("reads first defined env key", () => {
    expect(readFirstEnv({ A: "", B: "value" }, ["A", "B"])).toBe("value");
    expect(readFirstEnv({}, ["A", "B"])).toBeUndefined();
  });

  it("parses booleans with defaults and validation", () => {
    expect(readBooleanEnv({}, ["FLAG"], true)).toBe(true);
    expect(readBooleanEnv({ FLAG: "true" }, ["FLAG"], false)).toBe(true);
    expect(readBooleanEnv({ FLAG: "false" }, ["FLAG"], true)).toBe(false);
    expect(() => readBooleanEnv({ FLAG: "maybe" }, ["FLAG"], true)).toThrow(/Invalid boolean/);
  });

  it("parses numbers with bounds and defaults", () => {
    expect(readNumberEnv({}, ["N"], 5)).toBe(5);
    expect(readNumberEnv({ N: "10" }, ["N"], 5)).toBe(10);
    expect(() => readNumberEnv({ N: "bad" }, ["N"], 5)).toThrow(/Invalid numeric/);
    expect(readNumberEnv({ N: "1" }, ["N"], 5, { min: 3 })).toBe(5);
    expect(readNumberEnv({ N: "100" }, ["N"], 5, { max: 50 })).toBe(5);
  });

  it("parses enums and oauth pairs", () => {
    expect(readEnumEnv({}, ["MODE"], ["a", "b"] as const, "a")).toBe("a");
    expect(readEnumEnv({ MODE: "b" }, ["MODE"], ["a", "b"] as const, "a")).toBe("b");
    expect(readEnumEnv({ MODE: "c" }, ["MODE"], ["a", "b"] as const, "a")).toBe("a");

    expect(
      readOAuthPair({ ID: "id", SECRET: "secret" }, ["ID"], ["SECRET"])
    ).toEqual({ clientId: "id", clientSecret: "secret" });
    expect(readOAuthPair({ ID: "id" }, ["ID"], ["SECRET"])).toBeUndefined();
  });

  it("parses csv env values", () => {
    expect(readCsvEnv({}, "TAGS")).toEqual([]);
    expect(readCsvEnv({ TAGS: "a, b , ,c" }, "TAGS")).toEqual(["a", "b", "c"]);
  });
});
