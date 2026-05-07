"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
    accent: "from-fuchsia-500/25 to-violet-500/10",
  },
];

const trustPoints = [
  "Responsive across mobile, tablet, laptop, and large screens",
  "Dark theme friendly from the first load",
  "Focused on real-life tracking, not generic dashboards",
];

const metrics = [
  { label: "Study logged", value: "18.5h", tone: "text-cyan-200" },
  { label: "Budget left", value: "$1,240", tone: "text-emerald-200" },
  { label: "Focus streak", value: "12 days", tone: "text-amber-200" },
];

const productTileStyles = [
  {
    shell:
      "border-cyan-300/25 bg-[linear-gradient(180deg,rgba(14,165,233,0.24),rgba(8,47,73,0.88))] shadow-[0_24px_60px_rgba(8,145,178,0.2)]",
    icon: "bg-white text-cyan-900 shadow-[0_14px_30px_rgba(255,255,255,0.18)]",
    accent: "from-cyan-200/30 via-cyan-200/10 to-transparent",
  },
  {
    shell:
      "border-amber-300/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.2),rgba(69,48,15,0.9))] shadow-[0_24px_60px_rgba(245,158,11,0.18)]",
    icon: "bg-white text-amber-900 shadow-[0_14px_30px_rgba(255,255,255,0.16)]",
    accent: "from-amber-200/30 via-amber-200/10 to-transparent",
  },
  {
    shell:
      "border-emerald-300/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(7,58,52,0.9))] shadow-[0_24px_60px_rgba(16,185,129,0.18)]",
    icon: "bg-white text-emerald-900 shadow-[0_14px_30px_rgba(255,255,255,0.16)]",
    accent: "from-emerald-200/30 via-emerald-200/10 to-transparent",
  },
  {
    shell:
      "border-violet-300/20 bg-[linear-gradient(180deg,rgba(168,85,247,0.22),rgba(64,27,99,0.9))] shadow-[0_24px_60px_rgba(168,85,247,0.2)]",
    icon: "bg-white text-violet-900 shadow-[0_14px_30px_rgba(255,255,255,0.16)]",
    accent: "from-violet-200/30 via-violet-200/10 to-transparent",
  },
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
  const [heroGlow, setHeroGlow] = useState({ x: 54, y: 32 });
  const [heroActive, setHeroActive] = useState(false);
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

    setHeroActive(true);
    setHeroGlow({ x: px * 100, y: py * 100 });
    tiltX.set((0.5 - py) * 16);
    tiltY.set((px - 0.5) * 20);
  };

  const resetHeroTilt = () => {
    setHeroActive(false);
    setHeroGlow({ x: 54, y: 32 });
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
      className="min-h-screen overflow-hidden bg-[#f5efe3] text-slate-950 dark:bg-[#09090f] dark:text-white"
    >
      <div className="relative isolate">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 hidden h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),rgba(59,130,246,0.08)_42%,transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(34,211,238,0.18),rgba(168,85,247,0.1)_42%,transparent_72%)] lg:block"
          style={{ x: ambientX, y: ambientY }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-[-140px] -z-10 h-[480px] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.22),transparent_42%),radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(217,70,239,0.18),transparent_22%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.24),transparent_38%),radial-gradient(circle_at_18%_20%,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.18),transparent_22%)]" />
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, 30, -12, 0], y: [0, -24, 18, 0], scale: [1, 1.08, 0.98, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[8%] top-[18%] -z-10 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl dark:bg-cyan-500/10"
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, -26, 16, 0], y: [0, 20, -18, 0], scale: [1, 0.95, 1.06, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-[10%] top-[10%] -z-10 h-52 w-52 rounded-full bg-fuchsia-400/10 blur-3xl dark:bg-fuchsia-500/10"
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, 18, -10, 0], y: [0, 24, -12, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-[22%] left-[22%] -z-10 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl dark:bg-amber-400/10"
        />

        <section className="px-3 pb-16 pt-4 sm:px-6 lg:px-10 lg:pb-24">
          <nav className="relative z-[90] mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-[2rem] border border-white/50 bg-white/70 px-3 py-2.5 shadow-[0_20px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:gap-4 sm:px-5 sm:py-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
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
                    className="flex items-center gap-3 rounded-full border border-white/40 bg-white/80 px-3 py-2 shadow-lg shadow-slate-200/40 transition hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/30">
                        {userInitial}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#13131a]" />
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
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[120] w-56 rounded-[1.4rem] border border-white/50 bg-white/95 p-2 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#12121b]/95 dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                      <div className="mb-2 rounded-[1.1rem] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
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
                        className="flex items-center gap-3 rounded-[1.1rem] px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>

                      <button
                        type="button"
                        onClick={() => void logout()}
                        className="flex w-full items-center gap-3 rounded-[1.1rem] px-3 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
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
                    className="whitespace-nowrap rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:scale-[1.02] dark:bg-white dark:text-slate-950"
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
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-700 shadow-sm backdrop-blur dark:border-amber-300/20 dark:bg-white/[0.05] dark:text-amber-200">
                <Sparkles className="h-4 w-4" />
                Smarter tracking for study, work, health, and money
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.4rem]">
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
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-400/20 transition hover:translate-y-[-1px] dark:bg-white dark:text-slate-950"
                >
                  Launch your dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-6 py-3.5 text-sm font-black text-slate-800 shadow-lg shadow-white/20 transition hover:translate-y-[-1px] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:shadow-none"
                >
                  Explore the app
                  <Layers3 className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {trustPoints.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-white/60 bg-white/70 px-4 py-4 text-sm font-bold text-slate-700 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200 dark:shadow-none"
                  >
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
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
              <div className="absolute -left-12 top-12 h-32 w-32 rounded-full bg-cyan-400/30 blur-3xl dark:bg-cyan-500/20" />
              <div className="absolute -right-6 top-0 h-32 w-32 rounded-full bg-fuchsia-400/25 blur-3xl dark:bg-fuchsia-500/20" />
              <div className="absolute bottom-2 left-1/2 h-24 w-2/3 -translate-x-1/2 rounded-full bg-slate-900/20 blur-3xl dark:bg-black/45" />
              <motion.div
                aria-hidden="true"
                animate={{ rotate: [0, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -left-10 top-24 hidden h-24 w-24 rounded-[1.8rem] border border-cyan-300/20 bg-cyan-300/10 shadow-[0_18px_50px_rgba(34,211,238,0.18)] backdrop-blur-md sm:block"
              />
              <motion.div
                aria-hidden="true"
                animate={{ rotate: [12, -8, 12], y: [0, 14, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-6 top-20 hidden h-20 w-20 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 shadow-[0_18px_50px_rgba(217,70,239,0.18)] backdrop-blur-md sm:block"
              />
              <motion.div
                aria-hidden="true"
                animate={{ x: [0, 8, -8, 0], rotate: [0, 6, -4, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute bottom-16 right-8 hidden h-28 w-28 rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:block"
              />
              <div className="pointer-events-none absolute inset-x-[12%] top-[8%] h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
              <div className="pointer-events-none absolute right-[7%] top-[14%] h-[72%] w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

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
                className="relative rounded-[2.4rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.64))] p-4 shadow-[0_50px_140px_rgba(15,23,42,0.24)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(16,18,30,0.96),rgba(20,18,35,0.84))] dark:shadow-[0_65px_150px_rgba(0,0,0,0.55)] sm:p-5 lg:p-6"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[2.4rem] transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${heroGlow.x}% ${heroGlow.y}%, rgba(255,255,255,0.26), transparent 30%), radial-gradient(circle at ${heroGlow.x}% ${heroGlow.y}%, rgba(34,211,238,0.16), transparent 48%)`,
                    opacity: heroActive ? 1 : 0.68,
                  }}
                />
                <div className="pointer-events-none absolute inset-x-[8%] top-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20" />
                <div className="pointer-events-none absolute left-5 right-5 top-5 h-14 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-sm dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
                <div className="pointer-events-none absolute left-9 top-10 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                </div>
                <div className="pointer-events-none absolute -bottom-4 left-[8%] right-[8%] h-12 rounded-full bg-cyan-500/10 blur-2xl dark:bg-cyan-400/10" />
                <div className="rounded-[1.95rem] border border-white/50 bg-[linear-gradient(160deg,#0b1324,#172840_45%,#0c3450)] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-24px_60px_rgba(4,12,24,0.28)] sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/80">
                        Daily cockpit
                      </p>
                      <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                        Momentum at a glance
                      </h2>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
                      Live habits, learning, focus, and money
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur"
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
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
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
                                className="h-2.5 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300"
                                style={{ width: item.width }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-[1.6rem] border border-emerald-300/20 bg-emerald-400/10 p-4 shadow-[0_18px_40px_rgba(16,185,129,0.12)]">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-emerald-300/15 p-3 text-emerald-100">
                            <PiggyBank className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/70">
                              Remaining salary
                            </p>
                            <p className="text-2xl font-black">$40,500</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.6rem] border border-fuchsia-300/20 bg-fuchsia-400/10 p-4 shadow-[0_18px_40px_rgba(168,85,247,0.14)]">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-fuchsia-300/15 p-3 text-fuchsia-100">
                            <BrainCircuit className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100/70">
                              Active study mode
                            </p>
                            <p className="text-2xl font-black">Algorithms - 42m left</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="rounded-[1.6rem] border border-slate-200 bg-white/85 p-4 shadow-lg shadow-slate-200/40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        Daily balance
                      </p>
                      <LineChart className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Morning", value: "Strong", tone: "bg-emerald-500" },
                        { label: "Midday", value: "Steady", tone: "bg-cyan-500" },
                        { label: "Night", value: "Watch energy", tone: "bg-amber-500" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 dark:bg-white/[0.04]"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.95))] p-4 shadow-lg shadow-slate-200/40 dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.04))] dark:shadow-none">
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/20" />
                    <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl" />
                    <div className="pointer-events-none absolute -left-8 bottom-2 h-24 w-24 rounded-full bg-violet-300/10 blur-3xl" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                      One account, many systems
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 [transform-style:preserve-3d]">
                      {productAreas.slice(0, 4).map((item, index) => {
                        const Icon = item.icon;
                        const style = productTileStyles[index];

                        return (
                          <motion.div
                            key={item.title}
                            whileHover={{
                              y: -8,
                              scale: 1.03,
                              rotateX: -6,
                              rotateY: index % 2 === 0 ? 6 : -6,
                            }}
                            transition={{ type: "spring", stiffness: 220, damping: 18 }}
                            className={`group relative overflow-hidden rounded-[1.45rem] border p-4 text-white [transform:translateZ(18px)] ${style.shell}`}
                          >
                            <div
                              className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${style.accent}`}
                            />
                            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                            <div className="pointer-events-none absolute -right-6 bottom-4 h-20 w-20 rounded-full bg-white/10 blur-2xl transition duration-300 group-hover:bg-white/15" />
                            <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${style.icon}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className="relative mt-4 text-sm font-black">
                              {item.title}
                            </p>
                            <p className="relative mt-2 text-xs font-semibold leading-5 text-white/78">
                              {item.description}
                            </p>
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
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl lg:text-5xl">
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
                    className="group rounded-[2rem] border border-white/50 bg-white/75 p-6 shadow-[0_25px_80px_rgba(148,163,184,0.15)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_25px_80px_rgba(0,0,0,0.3)]"
                  >
                    <div className={`inline-flex rounded-[1.4rem] bg-gradient-to-br ${item.accent} p-3`}>
                      <div className="rounded-2xl bg-slate-950 p-3 text-white transition group-hover:scale-105 dark:bg-white dark:text-slate-950">
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
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_35px_100px_rgba(15,23,42,0.22)] dark:border-white/[0.08] dark:bg-[#10111a] dark:shadow-[0_35px_100px_rgba(0,0,0,0.4)]">
              <p className="text-sm font-black uppercase tracking-[0.26em] text-cyan-300">
                Workflow
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                Clear enough for daily use, deep enough for long-term progress.
              </h2>
              <div className="mt-8 space-y-5">
                {timeline.map((item, index) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-cyan-200">
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
              <div className="rounded-[2rem] border border-white/50 bg-white/75 p-7 shadow-[0_25px_80px_rgba(148,163,184,0.15)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-300">
                  <LineChart className="h-6 w-6" />
                  <span className="text-sm font-black uppercase tracking-[0.2em]">
                    Reporting
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                  See the pattern behind the pressure.
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                  Instead of isolated entries, Planify Life helps users connect
                  what they studied, how well they focused, what they spent, and
                  whether their routines are actually sustainable.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(255,255,255,0.88))] p-6 shadow-[0_25px_80px_rgba(148,163,184,0.15)] dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(250,204,21,0.12),rgba(255,255,255,0.04))] dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                  <Clock3 className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                  <h3 className="mt-5 text-2xl font-black">Responsive by default</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Interfaces are tuned for quick mobile check-ins and wider desktop
                    planning sessions without collapsing into generic layouts.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(34,197,94,0.16),rgba(255,255,255,0.88))] p-6 shadow-[0_25px_80px_rgba(148,163,184,0.15)] dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(34,197,94,0.12),rgba(255,255,255,0.04))] dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
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
          <div className="mx-auto max-w-7xl rounded-[2.4rem] border border-white/60 bg-[linear-gradient(135deg,#0f172a,#111c39_50%,#0b2447)] p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.28)] dark:border-white/[0.08] sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                  Start now
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl lg:text-5xl">
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
