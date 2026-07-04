"use client";

import { Moon, Sun } from "lucide-react";
import { useAppTheme } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useAppTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
    </Button>
  );
}
