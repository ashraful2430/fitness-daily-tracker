"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Activity,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";

type Mode = "login" | "register";

export default function AuthForm() {
  const { login, register } = useAuth();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const blockedReason = searchParams.get("reason");

  const handleSubmit = async () => {
    if (!email || !password || (mode === "register" && !name)) {
      toast.error("Fill the blanks first, baby. No shortcuts 😏");
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }

      window.location.href = "/dashboard";
      return;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          setAuthError(error.message);
        } else {
          toast.error(`${error.message} Try again sharper 😈`);
        }
      } else {
        toast.error("Connection said no. Run it back in a second 😈");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F7FB] px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-10">
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-600/20" />
      <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl dark:bg-fuchsia-600/20" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black">Planify Life</h1>
            <p className="hidden text-xs font-semibold text-slate-500 dark:text-slate-400 sm:block">
              Personal tracking system
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/"
            className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-lg shadow-slate-200 transition hover:scale-105 dark:bg-white/10 dark:text-white dark:shadow-none sm:flex"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="hidden lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
            <Sparkles size={16} />
            Track your life with clarity
          </div>

          <h2 className="max-w-3xl text-6xl font-black leading-[1.05] tracking-tight">
            Your daily progress deserves a better system.
          </h2>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
            Manage learning, habits, fitness, focus time, and money from one
            clean dashboard built for students, workers, and lifelong learners.
          </p>

          <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              ["Learning", "Track study time"],
              ["Health", "Build routines"],
              ["Money", "Control spending"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-none"
              >
                <p className="text-lg font-black">{title}</p>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-300/70 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-none sm:p-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 sm:hidden"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-300">
                {mode === "login" ? "Welcome back" : "Start today"}
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                {mode === "login"
                  ? "Login to your account"
                  : "Create your account"}
              </h1>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
                {mode === "login"
                  ? "Continue tracking your progress and daily goals."
                  : "Build your personal system for learning, fitness, habits, and money."}
              </p>
            </div>

            {blockedReason ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {blockedReason}
              </div>
            ) : null}

            {authError ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {authError}
              </div>
            ) : null}

            <div className="space-y-4">
              {mode === "register" && (
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-semibold outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-semibold outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400"
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 pr-14 text-sm font-semibold outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {mode === "login" ? "Login" : "Create account"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center dark:bg-white/10">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                {mode === "login"
                  ? "Don’t have an account?"
                  : "Already have an account?"}
              </p>

              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="mt-1 text-sm font-black text-indigo-600 dark:text-indigo-300"
              >
                {mode === "login" ? "Create a new account" : "Login instead"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
