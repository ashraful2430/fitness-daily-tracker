"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  Dumbbell,
  Flame,
  FolderKanban,
  LineChart,
  LogOut,
  Menu,
  PiggyBank,
  Settings,
  Shield,
  Timer,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";

type User = {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
};

const menuItems = [
  { label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { label: "Learning", icon: BookOpen, href: "/learning" },
  { label: "Fitness", icon: Dumbbell, href: "/fitness" },
  { label: "Habits", icon: Flame, href: "/habits" },
  { label: "Focus Timer", icon: Timer, href: "/focus" },
  { label: "Money", icon: PiggyBank, href: "/money" },
  { label: "Categories", icon: FolderKanban, href: "/categories" },
  { label: "Reports", icon: LineChart, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Admin", icon: Shield, href: "/admin" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );
        const data = await res.json();

        if (res.ok && data.user) setUser(data.user);
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    getUser();
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/auth"; // Redirect to login page after logout
  };

  const getInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const SidebarContent = () => (
    <>
      <Link href="/" className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
          <Activity size={22} />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-black text-slate-950 dark:text-white">
            Planify Life
          </h1>
          <p className="truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
            Personal tracking system
          </p>
        </div>
      </Link>

      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menuItems
          .filter((item) => item.href !== "/admin" || user?.role === "admin")
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:text-indigo-600 dark:bg-white/5 dark:text-slate-400"
                  }`}
                >
                  <Icon size={17} />
                </span>
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-4 shrink-0">
        <ThemeToggle />
      </div>

      <div className="mt-4 shrink-0 border-t border-slate-200 pt-4 dark:border-white/10">
        {loadingUser ? (
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />
        ) : user ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-3 dark:border-white/10 dark:bg-white/10"
            >
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-lg font-black text-white">
                  {getInitial}
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-red-50 hover:text-red-600 dark:bg-white/10 dark:text-white dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="block w-full rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
          >
            Login
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Activity size={20} />
          </div>
          <span className="font-black dark:text-white">Planify Life</span>
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-white/10 dark:text-white"
        >
          <Menu size={22} />
        </button>
      </header>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#070B18] lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative flex h-full w-[85%] max-w-sm flex-col bg-white p-5 dark:bg-[#070B18]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-2xl bg-slate-100 p-2 dark:bg-white/10 dark:text-white"
            >
              <X size={20} />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
