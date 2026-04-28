// frontend/components/dashboard/Dashboard.tsx
"use client";

import { useDashboard } from "@/hooks/useDashboard";
import type { Workout, WeeklyStat } from "@/types/dashboard";
import {
  Activity,
  Flame,
  Target,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Zap,
  CheckCircle2,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "./DashboardSkeleton";
import ScoreSections from "./ScoreSections";
import type { ScoreSection } from "@/lib/api";

type CK = "orange" | "cyan" | "violet" | "emerald" | "indigo";

const grad: Record<CK, string> = {
  orange: "from-orange-500 to-amber-400",
  cyan: "from-cyan-500 to-teal-400",
  violet: "from-violet-600 to-purple-500",
  emerald: "from-emerald-500 to-green-400",
  indigo: "from-indigo-500 to-blue-400",
};

function ScoreRing({ score }: { score: number }) {
  const r = 84;
  const circ = 2 * Math.PI * r;
  const raw = useMotionValue(0);
  const spr = useSpring(raw, { stiffness: 55, damping: 16 });
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    raw.set(score);
  }, [score, raw]);

  useEffect(
    () =>
      spr.on("change", (v) => {
        if (ref.current) {
          ref.current.style.strokeDashoffset = `${circ * (1 - v / 100)}`;
        }
      }),
    [spr, circ],
  );

  return (
    <svg className="-rotate-90 h-full w-full" viewBox="0 0 220 220">
      <defs>
        <linearGradient
          id="scoreRingGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="45%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        <filter id="scoreGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="110"
        cy="110"
        r={r}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="14"
        fill="none"
      />

      <circle
        cx="110"
        cy="110"
        r="68"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="24"
        fill="none"
      />

      <circle
        ref={ref}
        cx="110"
        cy="110"
        r={r}
        stroke="url(#scoreRingGradient)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        filter="url(#scoreGlow)"
      />
    </svg>
  );
}

function getSectionProgress(section: ScoreSection) {
  if (!section.goalValue) return 0;

  return Math.min(
    Math.round((section.currentValue / section.goalValue) * 100),
    100,
  );
}

function durationAverageProgress(sections: ScoreSection[]) {
  if (!sections.length) return 0;

  return (
    sections.reduce((sum, section) => sum + getSectionProgress(section), 0) /
    sections.length
  );
}

function countAverageProgress(sections: ScoreSection[]) {
  if (!sections.length) return 0;

  return (
    sections.reduce((sum, section) => sum + getSectionProgress(section), 0) /
    sections.length
  );
}

function getSectionStats(sections: ScoreSection[]) {
  const durationSections = sections.filter(
    (section) => section.goalType === "duration",
  );

  const countSections = sections.filter(
    (section) => section.goalType === "count",
  );

  const booleanSections = sections.filter(
    (section) => section.goalType === "boolean",
  );

  const totalDurationMinutes = durationSections.reduce(
    (sum, section) => sum + section.currentValue,
    0,
  );

  const totalCountProgress = countSections.reduce(
    (sum, section) => sum + section.currentValue,
    0,
  );

  const doneCompleted = booleanSections.filter(
    (section) => section.currentValue >= section.goalValue,
  ).length;

  const overallCompletion = sections.length
    ? Math.round(
        sections.reduce(
          (sum, section) => sum + getSectionProgress(section),
          0,
        ) / sections.length,
      )
    : 0;

  return {
    durationSections,
    countSections,
    booleanSections,
    totalDurationMinutes,
    totalCountProgress,
    doneCompleted,
    overallCompletion,
  };
}

