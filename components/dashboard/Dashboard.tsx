"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Droplets,
  Flame,
  Gauge,
  Loader2,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardSkeleton from "./DashboardSkeleton";
import { useDashboard } from "@/hooks/useDashboard";
import type { WeeklyStat } from "@/types/dashboard";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function trendBadge(trend: "up" | "down" | "stable") {
  if (trend === "up") {
    return {
      label: "Up",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
      icon: TrendingUp,
    };
  }

  if (trend === "down") {
    return {
      label: "Down",
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
      icon: TrendingDown,
    };
  }

  return {
    label: "Stable",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-300",
    icon: Waves,
  };
}

function Card({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  progress?: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121026]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
          <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </p>
      </div>

      <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>

      {progress !== undefined ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Progress</span>
            <span>{Math.min(Math.max(progress, 0), 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Dashboard() {
  const {
    data,
    weeklyStats,
    loading,
    error,
    refresh,
    mutationLoading,
    updateWaterIntake,
    logFocusSession,
    updateWeeklyGoal,
    updateWeeklyStats,
  } = useDashboard();

  const [glassesConsumed, setGlassesConsumed] = useState(0);
  const [focusStart, setFocusStart] = useState("");
  const [focusEnd, setFocusEnd] = useState("");
  const [focusCategory, setFocusCategory] = useState("Deep Work");
  const [goalCompleted, setGoalCompleted] = useState(0);
  const [goalTarget, setGoalTarget] = useState(5);
  const [editWeekly, setEditWeekly] = useState(false);
  const [weeklyDraft, setWeeklyDraft] = useState<WeeklyStat[]>([]);

  const chartData = useMemo(() => weeklyStats ?? [], [weeklyStats]);

  const maxWorkout = useMemo(
    () => Math.max(...(chartData.map((d) => d.workouts) || [0]), 1),
    [chartData],
  );

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">
            {error}
          </p>
          <button
            onClick={() => void refresh()}
            className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/20 dark:bg-[#121026]">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
            No dashboard data found for this user yet.
          </p>
          <button
            onClick={() => void refresh()}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-slate-200 dark:text-slate-900"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const trend = trendBadge(data.analytics.productivityTrend);
  const TrendIcon = trend.icon;

  const onWaterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateWaterIntake(Number(glassesConsumed));
  };

  const onFocusSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!focusStart || !focusEnd || !focusCategory.trim()) return;
    await logFocusSession(new Date(focusStart), new Date(focusEnd), focusCategory);
    setFocusStart("");
    setFocusEnd("");
  };

  const onGoalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateWeeklyGoal(Number(goalCompleted), Number(goalTarget));
  };

  const startWeeklyEditor = () => {
    setWeeklyDraft(chartData.map((item) => ({ ...item })));
    setEditWeekly(true);
  };

  const submitWeeklyEditor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateWeeklyStats(
      weeklyDraft.map((d) => ({
        workouts: Number(d.workouts) || 0,
        focusMinutes: Number(d.focusMinutes) || 0,
      })),
    );
    setEditWeekly(false);
  };

  return (
    <main className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Workout Streak"
          value={`${data.workoutStreak.current}`}
          subtitle={`Longest: ${data.workoutStreak.longest}`}
          icon={Flame}
        />
        <Card
          title="Water Intake"
          value={`${data.waterIntake.consumed}/${data.waterIntake.goal}`}
          subtitle="Glasses today"
          icon={Droplets}
          progress={data.waterIntake.percentage}
        />
        <Card
          title="Focus Time"
          value={`${formatNumber(data.focusTime.minutes)}m`}
          subtitle={`${data.focusTime.hours}h • ${data.focusTime.sessionsCount} sessions`}
          icon={Timer}
        />
        <Card
          title="Weekly Goal"
          value={`${data.weeklyGoal.completed}/${data.weeklyGoal.goal}`}
          subtitle="Workout target"
          icon={Target}
          progress={data.weeklyGoal.percentage}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121026]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Today Score
              </p>
              <p className="text-5xl font-black text-slate-950 dark:text-white">
                {data.todayScore}%
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
              <Gauge className="h-7 w-7 text-slate-700 dark:text-slate-200" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Combined from water, focus, workout streak, and weekly goal.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121026]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Analytics
              </p>
              <p className="text-xl font-black text-slate-950 dark:text-white">
                Weekly Insight
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${trend.className}`}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {trend.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-slate-500">Perfect Days</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {data.analytics.perfectDays}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-slate-500">Missed Days</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {data.analytics.missedDays}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-slate-500">Best Score</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {data.analytics.bestScore}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-slate-500">Weekly Avg</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {data.analytics.weeklyAverageScore}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121026]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white">
              Recent Workouts
            </p>
            <Activity className="h-5 w-5 text-slate-500" />
          </div>
          {data.recentWorkouts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
              No workouts yet for this user.
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentWorkouts.map((workout) => (
                <div
                  key={workout._id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {workout.exercise}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateLabel(workout.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {workout.duration}m / {workout.calories ?? 0} cal
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121026]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white">
              Weekly Stats
            </p>
            <button
              onClick={startWeeklyEditor}
              className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/20 dark:text-slate-200"
            >
              Edit Week
            </button>
          </div>
          {chartData.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
              Weekly stats are empty.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" domain={[0, maxWorkout + 1]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="workouts"
                    fill="#0ea5e9"
                    radius={[8, 8, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    dataKey="focusMinutes"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121026]">
        <p className="mb-4 text-lg font-black text-slate-900 dark:text-white">
          Update Dashboard
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <form onSubmit={(e) => void onWaterSubmit(e)} className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Water Intake
            </label>
            <input
              type="number"
              min={0}
              value={glassesConsumed}
              onChange={(e) => setGlassesConsumed(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
            />
            <button
              type="submit"
              disabled={mutationLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Water
            </button>
          </form>

          <form onSubmit={(e) => void onFocusSubmit(e)} className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Focus Logger
            </label>
            <input
              type="datetime-local"
              value={focusStart}
              onChange={(e) => setFocusStart(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
            />
            <input
              type="datetime-local"
              value={focusEnd}
              onChange={(e) => setFocusEnd(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
            />
            <input
              value={focusCategory}
              onChange={(e) => setFocusCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
              placeholder="Category"
            />
            <button
              type="submit"
              disabled={mutationLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Log Focus
            </button>
          </form>

          <form onSubmit={(e) => void onGoalSubmit(e)} className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Weekly Goal
            </label>
            <input
              type="number"
              min={0}
              value={goalCompleted}
              onChange={(e) => setGoalCompleted(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
              placeholder="Completed workouts"
            />
            <input
              type="number"
              min={1}
              value={goalTarget}
              onChange={(e) => setGoalTarget(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
              placeholder="Goal workouts"
            />
            <button
              type="submit"
              disabled={mutationLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Goal
            </button>
          </form>
        </div>
      </section>

      {editWeekly ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121026]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white">
              Weekly Stats Editor
            </p>
            <button
              onClick={() => setEditWeekly(false)}
              className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/20 dark:text-slate-200"
            >
              Close
            </button>
          </div>
          <form onSubmit={(e) => void submitWeeklyEditor(e)} className="space-y-3">
            {weeklyDraft.map((row, index) => (
              <div
                key={`${row.date}-${index}`}
                className="grid grid-cols-[80px_1fr_1fr] items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5"
              >
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {row.day}
                </p>
                <input
                  type="number"
                  min={0}
                  value={row.workouts}
                  onChange={(e) => {
                    const next = [...weeklyDraft];
                    next[index] = { ...next[index], workouts: Number(e.target.value) };
                    setWeeklyDraft(next);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
                  aria-label={`${row.day} workouts`}
                />
                <input
                  type="number"
                  min={0}
                  value={row.focusMinutes}
                  onChange={(e) => {
                    const next = [...weeklyDraft];
                    next[index] = { ...next[index], focusMinutes: Number(e.target.value) };
                    setWeeklyDraft(next);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-white/20 dark:bg-[#0f0d1e]"
                  aria-label={`${row.day} focus minutes`}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={mutationLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60 dark:bg-slate-200 dark:text-slate-900"
            >
              {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Weekly Stats
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
