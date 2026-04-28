"use client";

import { useDashboard } from "@/hooks/useDashboard";
import type { Workout, WeeklyStat } from "@/types/dashboard";
import {
  Activity,
  Flame,
  Droplets,
  Target,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import DashboardSkeleton from "./DashboardSkeleton";

/* ─── colour tokens ─────────────────────────────────────────────── */
type CK = "orange" | "cyan" | "violet" | "emerald" | "indigo";
const grad: Record<CK, string> = {
  orange: "from-orange-500 to-amber-400",
  cyan: "from-cyan-500   to-teal-400",
  violet: "from-violet-600 to-purple-500",
  emerald: "from-emerald-500 to-green-400",
  indigo: "from-indigo-500 to-blue-400",
};
const glow: Record<CK, string> = {
  orange: "shadow-orange-500/30",
  cyan: "shadow-cyan-500/30",
  violet: "shadow-violet-500/30",
  emerald: "shadow-emerald-500/30",
  indigo: "shadow-indigo-500/30",
};

const SECTION_COUNT = 4;
const PTS = Math.round(100 / SECTION_COUNT);

/* ─── animated ring ─────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 88;
  const circ = 2 * Math.PI * r;
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 60, damping: 18 });
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    raw.set(score);
  }, [score, raw]);
  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current)
          ref.current.style.strokeDashoffset = `${circ * (1 - v / 100)}`;
      }),
    [spring, circ],
  );

  return (
    <svg className="-rotate-90 w-full h-full" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="100"
        cy="100"
        r={r}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
        fill="none"
      />
      <circle
        ref={ref}
        cx="100"
        cy="100"
        r={r}
        stroke="url(#rg)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        filter="url(#glow)"
        style={{ transition: "none" }}
      />
    </svg>
  );
}

/* ─── page ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { data, loading, updateWaterIntake } = useDashboard();
  if (loading) return <DashboardSkeleton />;
  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No data</p>
      </div>
    );

  const overHydrated = data.waterIntake.consumed > data.waterIntake.goal;
  const segs = [
    {
      label: "💧 Water",
      pts: Math.round(
        Math.min(data.waterIntake.consumed / data.waterIntake.goal, 1) * PTS,
      ),
      color: "cyan" as CK,
    },
    {
      label: "🎯 Focus",
      pts: Math.round(Math.min(data.focusTime.minutes / 120, 1) * PTS),
      color: "violet" as CK,
    },
    {
      label: "🔥 Streak",
      pts: data.workoutStreak.current > 0 ? PTS : 0,
      color: "orange" as CK,
    },
    {
      label: "📅 Weekly",
      pts: Math.round(Math.min(data.weeklyGoal.percentage / 100, 1) * PTS),
      color: "emerald" as CK,
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* ── floating bg orbs ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] rounded-full bg-violet-700/12 blur-[160px]" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-800/8 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 py-8 space-y-5">
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-gradient-to-br from-[#1a1040] via-[#130d36] to-[#0e0c2a] p-7 sm:p-10"
        >
          {/* shimmer top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
            {/* left */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold tracking-widest uppercase text-violet-300"
              >
                <Zap className="w-3 h-3" /> Planify Life
              </motion.div>

              <h1
                className="font-black leading-[1.1] tracking-tight mb-5"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                <span className="block text-[clamp(2rem,5vw,3.5rem)] text-white/90">
                  Build habits,
                </span>
                <span className="block text-[clamp(2rem,5vw,3.5rem)] text-white/90">
                  track fitness,
                </span>
                <span className="block text-[clamp(2rem,5vw,3.5rem)] bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  protect your focus.
                </span>
              </h1>

              <p className="text-gray-400 text-sm sm:text-base max-w-sm leading-relaxed mb-7">
                Your personal OS for workouts, habits, water, focus sessions,
                and weekly analytics.
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-violet-700/30 hover:shadow-violet-700/50 transition-all active:scale-95">
                  Start today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button className="px-5 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-gray-300 hover:bg-white/[0.08] transition-all active:scale-95">
                  View analytics
                </button>
              </div>
            </div>

            {/* right — ring */}
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-52 h-52">
                <ScoreRing score={data.todayScore} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-medium text-gray-400 mb-1">
                    Today's score
                  </span>
                  <span className="text-6xl font-black tabular-nums leading-none bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                    {data.todayScore}%
                  </span>
                  <span className="text-xs text-gray-400 mt-1.5">
                    {data.todayScore < 25
                      ? "Just starting 🌱"
                      : data.todayScore < 50
                        ? "Keep going 💪"
                        : data.todayScore < 75
                          ? "Crushing it 🔥"
                          : data.todayScore < 100
                            ? "Almost there ⚡"
                            : "Perfect day 🏆"}
                  </span>
                </div>
              </div>

              {/* 3 mini pills */}
              <div className="flex gap-2">
                {[
                  { v: `${data.workoutStreak.current}d`, l: "Streak" },
                  {
                    v: `${data.waterIntake.consumed}/${data.waterIntake.goal}`,
                    l: "Water",
                  },
                  {
                    v: `${data.focusTime.hours}h${data.focusTime.minutes % 60}m`,
                    l: "Focus",
                  },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-center min-w-[68px]"
                  >
                    <p className="text-sm font-bold text-white leading-none">
                      {p.v}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">{p.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* bottom shimmer */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />
        </motion.div>

        {/* ══ STAT CARDS ════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {(
            [
              {
                icon: Flame,
                title: "Workout Streak",
                color: "orange" as CK,
                value: data.workoutStreak.current,
                unit: "days",
                sub: `Best: ${data.workoutStreak.longest} days`,
                progress: undefined,
                action: undefined,
              },
              {
                icon: Droplets,
                title: "Water Intake",
                color: "cyan" as CK,
                value: `${data.waterIntake.consumed}/${data.waterIntake.goal}`,
                unit: "glasses",
                sub: overHydrated
                  ? `${data.waterIntake.consumed - data.waterIntake.goal} extra 🏆`
                  : `${Math.min(data.waterIntake.percentage, 100)}% of goal`,
                progress: Math.min(data.waterIntake.percentage, 100),
                action: () => updateWaterIntake(data.waterIntake.consumed + 1),
              },
              {
                icon: Clock,
                title: "Focus Time",
                color: "violet" as CK,
                value: `${data.focusTime.hours}h`,
                unit: `${data.focusTime.minutes % 60}m`,
                sub: `${data.focusTime.sessionsCount} sessions today`,
                progress: undefined,
                action: undefined,
              },
              {
                icon: Target,
                title: "Weekly Goal",
                color: "emerald" as CK,
                value: `${data.weeklyGoal.percentage}%`,
                unit: "",
                sub: `${data.weeklyGoal.completed}/${data.weeklyGoal.goal} workouts`,
                progress: data.weeklyGoal.percentage,
                action: undefined,
              },
            ] as const
          ).map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + i * 0.07,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <StatCard {...c} />
            </motion.div>
          ))}
        </div>

        {/* ══ SCORE BREAKDOWN + CHART (2-col) ═══════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* score breakdown — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 rounded-[28px] border border-white/[0.07] bg-[#0f0c1f] p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Score Breakdown
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {PTS} pts × {SECTION_COUNT} sections
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">
                  {data.todayScore}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {segs.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-300">
                      {s.label}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {s.pts}
                      <span className="text-gray-600">/{PTS}</span>
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((s.pts / PTS) * 100)}%` }}
                      transition={{
                        delay: 0.5 + i * 0.08,
                        duration: 0.7,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${grad[s.color]}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* weekly activity — 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 rounded-[28px] border border-white/[0.07] bg-[#0f0c1f] p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Weekly Activity
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                  Workouts
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 inline-block" />
                  Focus min
                </span>
              </div>
            </div>
            <div className="space-y-2.5">
              {data.weeklyStats.map((s: WeeklyStat, i: number) => {
                const maxW = Math.max(
                  ...data.weeklyStats.map((x) => x.workouts),
                  1,
                );
                const pct = Math.round((s.workouts / maxW) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 text-[11px] font-semibold text-gray-500">
                      {s.day}
                    </span>
                    <div className="flex-1 h-8 rounded-xl bg-white/[0.04] overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          delay: 0.5 + i * 0.06,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-xl bg-gradient-to-r from-violet-600/80 to-purple-500/80 flex items-center pl-3"
                      >
                        {s.workouts > 0 && (
                          <span className="text-white text-xs font-bold">
                            {s.workouts}
                          </span>
                        )}
                      </motion.div>
                    </div>
                    <span className="w-10 shrink-0 text-[11px] text-gray-500 text-right">
                      {s.focusMinutes > 0 ? `${s.focusMinutes}m` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ══ RECENT + QUICK ACTIONS (2-col) ════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* recent workouts — 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-3 rounded-[28px] border border-white/[0.07] bg-[#0f0c1f] p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Recent Workouts
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Last 5 sessions
                </p>
              </div>
              <Activity className="w-4 h-4 text-gray-600" />
            </div>
            {data.recentWorkouts.length > 0 ? (
              <div className="space-y-2">
                {data.recentWorkouts
                  .slice(0, 5)
                  .map((w: Workout, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {w.exercise}
                        </p>
                        <p className="text-xs text-gray-500">
                          {w.duration} min ·{" "}
                          {new Date(w.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-violet-400 shrink-0">
                        {w.calories ?? 0} cal
                      </span>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm font-semibold text-gray-400">
                  No workouts yet
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Log your first session!
                </p>
              </div>
            )}
          </motion.div>

          {/* quick actions — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 rounded-[28px] border border-white/[0.07] bg-[#0f0c1f] p-6"
          >
            <h3 className="font-bold text-white text-sm mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-2.5rem)]">
              {[
                { icon: Plus, label: "Log Workout", color: "violet" as CK },
                {
                  icon: Droplets,
                  label: "Add Water",
                  color: "cyan" as CK,
                  onClick: () =>
                    updateWaterIntake(data.waterIntake.consumed + 1),
                },
                { icon: Clock, label: "Start Focus", color: "indigo" as CK },
                {
                  icon: TrendingUp,
                  label: "View Reports",
                  color: "emerald" as CK,
                },
              ].map((a, i) => (
                <motion.button
                  key={i}
                  onClick={a.onClick}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] transition-colors p-4`}
                >
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${grad[a.color]} shadow-lg ${glow[a.color]}`}
                  >
                    <a.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 text-center leading-tight">
                    {a.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── StatCard ──────────────────────────────────────────────────── */
interface SCP {
  icon: LucideIcon;
  title: string;
  color: CK;
  value: string | number;
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
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0f0c1f] p-5 flex flex-col gap-4"
    >
      {/* top shimmer line */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 text-${color === "cyan" ? "cyan" : color === "orange" ? "orange" : color === "emerald" ? "emerald" : "violet"}-400`}
      />

      <div className="flex items-start justify-between">
        <div
          className={`p-2.5 rounded-xl bg-gradient-to-br ${grad[color]} shadow-lg ${glow[color]}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {action && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={action}
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-gray-400" />
          </motion.button>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-end gap-1.5 mb-1">
          <span className="text-[2rem] font-black leading-none text-white tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 pb-0.5 font-medium">
              {unit}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 truncate">{sub}</p>
      </div>

      {progress !== undefined && (
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className={`h-full rounded-full bg-gradient-to-r ${grad[color]}`}
          />
        </div>
      )}
    </motion.div>
  );
}
