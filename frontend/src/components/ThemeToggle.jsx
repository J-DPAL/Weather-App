import React from "react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`inline-flex items-center gap-2 rounded-xl bg-white/10 dark:bg-slate-700/60 hover:bg-white/20 dark:hover:bg-slate-600/60 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 shadow border border-white/20 dark:border-slate-600 transition-colors ${className}`}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
