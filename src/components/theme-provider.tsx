"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "~/lib/theme-init-script";

type ThemeSetting = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeSetting) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(setting: ThemeSetting): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  if (setting === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return setting;
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function readStoredTheme(): ThemeSetting {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // ignore
  }
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(readStoredTheme()));

  useEffect(() => {
    applyResolvedTheme(resolveTheme(readStoredTheme()));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (readStoredTheme() !== "system") return;
      const next = resolveTheme("system");
      setResolvedTheme(next);
      applyResolvedTheme(next);
    };

    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const setTheme = useCallback((next: ThemeSetting) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  const value = useMemo(
    () => ({
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
