"use client";

import * as React from "react";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const themeChangeEvent = "warehouse-theme-change";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      const resolvedTheme = theme === "system" ? getSystemTheme(mediaQuery) : theme;
      document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
      document.documentElement.style.colorScheme = resolvedTheme;
    }

    applyTheme();
    window.localStorage.setItem("warehouse-theme", theme);

    if (theme !== "system") return;

    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside Providers.");
  }

  return context;
}

function getSystemTheme(mediaQuery: MediaQueryList): Exclude<ThemeMode, "system"> {
  return mediaQuery.matches ? "dark" : "light";
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeChangeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeChangeEvent, callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  const storedTheme = window.localStorage.getItem("warehouse-theme");
  return isThemeMode(storedTheme) ? storedTheme : "system";
}

function getServerThemeSnapshot(): ThemeMode {
  return "system";
}

function setTheme(theme: ThemeMode) {
  window.localStorage.setItem("warehouse-theme", theme);
  window.dispatchEvent(new Event(themeChangeEvent));
}
