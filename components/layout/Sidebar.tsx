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
  HandCoins,
  BellRing,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/types/auth";

const menuItems = [
  { label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { label: "Learning", icon: BookOpen, href: "/learning" },
  { label: "Fitness", icon: Dumbbell, href: "/fitness" },
  { label: "Habits", icon: Flame, href: "/habits" },
  { label: "Focus Timer", icon: Timer, href: "/focus" },
  { label: "Money", icon: PiggyBank, href: "/money" },
  { label: "Lending", icon: HandCoins, href: "/lending" },
  { label: "Categories", icon: FolderKanban, href: "/categories" },
  { label: "Reports", icon: LineChart, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Admin", icon: Shield, href: "/admin" },
  { label: "Feedback", icon: BellRing, href: "/admin/feedback" },
];

interface SidebarContentProps {
  loadingUser: boolean;
  pathname: string;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  onNavigate: () => void;
}

function SidebarContent({
  loadingUser,
  pathname,
  user,
  onLogout,
  onNavigate,
}: SidebarContentProps) {
  const getInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <Link
        href="/"
        className="mb-5 flex items-center gap-3"
        onClick={onNavigate}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 text-white shadow-[0_20px_40px_rgba(59,130,246,0.28)]">
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

      <nav
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Navigation menu"
      >
        {menuItems
          .filter((item) => !item.href.startsWith("/admin") || user?.role === "admin")
          .map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin" || pathname === "/admin/users"
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black transition-all ${
                  isActive
                    ? "bg-[linear-gradient(90deg,rgba(14,165,233,0.95),rgba(124,58,237,0.95))] text-white shadow-[0_20px_45px_rgba(59,130,246,0.22)]"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:text-cyan-600 dark:bg-white/[0.04] dark:text-slate-400"
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

      <div className="mt-4 shrink-0 border-t border-slate-200/70 pt-4 dark:border-white/[0.08]">
        {loadingUser ? (
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100/90 dark:bg-white/[0.08]" />
        ) : user ? (
          <>
            <Link
              href="/dashboard"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-[1.6rem] border border-white/60 bg-white/80 p-3 shadow-[0_16px_40px_rgba(148,163,184,0.18)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.05] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
            >
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-lg font-black text-white">
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
                <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Login Streak: {user.loginStreak} days
                </p>
              </div>
            </Link>

            <button
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-red-50 hover:text-red-600 dark:bg-white/[0.06] dark:text-white dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            onClick={onNavigate}
            className="block w-full rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
          >
            Login
          </Link>
        )}
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Activity size={20} />
          </div>
          <span className="font-black dark:text-white">Planify Life</span>
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-white/10 dark:text-white"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      </header>

      <aside className="relative hidden h-dvh w-72 shrink-0 flex-col border-r border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.62))] p-5 shadow-[30px_0_80px_rgba(148,163,184,0.12)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(11,15,28,0.92),rgba(8,12,24,0.86))] dark:shadow-[30px_0_90px_rgba(0,0,0,0.28)] lg:flex">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent dark:via-cyan-300/20" />
        <SidebarContent
          loadingUser={loading}
          pathname={pathname}
          user={user}
          onLogout={logout}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative flex h-dvh w-[min(22rem,88vw)] max-w-sm flex-col border-r border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.8))] p-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(11,15,28,0.96),rgba(8,12,24,0.92))]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-2xl bg-slate-100 p-2 dark:bg-white/10 dark:text-white"
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>

            <SidebarContent
              loadingUser={loading}
              pathname={pathname}
              user={user}
              onLogout={logout}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
