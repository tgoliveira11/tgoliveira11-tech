import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { THEME_STORAGE_KEY, getStoredTheme, isTheme, persistTheme } from "@/lib/theme";

describe("theme persistence", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates theme values", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
  });

  it("persists and restores the selected theme", () => {
    persistTheme("dark");
    expect(store.get(THEME_STORAGE_KEY)).toBe("dark");
    expect(getStoredTheme()).toBe("dark");

    persistTheme("light");
    expect(getStoredTheme()).toBe("light");
  });
});
