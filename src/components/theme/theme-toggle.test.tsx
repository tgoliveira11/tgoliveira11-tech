import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog",
}));

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({
    theme: "dark",
    toggleTheme: vi.fn(),
    ready: true,
    canToggleTheme: false,
    setTheme: vi.fn(),
  }),
}));

import { ThemeToggle } from "@/components/theme/theme-toggle";

describe("ThemeToggle", () => {
  it("renders nothing when theme cannot be toggled", () => {
    expect(renderToStaticMarkup(<ThemeToggle compact />)).toBe("");
  });
});
