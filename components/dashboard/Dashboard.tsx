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
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "./DashboardSkeleton";
import ScoreSections from "./ScoreSections";

/* ─── colour tokens ─────────────────────────────────────────────── */
type CK = "orange" | "cyan" | "violet" | "emerald" | "indigo";

const grad: Record<CK, string> = {
  orange: "from-orange-500 to-amber-400",
  cyan: "from-cyan-500   to-teal-400",
  violet: "from-violet-600 to-purple-500",
  emerald: "from-emerald-500 to-green-400",
  indigo: "from-indigo-500 to-blue-400",
};

/* ─── animated ring ─────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 80;
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
        if (ref.current)
          ref.current.style.strokeDashoffset = `${circ * (1 - v / 100)}`;
      }),
    [spr, circ],
  );

  return (
    <svg className="-rotate-90 w-full h-full" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="100"
        r={r}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="10"
        fill="none"
      />
      <circle
        ref={ref}
        cx="100"
        cy="100"
        r={r}
        stroke="url(#rg)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
      />
    </svg>
  );
}

/* ─── page ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { data, loading, updateWaterIntake } = useDashboard();
  const [dynamicScore, setDynamicScore] = useState<number | null>(null);
  const router = useRouter();

  if (loading) return <DashboardSkeleton />;
  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090f]">
        <p className="text-gray-500">No data available</p>
      </div>
    );

  const score = dynamicScore ?? 0;
  const overHydrated = data.waterIntake.consumed > data.waterIntake.goal;

  return (
    <div className="min-h-screen bg-[#09090f]">
      {/* ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <div className="absolute -top-40 left-1/4   w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-[140px]" />
        <div className="absolute top-1/2  -right-32  w-[400px] h-[400px] rounded-full bg-indigo-600/8  blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 py-8 space-y-5">
        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#110d2e] p-8 md:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-10 items-center">
            {/* left */}
            <div>
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.10] text-[11px] font-semibold tracking-widest uppercase text-violet-300">
                <Zap className="w-3 h-3" /> Planify Life
              </div>

              <h1 className="font-black leading-[1.1] tracking-tight mb-5">
                <span className="block text-[clamp(2rem,4.5vw,3.25rem)] text-white">
                  Build habits,
                </span>
                <span className="block text-[clamp(2rem,4.5vw,3.25rem)] text-white">
                  track fitness,
                </span>
                <span className="block text-[clamp(2rem,4.5vw,3.25rem)] bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  protect your focus.
                </span>
              </h1>

              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-7">
                Your personal OS for workouts, habits, water, focus sessions,
                and weekly analytics.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/fitness")}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-violet-700/25 hover:shadow-violet-700/40 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Start today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => router.push("/reports")}
                  className="px-5 py-2.5 rounded-2xl border border-white/[0.12] bg-white/[0.05] text-sm font-semibold text-gray-300 hover:bg-white/[0.10] hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  View analytics
                </button>
              </div>
            </div>

            {/* right — ring */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-44 h-44">
                <ScoreRing score={score} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-gray-400 mb-1">
                    Today's score
                  </span>
                  <span className="text-5xl font-black tabular-nums leading-none text-white">
                    {score}%
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1.5">
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

              {/* 3 pills — only streak, focus, weekly (water removed since it's in sections) */}
              <div className="flex gap-2">
                {[
                  { v: `${data.workoutStreak.current}d`, l: "Streak" },
                  {
                    v: `${data.focusTime.hours}h${data.focusTime.minutes % 60}m`,
                    l: "Focus",
                  },
                  { v: `${data.weeklyGoal.percentage}%`, l: "Weekly" },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-center min-w-[62px]"
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
        </motion.div>

        {/* ══ STAT CARDS ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              icon: Flame,
              title: "Workout Streak",
              color: "orange" as CK,
              value: String(data.workoutStreak.current),
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
                ? `${data.waterIntake.consumed - data.waterIntake.goal} extra 🏆 Overachiever!`
                : `${Math.min(data.waterIntake.percentage, 100)}% of daily goal`,
              progress: Math.min(data.waterIntake.percentage, 100),
              action: () => updateWaterIntake(data.waterIntake.consumed + 1),
            },
            {
              icon: Clock,
              title: "Focus Time",
              color: "violet" as CK,
              value: `${data.focusTime.hours}h`,
              unit: `${data.focusTime.minutes % 60}m`,
              sub: `${data.focusTime.sessionsCount} session${data.focusTime.sessionsCount !== 1 ? "s" : ""} today`,
              progress: undefined,
              action: undefined,
            },
            {
              icon: Target,
              title: "Weekly Goal",
              color: "emerald" as CK,
              value: `${data.weeklyGoal.percentage}%`,
              unit: "",
              sub: `${data.weeklyGoal.completed} of ${data.weeklyGoal.goal} workouts`,
              progress: data.weeklyGoal.percentage,
              action: undefined,
            },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08 + i * 0.07,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <StatCard {...c} />
            </motion.div>
          ))}
        </div>

        {/* ══ SCORE SECTIONS + WEEKLY CHART ═══════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="lg:col-span-2"
          >
            <ScoreSections onScoreChange={setDynamicScore} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
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
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Workouts
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  Focus
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
                    <span className="w-8 shrink-0 text-[11px] font-medium text-gray-500">
                      {s.day}
                    </span>
                    <div className="flex-1 h-8 rounded-xl bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          delay: 0.4 + i * 0.06,
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

        {/* ══ RECENT WORKOUTS + QUICK ACTIONS ═════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.44 + i * 0.05 }}
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-gray-600" />
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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 }}
            className="lg:col-span-2 rounded-[28px] border border-white/[0.07] bg-[#0f0c1f] p-6"
          >
            <h3 className="font-bold text-white text-sm mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Plus,
                  label: "Log Workout",
                  color: "violet" as CK,
                  onClick: () => router.push("/fitness"),
                },
                {
                  icon: Droplets,
                  label: "Add Water",
                  color: "cyan" as CK,
                  onClick: () =>
                    updateWaterIntake(data.waterIntake.consumed + 1),
                },
                {
                  icon: Clock,
                  label: "Start Focus",
                  color: "indigo" as CK,
                  onClick: () => router.push("/focus"),
                },
                {
                  icon: TrendingUp,
                  label: "View Reports",
                  color: "emerald" as CK,
                  onClick: () => router.push("/reports"),
                },
              ].map((a, i) => (
                <motion.button
                  key={i}
                  onClick={a.onClick}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] transition-colors p-4 min-h-[90px]"
                >
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${grad[a.color]} shadow-lg`}
                  >
                    <a.icon className="w-4 h-4 text-white" />
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

/* ─── StatCard ───────────────────────────────────────────────────── */
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
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-[24px] border border-white/[0.07] bg-[#0f0c1f] p-5 flex flex-col gap-3"
    >
      {/* icon row */}
      <div className="flex items-center justify-between">
        <div
          className={`p-2.5 rounded-xl bg-gradient-to-br ${grad[color]} shadow-md w-fit`}
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

      {/* label */}
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </p>

      {/* value */}
      <div className="flex items-end gap-1">
        <span className="text-[2.1rem] font-black leading-none text-white tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-500 pb-0.5 font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* sub */}
      <p className="text-[11px] text-gray-500 truncate">{sub}</p>

      {/* progress bar */}
      {progress !== undefined && (
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mt-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full bg-gradient-to-r ${grad[color]}`}
          />
        </div>
      )}
    </motion.div>
  );
}
