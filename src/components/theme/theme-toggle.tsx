"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme, ready } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-subtle)]"
      suppressHydrationWarning
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {!ready ? "🌙" : isDark ? "☀️" : "🌙"}
      </span>
      {compact ? null : (
        <span suppressHydrationWarning>{!ready ? "Dark" : isDark ? "Light" : "Dark"}</span>
      )}
    </button>
  );
}
