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

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        }
      } catch {
        setUser(null);
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

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:flex lg:flex-col">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <Activity size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold">Planify Life</h1>
          <p className="text-sm text-slate-500">Personal tracking system</p>
        </div>
      </Link>

      <nav className="space-y-2 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-5">
        {user ? (
          <Link
            href="/dashboard"
            className="mb-3 flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-indigo-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
              <UserCircle size={28} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                {user.email}
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/auth"
            className="mb-3 block w-full rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
          >
            Login
          </Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
