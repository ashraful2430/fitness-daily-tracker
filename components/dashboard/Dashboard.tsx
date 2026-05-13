"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  Flame,
  Gauge,
  Loader2,
  Timer,
  TrendingDown,
  TrendingUp,
  Wallet,
  Dumbbell,
  CircleDot,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardSkeleton from "./DashboardSkeleton";
import { useDashboard } from "@/hooks/useDashboard";
import type { TrendDirection } from "@/types/dashboard";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function trendStyle(trend: TrendDirection) {
  if (trend === "up") {
    return "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200";
  }
  if (trend === "down") {
    return "border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200";
  }
  return "border-slate-300/70 bg-slate-100 text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-slate-300";
}

function TrendPill({ trend }: { trend: TrendDirection }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${trendStyle(trend)}`}>
      {trend}
    </span>
  );
}

function KPI({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <article className="group rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_16px_40px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-[#121026]/90 dark:hover:border-cyan-400/30 dark:hover:shadow-[0_16px_50px_rgba(6,182,212,0.2)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-cyan-100 group-hover:text-cyan-700 dark:bg-white/10 dark:text-slate-200 dark:group-hover:bg-cyan-500/20 dark:group-hover:text-cyan-200">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </article>
  );
}

export default function Dashboard() {
  const {
    dashboard,
    monthlyOverview,
    monthlyHistory,
    monthOptions,
    selectedMonth,
    setSelectedMonth,
    weeklyInsight,
    weeklyMeta,
    weeklyLoading,
    loading,
    overviewLoading,
    error,
    refresh,
    loadWeeklyDetails,
    actualAvailableBalance,
  } = useDashboard();

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">{error}</p>
          <button
            onClick={() => void refresh()}
            className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard || !monthlyOverview) return null;

  const displayBalance = actualAvailableBalance ?? dashboard.kpis.availableBalance;

  const modules = [
    {
      key: "fitness",
      title: "Fitness / Workouts",
      route: "/fitness",
      quick: "Add Workout",
      quickRoute: "/fitness",
      metrics: [
        { label: "Weekly", value: `${dashboard.moduleOverview.fitness.weeklyWorkouts}` },
        { label: "Today", value: `${dashboard.moduleOverview.fitness.todayWorkouts}` },
      ],
      trend: dashboard.moduleOverview.fitness.trend,
    },
    {
      key: "learning",
      title: "Learning / Focus",
      route: "/learning",
      quick: "Log Session",
      quickRoute: "/learning",
      metrics: [
        { label: "Weekly Focus", value: `${dashboard.moduleOverview.learning.weeklyFocusMinutes} min` },
        { label: "Today Focus", value: `${dashboard.moduleOverview.learning.todayFocusMinutes} min` },
      ],
      trend: dashboard.moduleOverview.learning.trend,
    },
    {
      key: "money",
      title: "Money / Finance",
      route: "/money",
      quick: "Add Expense",
      quickRoute: "/money",
      metrics: [
        { label: "Balance", value: formatCurrency(displayBalance) },
        { label: "Income", value: formatCurrency(dashboard.moduleOverview.money.monthIncome) },
        { label: "Expense", value: formatCurrency(dashboard.moduleOverview.money.monthExpense) },
      ],
      trend: dashboard.moduleOverview.money.trend,
    },
    {
      key: "loans",
      title: "Loans / Lending",
      route: "/lending",
      quick: "Open Lending",
      quickRoute: "/lending",
      metrics: [
        { label: "Active Loans", value: `${dashboard.moduleOverview.loans.activeLoans}` },
        { label: "Active Lendings", value: `${dashboard.moduleOverview.loans.activeLendings}` },
      ],
      trend: dashboard.moduleOverview.loans.trend,
    },
    {
      key: "sections",
      title: "Score Sections",
      route: "/habits",
      quick: "Update Sections",
      quickRoute: "/habits",
      metrics: [
        { label: "Done", value: `${dashboard.moduleOverview.sections.completedToday}` },
        { label: "Total", value: `${dashboard.moduleOverview.sections.totalToday}` },
      ],
      trend: dashboard.moduleOverview.sections.trend,
    },
  ];

  const weeklyData = weeklyInsight ?? dashboard.weeklyStats;

  return (
    <main className="relative space-y-5 overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-indigo-500/10" />

      <section className="relative z-10 rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-5 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-[#101225] dark:via-[#121026] dark:to-[#0d1b2a]">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Command Center</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Live overview across fitness, learning, finance, and daily execution.</p>
      </section>

      <section className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPI
          title="Login Streak"
          value={`${dashboard.kpis.loginStreak.current} days`}
          subtitle={`Longest streak ${dashboard.kpis.loginStreak.longest} days`}
          icon={Flame}
        />
        <KPI
          title="Available Balance"
          value={formatCurrency(displayBalance)}
          subtitle="Synced with Money page source"
          icon={Wallet}
        />
        <KPI
          title="Focus Time Today"
          value={`${dashboard.kpis.focusToday.minutes} min`}
          subtitle={`${dashboard.kpis.focusToday.sessionsCount} session(s)`}
          icon={Timer}
        />
        <KPI
          title="Workout Summary"
          value={`${dashboard.kpis.workoutsToday.count} done`}
          subtitle={`${dashboard.kpis.workoutsToday.totalDuration} min | ${dashboard.kpis.workoutsToday.totalCalories} cal`}
          icon={Dumbbell}
        />
        <KPI title="Today Score" value={`${dashboard.kpis.todayScore}%`} subtitle="Backend dynamic score" icon={Gauge} />
      </section>

      <section className="relative z-10 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition dark:border-white/10 dark:bg-[#121026]/90">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white">Daily Progress</p>
            <p className="text-sm font-semibold text-slate-500">{dashboard.dailyProgress.percentage}%</p>
          </div>
          <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
              style={{ width: `${Math.max(0, Math.min(dashboard.dailyProgress.percentage, 100))}%` }}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Breakdown label="Login" data={dashboard.dailyProgress.breakdown.login} detail={dashboard.dailyProgress.breakdown.login.completed ? "Done" : "Not completed"} />
            <Breakdown label="Focus" data={dashboard.dailyProgress.breakdown.focus} detail={`${dashboard.dailyProgress.breakdown.focus.minutes}/${dashboard.dailyProgress.breakdown.focus.targetMinutes} min`} />
            <Breakdown label="Workout" data={dashboard.dailyProgress.breakdown.workout} detail={`${dashboard.dailyProgress.breakdown.workout.count}/${dashboard.dailyProgress.breakdown.workout.targetCount} workout`} />
            <Breakdown label="Sections" data={dashboard.dailyProgress.breakdown.sections} detail={`${dashboard.dailyProgress.breakdown.sections.completedSections}/${dashboard.dailyProgress.breakdown.sections.totalSections} sections`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboard.dailyProgress.missing.length ? (
              dashboard.dailyProgress.missing.map((item) => (
                <span key={item} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  {item}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                100% completed today
              </span>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-[#121026]/90">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white">Recent Activities</p>
            <CalendarRange className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-2">
            {dashboard.recentActivities.length ? (
              dashboard.recentActivities.slice(0, 6).map((activity, index) => (
                <div key={`act-${index}`} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Activity #{index + 1}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{JSON.stringify(activity)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
                No recent activity available.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="relative z-10 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {modules.map((module) => (
          <article key={module.key} className="group rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_14px_40px_rgba(14,165,233,0.1)] dark:border-white/10 dark:bg-[#121026]/90 dark:hover:border-cyan-400/30 dark:hover:shadow-[0_16px_45px_rgba(8,145,178,0.24)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">{module.title}</p>
              <TrendPill trend={module.trend} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {module.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] uppercase text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={module.route} className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                Go to {module.title.split("/")[0].trim()}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {module.quick ? (
                <Link href={module.quickRoute ?? module.route} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-white/20 dark:text-slate-200 dark:hover:border-cyan-300 dark:hover:text-cyan-200">
                  {module.quick}
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="relative z-10 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-[#121026]/90">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white">Weekly Insight (Read-only)</p>
            {weeklyMeta ? (
              <p className="text-xs text-slate-500">{weeklyMeta.weekStartRule} | {weeklyMeta.timezone}</p>
            ) : (
              <p className="text-xs text-slate-500">Using dashboard snapshot data</p>
            )}
          </div>
          <button
            onClick={() => void loadWeeklyDetails()}
            disabled={weeklyLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-white/20 dark:text-slate-200 dark:hover:border-cyan-300 dark:hover:text-cyan-200"
          >
            {weeklyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CircleDot className="h-3.5 w-3.5" />}
            Load Detailed Weekly
          </button>
        </div>
        <div className="h-72 rounded-2xl border border-slate-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-[#0b1222]/60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="workouts" name="Workouts" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="focusMinutes" name="Focus Minutes" stroke="#f97316" strokeWidth={2.8} />
              <Line yAxisId="left" type="monotone" dataKey="moneyActivities" name="Money Activity" stroke="#22c55e" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="relative z-10 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-[#121026]/90">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white">Monthly Overview</p>
            <p className="text-sm text-slate-500">{monthlyOverview.selectedMonth.label}</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => {
              void setSelectedMonth(e.target.value);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-cyan-400 focus:outline-none dark:border-white/20 dark:bg-[#0f0d1e] dark:text-slate-100"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        {overviewLoading ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/5">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing month overview...
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Money Summary</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DataLine label="Income" value={formatCurrency(monthlyOverview.money.income)} />
              <DataLine label="Expense" value={formatCurrency(monthlyOverview.money.expense)} />
              <DataLine label="Savings" value={formatCurrency(monthlyOverview.money.savings)} />
              <DataLine label="Net Change" value={formatCurrency(monthlyOverview.money.netBalanceChange)} />
              <DataLine label="Balance (EOM)" value={formatCurrency(monthlyOverview.money.availableBalanceEndOfMonth)} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Productivity Summary</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DataLine label="Avg Daily Score" value={`${monthlyOverview.productivity.averageDailyScore}%`} />
              <DataLine label="Total Focus" value={`${monthlyOverview.productivity.totalFocusMinutes} min`} />
              <DataLine label="Total Workouts" value={`${monthlyOverview.productivity.totalWorkouts}`} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <ComparisonLine label="Income" value={monthlyOverview.comparison.incomePct} />
              <ComparisonLine label="Expense" value={monthlyOverview.comparison.expensePct} />
              <ComparisonLine label="Savings" value={monthlyOverview.comparison.savingsPct} />
              <ComparisonLine label="Focus" value={monthlyOverview.comparison.focusPct} />
              <ComparisonLine label="Workouts" value={monthlyOverview.comparison.workoutsPct} />
              <ComparisonLine label="Score" value={monthlyOverview.comparison.scorePct} />
            </div>
          </div>
        </div>

        <div className="mt-4 h-80 rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-[#0b1222]/60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyOverview.dailySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(8)} />
              <YAxis yAxisId="money" />
              <YAxis yAxisId="activity" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="money" dataKey="income" name="Income" fill="#16a34a" />
              <Bar yAxisId="money" dataKey="expense" name="Expense" fill="#ef4444" />
              <Line yAxisId="activity" dataKey="focusMinutes" name="Focus Minutes" stroke="#0ea5e9" strokeWidth={2.2} />
              <Line yAxisId="activity" dataKey="score" name="Score" stroke="#8b5cf6" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="relative z-10 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-[#121026]/90">
        <p className="mb-3 text-lg font-black text-slate-900 dark:text-white">Monthly History</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {monthlyHistory.map((month) => (
            <button
              key={`${month.year}-${month.month}`}
              onClick={() => void setSelectedMonth(`${month.year}-${String(month.month).padStart(2, "0")}`)}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-300/40 dark:hover:bg-white/10"
            >
              <p className="text-sm font-black text-slate-900 dark:text-white">{month.label}</p>
              <p className="mt-2 text-xs text-slate-500">Income {formatCurrency(month.income)} | Expense {formatCurrency(month.expense)}</p>
              <p className="text-xs text-slate-500">Focus {month.totalFocusMinutes} min | Workouts {month.totalWorkouts}</p>
              <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Score {month.averageDailyScore}%</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Breakdown({
  label,
  data,
  detail,
}: {
  label: string;
  data: { earned: number; max: number; completed: boolean };
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <span className={`text-[11px] font-bold ${data.completed ? "text-emerald-600 dark:text-emerald-300" : "text-slate-500"}`}>
          {data.completed ? "Done" : "Pending"}
        </span>
      </div>
      <p className="text-sm font-black text-slate-900 dark:text-white">{data.earned}/{data.max}</p>
      <p className="text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-slate-700 dark:text-slate-300">
      {label}: <span className="font-black">{value}</span>
    </p>
  );
}

function ComparisonLine({ label, value }: { label: string; value: number }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <p className={`inline-flex items-center gap-1 ${up ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-bold">{formatPercent(value)}</span>
    </p>
  );
}
