"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme ? savedTheme === "dark" : prefersDark;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);

    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-11 w-20 items-center rounded-2xl bg-slate-100 p-1 dark:bg-white/10"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`absolute top-1 h-9 w-[calc(50%-4px)] rounded-xl bg-white shadow-md transition-all dark:bg-indigo-600 ${
          darkMode ? "left-[50%]" : "left-1"
        }`}
      />

      <span
        className={`relative z-10 flex w-1/2 items-center justify-center ${
          darkMode ? "text-slate-400" : "text-slate-950"
        }`}
      >
        <Sun size={16} />
      </span>

      <span
        className={`relative z-10 flex w-1/2 items-center justify-center ${
          darkMode ? "text-white" : "text-slate-500"
        }`}
      >
        <Moon size={16} />
      </span>
    </button>
  );
}
