"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Layers3,
  LineChart,
  LogOut,
  LayoutDashboard,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const productAreas = [
  {
    title: "Learning Sessions",
    description:
      "Plan subjects, launch study timers, and build a better daily rhythm with live progress.",
    icon: BookOpen,
    accent: "from-cyan-500/25 to-sky-500/10",
  },
  {
    title: "Focused Work",
    description:
      "Run distraction-free time blocks and review how consistently you protect deep work.",
    icon: Target,
    accent: "from-amber-400/25 to-orange-500/10",
  },
  {
    title: "Money Tracking",
    description:
      "Set salary, log expenses, watch category trends, and understand what is draining your budget.",
    icon: PiggyBank,
    accent: "from-emerald-500/25 to-teal-500/10",
  },
  {
    title: "Fitness and Habits",
    description:
      "Bring workouts, habit streaks, and health momentum into the same weekly picture.",
    icon: Dumbbell,
    accent: "from-rose-500/25 to-orange-500/10",
  },
];

const trustPoints = [
  "Responsive across mobile, tablet, laptop, and large screens",
  "Dark theme friendly from the first load",
  "Focused on real-life tracking, not generic dashboards",
];

const metrics = [
  { label: "Study logged", value: "18.5h", tone: "text-cyan-200" },
  { label: "Savings", value: "৳19.5k", tone: "text-emerald-200" },
  { label: "Focus streak", value: "12 days", tone: "text-amber-200" },
];

const timeline = [
  {
    title: "Capture the plan",
    description:
      "Create study blocks, workouts, money entries, and habit checkpoints in a few quick interactions.",
  },
  {
    title: "Stay in motion",
    description:
      "Use timers, live summaries, and clear page-level actions so the app stays useful while you work.",
  },
  {
    title: "Review the pattern",
    description:
      "Use reports and dashboard surfaces to notice where your time, energy, and money are really going.",
  },
];

