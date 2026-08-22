"use client";
import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeWrapper({ children }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply data-theme attribute to <html> element
    // This is what activates [data-theme="light"] CSS vars
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Also set immediately on mount to prevent flash
  useEffect(() => {
    const saved = localStorage.getItem("cinephiles-theme");
    const parsed = saved ? JSON.parse(saved) : null;
    const savedTheme = parsed?.state?.theme ?? "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return <>{children}</>;
}
