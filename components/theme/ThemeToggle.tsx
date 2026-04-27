"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

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
      className="relative flex h-12 w-full items-center rounded-2xl bg-slate-100 p-1 dark:bg-white/10"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-1 h-10 w-[calc(50%-4px)] rounded-xl bg-white shadow-md transition-all dark:bg-indigo-600 ${
          darkMode ? "left-[50%]" : "left-1"
        }`}
      />

      <span
        className={`relative z-10 flex w-1/2 items-center justify-center gap-2 text-sm font-black ${
          darkMode ? "text-slate-400" : "text-slate-950"
        }`}
      >
        <Sun size={16} />
        Light
      </span>

      <span
        className={`relative z-10 flex w-1/2 items-center justify-center gap-2 text-sm font-black ${
          darkMode ? "text-white" : "text-slate-500"
        }`}
      >
        <Moon size={16} />
        Dark
      </span>
    </button>
  );
}