export default function HomeLanding() {
  const { user, loading, logout } = useAuth();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const glowX = useSpring(pointerX, { stiffness: 120, damping: 24, mass: 0.4 });
  const glowY = useSpring(pointerY, { stiffness: 120, damping: 24, mass: 0.4 });
  const ambientX = useTransform(glowX, (value) => value - 220);
  const ambientY = useTransform(glowY, (value) => value - 220);

  const tiltX = useMotionValue(6);
  const tiltY = useMotionValue(-10);
  const cardRotateX = useSpring(tiltX, { stiffness: 180, damping: 20, mass: 0.45 });
  const cardRotateY = useSpring(tiltY, { stiffness: 180, damping: 20, mass: 0.45 });
  const heroGlowX = useMotionValue(54);
  const heroGlowY = useMotionValue(32);
  const heroGlowOpacity = useMotionValue(0.68);
  const heroGlowBackground = useMotionTemplate`linear-gradient(135deg, rgba(255,255,255,0.16), transparent 36%), radial-gradient(circle at ${heroGlowX}% ${heroGlowY}%, rgba(34,211,238,0.14), transparent 42%)`;
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleSceneMove = (event: React.MouseEvent<HTMLElement>) => {
    pointerX.set(event.clientX);
    pointerY.set(event.clientY);
  };

  const handleHeroMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;

    heroGlowX.set(px * 100);
    heroGlowY.set(py * 100);
    heroGlowOpacity.set(1);
    tiltX.set((0.5 - py) * 16);
    tiltY.set((px - 0.5) * 20);
  };

  const resetHeroTilt = () => {
    heroGlowX.set(54);
    heroGlowY.set(32);
    heroGlowOpacity.set(0.68);
    tiltX.set(6);
    tiltY.set(-10);
  };

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <main
      onMouseMove={handleSceneMove}
      className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950 dark:bg-[#07111f] dark:text-white"
    >
      <div className="relative isolate bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,245,249,0.98)_44%,rgba(248,250,252,1))] dark:bg-[linear-gradient(180deg,#07111f,#0b1626_42%,#08111f)]">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 hidden h-[360px] w-[360px] bg-[radial-gradient(circle,rgba(34,211,238,0.14),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(34,211,238,0.11),transparent_70%)] lg:block"
          style={{ x: ambientX, y: ambientY }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[linear-gradient(115deg,rgba(14,165,233,0.16),transparent_34%),linear-gradient(245deg,rgba(16,185,129,0.14),transparent_32%)] dark:bg-[linear-gradient(115deg,rgba(8,145,178,0.22),transparent_36%),linear-gradient(245deg,rgba(16,185,129,0.16),transparent_32%)]" />

        <section className="px-3 pb-16 pt-4 sm:px-6 lg:px-10 lg:pb-24">
          <nav className="relative z-[90] mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/86 px-3 py-2.5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/72 dark:shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:gap-4 sm:px-5 sm:py-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/24">
                <Activity size={21} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-black">Planify Life</p>
                <p className="hidden truncate text-xs font-semibold text-slate-500 dark:text-slate-400 sm:block">
                  Personal operating system for better momentum
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300 lg:flex">
              <a href="#products">Products</a>
              <a href="#workflow">Workflow</a>
              <a href="#reports">Reports</a>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {loading ? (
                <div className="hidden h-11 w-36 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08] sm:block" />
              ) : user ? (
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((current) => !current)}
                    className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 shadow-lg shadow-slate-200/40 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-sm font-black text-white shadow-lg shadow-cyan-500/24">
                        {userInitial}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                    </div>
                    <div className="hidden min-w-0 text-left sm:block">
                      <p className="max-w-[120px] truncate text-sm font-black text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="max-w-[120px] truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition dark:text-slate-300 ${profileMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {profileMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[120] w-56 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/95 dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                      <div className="mb-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
                        <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                          {user.name}
                        </p>
                        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>

                      <button
                        type="button"
                        onClick={() => void logout()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08] sm:block"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth"
                    className="whitespace-nowrap rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:scale-[1.02] dark:bg-cyan-400 dark:text-slate-950"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className="relative z-10 mx-auto mt-10 grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16 lg:pt-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="relative"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/82 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 shadow-sm backdrop-blur dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Smarter tracking for study, work, health, and money
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1] text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem]">
                A sharper home for your daily systems.
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Planify Life brings your learning sessions, focus routines, money
                management, fitness progress, and habits into one calm dashboard
                that feels structured instead of overwhelming.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-400/20 transition hover:translate-y-[-1px] dark:bg-cyan-400 dark:text-slate-950"
                >
                  Launch your dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/85 px-6 py-3.5 text-sm font-black text-slate-800 shadow-lg shadow-white/20 transition hover:translate-y-[-1px] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:shadow-none"
                >
                  Explore the app
                  <Layers3 className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {trustPoints.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/82 px-4 py-4 text-sm font-bold text-slate-700 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/72 dark:text-slate-200 dark:shadow-none"
                  >
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28, rotateX: 7 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto w-full max-w-[760px] overflow-hidden [perspective:1800px] sm:overflow-visible"
            >
              <div className="absolute bottom-2 left-1/2 h-20 w-2/3 -translate-x-1/2 rounded-full bg-slate-900/18 blur-3xl dark:bg-black/45" />
              <motion.div
                aria-hidden="true"
                animate={{ rotate: [0, 8, 0], y: [0, -8, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -left-8 top-24 hidden h-24 w-24 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_18px_50px_rgba(34,211,238,0.16)] backdrop-blur-md sm:block"
              />
              <motion.div
                aria-hidden="true"
                animate={{ rotate: [10, -6, 10], y: [0, 12, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-4 top-20 hidden h-20 w-20 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 shadow-[0_18px_50px_rgba(16,185,129,0.14)] backdrop-blur-md sm:block"
              />
              <motion.div
                aria-hidden="true"
                animate={{ x: [0, 8, -8, 0], rotate: [0, 6, -4, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute bottom-16 right-8 hidden h-28 w-28 rounded-2xl border border-slate-300/20 bg-white/18 shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur-sm dark:border-slate-600/40 dark:bg-slate-900/48 sm:block"
              />
              <div className="pointer-events-none absolute inset-x-[12%] top-[8%] h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
              <div className="pointer-events-none absolute right-[7%] top-[14%] h-[72%] w-px bg-gradient-to-b from-transparent via-cyan-200/20 to-transparent" />

              <motion.div
                onMouseMove={handleHeroMove}
                onMouseLeave={resetHeroTilt}
                style={{
                  rotateX: cardRotateX,
                  rotateY: cardRotateY,
                  transformStyle: "preserve-3d",
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="relative rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(241,245,249,0.78))] p-4 shadow-[0_50px_140px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,17,31,0.92))] dark:shadow-[0_65px_150px_rgba(0,0,0,0.55)] sm:p-5 lg:p-6"
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[2rem] transition-opacity duration-300"
                  style={{
                    background: heroGlowBackground,
                    opacity: heroGlowOpacity,
                  }}
                />
                <div className="pointer-events-none absolute inset-x-[8%] top-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-cyan-200/20" />
                <div className="pointer-events-none absolute left-5 right-5 top-5 h-14 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-sm dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.01))]" />
                <div className="pointer-events-none absolute left-9 top-10 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                </div>
                <div className="pointer-events-none absolute -bottom-4 left-[8%] right-[8%] h-12 rounded-full bg-cyan-500/10 blur-2xl dark:bg-cyan-400/10" />
                <div className="rounded-[1.45rem] border border-cyan-200/20 bg-[linear-gradient(160deg,#07111f,#0f2538_48%,#073334)] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-24px_60px_rgba(4,12,24,0.28)] sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/80">
                        Daily cockpit
                      </p>
                      <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                        Momentum at a glance
                      </h2>
                    </div>
                    <div className="rounded-full border border-cyan-200/14 bg-white/8 px-3 py-2 text-xs font-bold text-white/80">
                      Live habits, learning, focus, and money
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                          {metric.label}
                        </p>
                        <p className={`mt-2 text-2xl font-black ${metric.tone}`}>
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-bold text-white/80">This week</p>
                        <Clock3 className="h-4 w-4 text-cyan-200" />
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: "Learning sessions", value: "9 blocks", width: "78%" },
                          { label: "Focus completion", value: "84%", width: "84%" },
                          { label: "Budget control", value: "69%", width: "69%" },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="mb-1 flex items-center justify-between text-xs font-bold text-white/70">
                              <span>{item.label}</span>
                              <span>{item.value}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-white/10">
                              <div
                                className="h-2.5 rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                                style={{ width: item.width }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 shadow-[0_18px_40px_rgba(16,185,129,0.12)]">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-emerald-300/15 p-3 text-emerald-100">
                            <PiggyBank className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/70">
                              Remaining salary
                            </p>
                            <p className="text-2xl font-black">৳40,500</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 shadow-[0_18px_40px_rgba(34,211,238,0.12)]">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-cyan-300/15 p-3 text-cyan-100">
                            <BrainCircuit className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">
                              Active study mode
                            </p>
                            <p className="text-2xl font-black">Algorithms - 42m left</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-950/78 dark:shadow-none">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          Today flow
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Energy, focus, and rhythm
                        </p>
                      </div>
                      <LineChart className="h-4 w-4 text-cyan-500" />
                    </div>

                    <div className="relative space-y-3">
                      <div className="absolute bottom-5 left-[18px] top-5 w-px bg-slate-200 dark:bg-slate-700" />
                      {[
                        { label: "Morning", value: "Strong start", tone: "bg-emerald-500", time: "8 AM" },
                        { label: "Midday", value: "Focus block", tone: "bg-cyan-500", time: "1 PM" },
                        { label: "Night", value: "Review mode", tone: "bg-amber-500", time: "9 PM" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="relative flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900"
                        >
                          <span className={`relative z-10 h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900 ${item.tone}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                              {item.label}
                            </p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {item.value}
                            </p>
                          </div>
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-950/78 dark:shadow-none">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                          Connected systems
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                          One calm command center
                        </p>
                      </div>
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                        Live
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {[
                        { title: "Learning", value: "9 sessions", icon: BookOpen, color: "text-cyan-500", bar: "w-[78%]", fill: "from-cyan-400 to-sky-400" },
                        { title: "Focus", value: "84% complete", icon: Target, color: "text-amber-500", bar: "w-[84%]", fill: "from-amber-400 to-orange-400" },
                        { title: "Money", value: "৳19.5k saved", icon: PiggyBank, color: "text-emerald-500", bar: "w-[69%]", fill: "from-emerald-400 to-teal-400" },
                        { title: "Fitness", value: "3 workouts", icon: Dumbbell, color: "text-rose-500", bar: "w-[52%]", fill: "from-rose-400 to-orange-400" },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                          <motion.div
                            key={item.title}
                            whileHover={{ x: 4, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 240, damping: 20 }}
                            className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900"
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-950 ${item.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                                  {item.title}
                                </p>
                                <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                                  {item.value}
                                </p>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                <div className={`h-full rounded-full bg-gradient-to-r ${item.fill} ${item.bar}`} />
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-cyan-400" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="products" className="px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">
                Product Areas
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl lg:text-5xl">
                Designed around the way real people juggle goals.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                Each section is useful on its own, but the real value comes from
                seeing your study time, money habits, focus, and health together.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {productAreas.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="group rounded-2xl border border-slate-200/80 bg-white/86 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/82 dark:shadow-[0_25px_80px_rgba(0,0,0,0.32)]"
                  >
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${item.accent} p-3`}>
                      <div className="rounded-xl bg-slate-950 p-3 text-white transition group-hover:scale-105 dark:bg-cyan-400 dark:text-slate-950">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_35px_100px_rgba(15,23,42,0.22)] dark:border-slate-700/80 dark:bg-[linear-gradient(160deg,#0f172a,#07111f)] dark:shadow-[0_35px_100px_rgba(0,0,0,0.4)]">
              <p className="text-sm font-black uppercase tracking-[0.26em] text-cyan-300">
                Workflow
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Clear enough for daily use, deep enough for long-term progress.
              </h2>
              <div className="mt-8 space-y-5">
                {timeline.map((item, index) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-cyan-200">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="reports" className="grid gap-5">
              <div className="rounded-2xl border border-slate-200/80 bg-white/86 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/82 dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-300">
                  <LineChart className="h-6 w-6" />
                  <span className="text-sm font-black uppercase tracking-[0.2em]">
                    Reporting
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                  See the pattern behind the pressure.
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                  Instead of isolated entries, Planify Life helps users connect
                  what they studied, how well they focused, what they spent, and
                  whether their routines are actually sustainable.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(255,255,255,0.88))] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,rgba(250,204,21,0.12),rgba(15,23,42,0.88))] dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                  <Clock3 className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                  <h3 className="mt-5 text-2xl font-black">Responsive by default</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Interfaces are tuned for quick mobile check-ins and wider desktop
                    planning sessions without collapsing into generic layouts.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(135deg,rgba(34,197,94,0.16),rgba(255,255,255,0.88))] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,rgba(34,197,94,0.12),rgba(15,23,42,0.88))] dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                  <h3 className="mt-5 text-2xl font-black">Built to scale with you</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    The app structure already supports authenticated flows, modular
                    features, shared data access, and room for richer reporting later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-700/80 bg-[linear-gradient(135deg,#0f172a,#073334_52%,#07111f)] p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.28)] dark:border-slate-700 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                  Start now
                </p>
                <h2 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
                  Make your dashboard feel like a command center, not a chore list.
                </h2>
              </div>

              <div>
                <p className="text-base leading-8 text-slate-300">
                  Set up your account, open the dashboard, and start using learning,
                  money, focus, fitness, and habit tools in one connected workflow.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/auth"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:translate-y-[-1px]"
                  >
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/14"
                  >
                    Visit dashboard
                    <Layers3 className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-6 pb-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          © 2026 Planify Life. Built to help people study, focus, move, and spend with more intention.
        </footer>
      </div>
    </main>
  );
}
