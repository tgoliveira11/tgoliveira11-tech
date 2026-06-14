"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const stored = getStoredTheme() ?? "light";
    initialized.current = true;
    setThemeState(stored);
    applyTheme(stored);
    setReady(true);

    function onStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY || !event.newValue) {
        return;
      }
      if (event.newValue === "light" || event.newValue === "dark") {
        setThemeState(event.newValue);
        applyTheme(event.newValue);
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      return;
    }
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      ready,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme, ready]
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
