"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ForcedPublicTheme } from "@/lib/env";
import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  ready: boolean;
  canToggleTheme: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPublicPath(pathname: string): boolean {
  return !pathname.startsWith("/admin");
}

export function ThemeProvider({
  children,
  forcedPublicTheme = null,
}: {
  children: React.ReactNode;
  forcedPublicTheme?: ForcedPublicTheme | null;
}) {
  const pathname = usePathname();
  const isPublicRoute = isPublicPath(pathname);
  const effectiveForcedTheme = isPublicRoute ? forcedPublicTheme : null;
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const initialTheme = effectiveForcedTheme ?? getStoredTheme() ?? "light";
    initialized.current = true;
    applyTheme(initialTheme);
    queueMicrotask(() => {
      setThemeState(initialTheme);
      setReady(true);
    });

    function onStorage(event: StorageEvent) {
      if (effectiveForcedTheme || event.key !== THEME_STORAGE_KEY || !event.newValue) {
        return;
      }
      if (event.newValue === "light" || event.newValue === "dark") {
        setThemeState(event.newValue);
        applyTheme(event.newValue);
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [effectiveForcedTheme]);

  useEffect(() => {
    if (!initialized.current) {
      return;
    }

    if (effectiveForcedTheme) {
      applyTheme(effectiveForcedTheme);
      return;
    }

    applyTheme(theme);
    persistTheme(theme);
  }, [theme, effectiveForcedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: effectiveForcedTheme ?? theme,
      ready,
      canToggleTheme: !effectiveForcedTheme,
      setTheme: (nextTheme) => {
        if (effectiveForcedTheme) {
          return;
        }
        setThemeState(nextTheme);
      },
      toggleTheme: () => {
        if (effectiveForcedTheme) {
          return;
        }
        setThemeState((current) => (current === "light" ? "dark" : "light"));
      },
    }),
    [theme, ready, effectiveForcedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