export default function Dashboard() {
  const { data, loading } = useDashboard();
  const [dynamicScore, setDynamicScore] = useState<number | null>(null);
  const [scoreSections, setScoreSections] = useState<ScoreSection[]>([]);
  const router = useRouter();

  const sectionStats = useMemo(
    () => getSectionStats(scoreSections),
    [scoreSections],
  );

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#09090f]">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  const score = dynamicScore ?? 0;

  const dynamicCards = [
    {
      icon: Flame,
      title: "Login Streak",
      color: "orange" as CK,
      value: String(data.workoutStreak.current),
      unit: "days",
      sub: `Longest active streak: ${data.workoutStreak.longest} days`,
      progress: undefined,
    },
    {
      icon: Clock,
      title: "Time Progress",
      color: "indigo" as CK,
      value: `${sectionStats.totalDurationMinutes}`,
      unit: "min",
      sub: sectionStats.durationSections.length
        ? `${sectionStats.durationSections.length} time-based goal${
            sectionStats.durationSections.length > 1 ? "s" : ""
          } active today`
        : "No time-based goals added yet",
      progress: sectionStats.durationSections.length
        ? Math.round(durationAverageProgress(sectionStats.durationSections))
        : 0,
    },
    {
      icon: Hash,
      title: "Count Progress",
      color: "cyan" as CK,
      value: String(sectionStats.totalCountProgress),
      unit: "count",
      sub: sectionStats.countSections.length
        ? `${sectionStats.countSections.length} count-based goal${
            sectionStats.countSections.length > 1 ? "s" : ""
          } active today`
        : "No count-based goals added yet",
      progress: sectionStats.countSections.length
        ? Math.round(countAverageProgress(sectionStats.countSections))
        : 0,
    },
    {
      icon: CheckCircle2,
      title: "Done Progress",
      color: "emerald" as CK,
      value: `${sectionStats.doneCompleted}/${sectionStats.booleanSections.length}`,
      unit: "done",
      sub: sectionStats.booleanSections.length
        ? `${sectionStats.doneCompleted} completed from ${
            sectionStats.booleanSections.length
          } done goal${sectionStats.booleanSections.length > 1 ? "s" : ""}`
        : "No done/not-done goals added yet",
      progress: sectionStats.booleanSections.length
        ? Math.round(
            (sectionStats.doneCompleted / sectionStats.booleanSections.length) *
              100,
          )
        : 0,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#09090f] dark:text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-700/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-none space-y-5 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-white/[0.07] dark:bg-[#110d2e] dark:shadow-black/30 md:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-violet-600/15 blur-[90px]" />
          <div className="absolute right-0 top-1/2 h-px w-[60%] bg-gradient-to-r from-transparent via-violet-400/30 to-cyan-400/20 blur-sm" />
          <div className="absolute bottom-0 right-[20%] h-40 w-40 rounded-full border border-violet-400/10" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 xl:grid-cols-[1.25fr_480px]">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-violet-600 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-violet-300">
                <Zap className="h-3.5 w-3.5" />
                Planify Life
              </div>

              <h1 className="mb-6 font-black leading-[0.95] tracking-[-0.03em]">
                <span className="block text-[clamp(2.8rem,6vw,5.5rem)] text-slate-950 dark:text-white">
                  Build habits,
                </span>
                <span className="block text-[clamp(2.8rem,6vw,5.5rem)] text-slate-950 dark:text-white">
                  track fitness,
                </span>
                <span className="block bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 bg-clip-text text-[clamp(2.8rem,6vw,5.5rem)] text-transparent">
                  protect your focus.
                </span>
              </h1>

              <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300/80">
                Your premium personal operating system for habits, learning,
                focus, wellness, and measurable life optimization.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push("/fitness")}
                  className="group flex items-center gap-3 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-7 py-4 text-base font-black text-white shadow-[0_20px_60px_-15px_rgba(139,92,246,0.65)] transition-all hover:scale-[1.02] active:scale-95"
                >
                  Start today
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => router.push("/reports")}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-7 py-4 text-base font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95 dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                >
                  View analytics
                </button>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center xl:pr-6">
              <div className="absolute h-[360px] w-[360px] rounded-full bg-violet-600/20 blur-[105px]" />

              <div className="relative flex h-[310px] w-[310px] items-center justify-center rounded-full">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-violet-50 to-slate-100 shadow-[inset_18px_18px_60px_rgba(255,255,255,0.55),inset_-24px_-24px_70px_rgba(15,23,42,0.08),0_35px_100px_-35px_rgba(139,92,246,0.9)] dark:from-white/[0.08] dark:via-white/[0.02] dark:to-black/20 dark:shadow-[inset_18px_18px_60px_rgba(255,255,255,0.035),inset_-24px_-24px_70px_rgba(0,0,0,0.45),0_35px_100px_-35px_rgba(139,92,246,0.9)]" />
                <div className="absolute inset-5 rounded-full border border-violet-100 dark:border-white/[0.055]" />
                <div className="absolute inset-10 rounded-full bg-white/80 shadow-[inset_0_20px_55px_rgba(15,23,42,0.08)] dark:bg-[#120b33]/70 dark:shadow-[inset_0_20px_55px_rgba(0,0,0,0.55)]" />
                <div className="absolute left-1/2 top-4 h-4 w-4 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-300 to-violet-500 shadow-[0_0_30px_rgba(56,189,248,0.8)]" />

                <div className="relative h-[270px] w-[270px]">
                  <ScoreRing score={score} />

                  <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
                    <span className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-300">
                      Today's Score
                    </span>

                    <span className="text-6xl font-black leading-none text-slate-950 tabular-nums dark:text-white xl:text-7xl">
                      {score}%
                    </span>

                    <span className="mt-5 max-w-[170px] text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                      {score === 0
                        ? "Add sections below 👇"
                        : score < 40
                          ? "Keep going 💪"
                          : score < 70
                            ? "Crushing it 🔥"
                            : score < 100
                              ? "Almost there ⚡"
                              : "Perfect day 🏆"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid w-full max-w-[350px] grid-cols-3 gap-3">
                {[
                  { v: `${data.workoutStreak.current}d`, l: "Login" },
                  { v: `${sectionStats.totalDurationMinutes}m`, l: "Time" },
                  { v: `${sectionStats.overallCompletion}%`, l: "Progress" },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="rounded-3xl border border-slate-200 bg-white px-3 py-3 text-center shadow-md shadow-slate-200/70 dark:border-white/[0.08] dark:bg-white/[0.055] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_45px_-28px_rgba(139,92,246,0.7)]"
                  >
                    <p className="text-xl font-black leading-none text-slate-950 dark:text-white">
                      {p.v}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      {p.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dynamicCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08 + i * 0.07,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full"
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="h-full"
          >
            <ScoreSections
              onScoreChange={setDynamicScore}
              onSectionsChange={setScoreSections}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="relative h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

            <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                  Performance
                </p>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Weekly Activity
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Last 7 days progress overview
                </p>
              </div>

              <div className="hidden items-center gap-3 text-[11px] font-bold text-slate-500 sm:flex">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  Workouts
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  Focus
                </span>
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              {data.weeklyStats.map((s: WeeklyStat, i: number) => {
                const maxW = Math.max(
                  ...data.weeklyStats.map((x) => x.workouts),
                  1,
                );
                const pct = Math.round((s.workouts / maxW) * 100);

                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-9 shrink-0 text-xs font-bold text-slate-500">
                      {s.day}
                    </span>

                    <div className="h-9 flex-1 overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 2)}%` }}
                        transition={{
                          delay: 0.4 + i * 0.06,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className="flex h-full items-center rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 pl-3 shadow-[0_0_22px_rgba(139,92,246,0.35)]"
                      >
                        {s.workouts > 0 && (
                          <span className="text-xs font-black text-white">
                            {s.workouts}
                          </span>
                        )}
                      </motion.div>
                    </div>

                    <span className="w-12 shrink-0 text-right text-xs font-bold text-slate-500">
                      {s.focusMinutes > 0 ? `${s.focusMinutes}m` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

            <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                  Fitness Log
                </p>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Recent Workouts
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Your latest 5 fitness sessions
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="relative z-10">
              {data.recentWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {data.recentWorkouts
                    .slice(0, 5)
                    .map((w: Workout, i: number) => (
                      <motion.div
                        key={w._id || i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.44 + i * 0.05 }}
                        className="group flex items-center gap-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-lg hover:shadow-violet-100/60 dark:border-white/[0.06] dark:bg-white/[0.035] dark:hover:border-violet-400/30 dark:hover:bg-white/[0.06] dark:hover:shadow-black/20"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-950/25">
                          <Activity className="h-5 w-5 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                            {w.exercise}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {w.duration} min ·{" "}
                            {new Date(w.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm dark:border-white/[0.06] dark:bg-white/[0.05]">
                          <p className="text-sm font-black text-violet-500">
                            {w.calories ?? 0}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            cal
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="flex min-h-[270px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-slate-400">
                    <Activity className="h-7 w-7" />
                  </div>

                  <h4 className="text-lg font-black text-slate-950 dark:text-white">
                    No workouts yet
                  </h4>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Log your first workout and start building your activity
                    history.
                  </p>

                  <button
                    onClick={() => router.push("/fitness")}
                    className="mt-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:scale-[1.02]"
                  >
                    Log Workout
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 }}
            className="relative h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            <div className="relative z-10 mb-6">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
                Shortcuts
              </p>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                Quick Actions
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Jump into your most useful daily tools
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Plus,
                  label: "Add Section",
                  desc: "Create a daily goal",
                  color: "violet" as CK,
                  onClick: () =>
                    window.scrollTo({ top: 620, behavior: "smooth" }),
                },
                {
                  icon: Target,
                  label: "Daily Score",
                  desc: "Review today's score",
                  color: "cyan" as CK,
                  onClick: () =>
                    window.scrollTo({ top: 0, behavior: "smooth" }),
                },
                {
                  icon: Clock,
                  label: "Start Focus",
                  desc: "Begin focus timer",
                  color: "indigo" as CK,
                  onClick: () => router.push("/focus"),
                },
                {
                  icon: TrendingUp,
                  label: "View Reports",
                  desc: "Analyze progress",
                  color: "emerald" as CK,
                  onClick: () => router.push("/reports"),
                },
              ].map((a, i) => (
                <motion.button
                  key={i}
                  onClick={a.onClick}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative min-h-[125px] overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-violet-200 hover:bg-white hover:shadow-lg hover:shadow-violet-100/60 dark:border-white/[0.06] dark:bg-white/[0.035] dark:hover:border-violet-400/30 dark:hover:bg-white/[0.06] dark:hover:shadow-black/20"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${grad[a.color]} opacity-10 blur-2xl transition group-hover:opacity-20`}
                  />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${grad[a.color]} shadow-lg shadow-violet-950/25`}
                    >
                      <a.icon className="h-5 w-5 text-white" />
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-black text-slate-950 dark:text-white">
                        {a.label}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {a.desc}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface SCP {
  icon: LucideIcon;
  title: string;
  color: CK;
  value: string;
  unit: string;
  sub: string;
  progress?: number;
  action?: () => void;
}

function StatCard({
  icon: Icon,
  title,
  color,
  value,
  unit,
  sub,
  progress,
  action,
}: SCP) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className="group relative flex h-full min-h-[210px] overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-[#17122d] dark:via-[#100d1f] dark:to-[#0a0815] dark:shadow-[0_30px_80px_-40px_rgba(0,0,0,1)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent dark:via-white/20" />

      <div
        className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${grad[color]} opacity-[0.12] blur-3xl transition-all duration-500 group-hover:opacity-[0.22]`}
      />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.7),transparent_35%,transparent_65%,rgba(139,92,246,0.05))] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_35%,transparent_65%,rgba(255,255,255,0.03))]" />

      <div className="absolute bottom-2 right-3 opacity-[0.04] transition-all duration-500 group-hover:opacity-[0.08] dark:opacity-[0.035] dark:group-hover:opacity-[0.07]">
        <Icon
          className="h-28 w-28 text-slate-950 dark:text-white"
          strokeWidth={1.2}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br ${grad[color]} shadow-[0_20px_40px_-18px_rgba(139,92,246,0.85)]`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          {action ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={action}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 backdrop-blur-xl transition-all hover:bg-slate-100 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.12] dark:hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          ) : (
            <div className="h-9 w-9" />
          )}
        </div>

        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <div className="mb-3 flex min-h-[58px] items-end gap-1">
          <span className="text-[2.6rem] font-black leading-none tracking-[-0.03em] text-slate-950 tabular-nums dark:text-white">
            {value}
          </span>

          {unit && (
            <span className="pb-1 text-sm font-semibold text-slate-500">
              {unit}
            </span>
          )}
        </div>

        <p className="mb-5 min-h-[34px] text-xs leading-relaxed text-slate-500">
          {sub}
        </p>

        <div className="mt-auto">
          {progress !== undefined ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                  Progress
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {Math.min(progress, 100)}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{
                    duration: 0.9,
                    ease: "easeOut",
                    delay: 0.2,
                  }}
                  className={`relative h-full rounded-full bg-gradient-to-r ${grad[color]}`}
                >
                  <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                </motion.div>
              </div>
            </>
          ) : (
            <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.035]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
