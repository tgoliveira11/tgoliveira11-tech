"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme, ready, canToggleTheme } = useTheme();

  if (!canToggleTheme) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
        compact ? "h-9 w-9" : "px-3 py-2 text-sm"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      disabled={!ready}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
