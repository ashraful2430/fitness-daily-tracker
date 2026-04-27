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
  PiggyBank,
  Settings,
  Shield,
  Timer,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    getUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/auth";
  };

  const getInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:flex lg:flex-col">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
          <Activity size={22} />
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-950">Planify Life</h1>
          <p className="text-sm font-medium text-slate-500">
            Personal tracking system
          </p>
        </div>
      </Link>

      <nav className="space-y-2 overflow-y-auto pr-1">
        {menuItems
          .filter((item) => item.href !== "/admin" || user?.role === "admin")
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-5">
        {loadingUser ? (
          <div className="animate-pulse rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-3 w-32 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
                {getInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">
                  {user.name}
                </p>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {user.email}
                </p>

                <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black capitalize text-indigo-600">
                  {user.role || "user"}
                </span>
              </div>
            </Link>
          </div>
        ) : (
          <Link
            href="/auth"
            className="block w-full rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-200"
          >
            Login
          </Link>
        )}

        {user && !loadingUser && (
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
