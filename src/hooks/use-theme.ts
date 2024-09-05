"use client";

import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(
    typeof window === "undefined" ? "light" : window.__theme || "light"
  );

  const toggleTheme = useCallback(() => {
    window?.__setPreferredTheme(theme === "light" ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    window.__onThemeChange = setTheme;
  }, []);

  return { theme, toggleTheme };
}