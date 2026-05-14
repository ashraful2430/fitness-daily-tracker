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
import {
  detectCurrencyCode,
  formatCurrencyByLocale,
  getBrowserLocale,
  getBrowserTimeZone,
} from "@/lib/currency";

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function normalizeDateKey(value: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function trendStyle(trend: TrendDirection) {
  if (trend === "up") {
    return "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200";
  }
  if (trend === "down") {
    return "border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200";
  }
  return "border-slate-300/70 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300";
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
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_16px_36px_rgba(14,165,233,0.10)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/20 dark:hover:border-cyan-500/40">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-cyan-100 group-hover:text-cyan-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-cyan-500/15 dark:group-hover:text-cyan-200">
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
    learningStats,
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

  const locale = getBrowserLocale();
  const currency = detectCurrencyCode(locale, getBrowserTimeZone());
  const formatCurrency = (value: number) =>
    formatCurrencyByLocale(value, locale, currency);
  const displayBalance = actualAvailableBalance ?? dashboard.kpis.availableBalance;
  const isSelectedCurrentMonth =
    monthlyOverview.selectedMonth.month === new Date().getMonth() + 1 &&
    monthlyOverview.selectedMonth.year === new Date().getFullYear();
  const monthlySavings = isSelectedCurrentMonth
    ? displayBalance
    : monthlyOverview.money.availableBalanceEndOfMonth;
  const spentRate =
    monthlyOverview.money.income > 0
      ? (monthlyOverview.money.expense / monthlyOverview.money.income) * 100
      : 0;
  const todayLearningMinutes = learningStats?.todayMinutes ?? 0;
  const weekLearningMinutes = learningStats?.weekMinutes ?? 0;
  const learningCompletionRate = learningStats?.completionRate ?? 0;
  const learningActiveSessions = learningStats?.activeSessions ?? 0;
  const combinedLearningFocusToday =
    dashboard.moduleOverview.learning.todayFocusMinutes + todayLearningMinutes;
  const learningByDate = new Map(
    (learningStats?.dailyBreakdown ?? []).map((item) => [
      normalizeDateKey(item.date),
      {
        learningMinutes: item.totalMinutes,
        learningSessions: item.completedSessions ?? item.plannedSessions ?? 0,
      },
    ]),
  );

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
        { label: "Today Learning", value: `${todayLearningMinutes} min` },
        { label: "Week Learning", value: `${weekLearningMinutes} min` },
        { label: "Today Focus", value: `${dashboard.moduleOverview.learning.todayFocusMinutes} min` },
        { label: "Completion", value: `${learningCompletionRate}%` },
      ],
      trend: dashboard.moduleOverview.learning.trend,
      note: `${combinedLearningFocusToday} min combined today${learningActiveSessions ? ` | ${learningActiveSessions} active` : ""}`,
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

  const weeklyData = (weeklyInsight ?? dashboard.weeklyStats).map((item) => {
    const learning = learningByDate.get(normalizeDateKey(item.date));
    return {
      ...item,
      learningMinutes: item.learningMinutes ?? learning?.learningMinutes ?? 0,
      learningSessions: item.learningSessions ?? learning?.learningSessions ?? 0,
    };
  });
  const monthlySeriesWithLearning = monthlyOverview.dailySeries.map((item) => {
    const learning = learningByDate.get(normalizeDateKey(item.date));
    return {
      ...item,
      learningMinutes: item.learningMinutes ?? learning?.learningMinutes ?? 0,
      learningSessions: item.learningSessions ?? learning?.learningSessions ?? 0,
    };
  });
  const monthlyLearningTotalFromSeries = monthlySeriesWithLearning.reduce(
    (sum, item) => sum + (item.learningMinutes ?? 0),
    0,
  );
  const monthlyLearningTotal =
    monthlyOverview.productivity.totalLearningMinutes ??
    (isSelectedCurrentMonth ? learningStats?.monthMinutes ?? monthlyLearningTotalFromSeries : monthlyLearningTotalFromSeries);
  const monthlyLearningSessions =
    monthlyOverview.productivity.totalLearningSessions ??
    monthlySeriesWithLearning.reduce((sum, item) => sum + (item.learningSessions ?? 0), 0);

  return (
    <main className="relative space-y-5 overflow-hidden bg-slate-50 px-4 py-5 dark:bg-[#08111f] sm:px-6 lg:px-8">
      <section className="relative z-10 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-950">
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
          title="Learning / Focus Today"
          value={`${combinedLearningFocusToday} min`}
          subtitle={`${todayLearningMinutes} learning + ${dashboard.kpis.focusToday.minutes} focus`}
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
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition dark:border-slate-700/80 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white">Daily Progress</p>
            <p className="text-sm font-semibold text-slate-500">{dashboard.dailyProgress.percentage}%</p>
          </div>
          <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500"
              style={{ width: `${Math.max(0, Math.min(dashboard.dailyProgress.percentage, 100))}%` }}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Breakdown label="Login" data={dashboard.dailyProgress.breakdown.login} detail={dashboard.dailyProgress.breakdown.login.completed ? "Done" : "Not completed"} />
            <Breakdown label="Learning / Focus" data={dashboard.dailyProgress.breakdown.focus} detail={`${combinedLearningFocusToday}/${dashboard.dailyProgress.breakdown.focus.targetMinutes} min combined`} />
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

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white">Recent Activities</p>
            <CalendarRange className="h-5 w-5 text-slate-500" />
          </div>
          <div className="space-y-2">
            {dashboard.recentActivities.length ? (
              dashboard.recentActivities.slice(0, 6).map((activity, index) => (
                <div key={`act-${index}`} className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
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
          <article key={module.key} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_14px_36px_rgba(14,165,233,0.10)] dark:border-slate-700/80 dark:bg-slate-900 dark:hover:border-cyan-500/40">
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">{module.title}</p>
              <TrendPill trend={module.trend} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {module.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                  <p className="text-[11px] uppercase text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>
            {"note" in module && module.note ? (
              <p className="mt-3 rounded-xl border border-cyan-200/70 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                {module.note}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={module.route} className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
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

      <section className="relative z-10 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
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
        <div className="h-72 rounded-2xl border border-slate-200/80 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950/55">
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
              <Line yAxisId="right" type="monotone" dataKey="learningMinutes" name="Learning Minutes" stroke="#a855f7" strokeWidth={2.8} />
              <Line yAxisId="left" type="monotone" dataKey="moneyActivities" name="Money Activity" stroke="#22c55e" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="relative z-10 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
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
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-cyan-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        {overviewLoading ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-950/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing month overview...
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-4 shadow-sm dark:border-emerald-500/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Money Summary</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Savings matches the available balance shown on the Money page.
                </p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                {monthlyOverview.selectedMonth.label}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.15fr_1fr]">
              <div className="rounded-2xl border border-emerald-200/80 bg-white/85 p-4 dark:border-emerald-500/30 dark:bg-slate-950/60">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Savings</p>
                <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{formatCurrency(monthlySavings)}</p>
              </div>

              <div className="grid gap-3">
                <MoneyMetric label="Income" value={formatCurrency(monthlyOverview.money.income)} tone="income" />
                <MoneyMetric label="Expense" value={formatCurrency(monthlyOverview.money.expense)} tone="expense" />
                <MoneyMetric label="Spent Rate" value={`${spentRate.toFixed(1)}%`} tone="neutral" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-950/45">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Productivity Summary</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Compared with {monthlyOverview.comparison.previousMonth.label}.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MetricTile label="Avg Daily Score" value={`${monthlyOverview.productivity.averageDailyScore}%`} />
              <MetricTile label="Total Focus" value={`${monthlyOverview.productivity.totalFocusMinutes} min`} />
              <MetricTile label="Total Learning" value={`${monthlyLearningTotal} min`} />
              <MetricTile label="Learning Sessions" value={`${monthlyLearningSessions}`} />
              <MetricTile label="Total Workouts" value={`${monthlyOverview.productivity.totalWorkouts}`} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ComparisonLine label="Income" value={monthlyOverview.comparison.incomePct} />
              <ComparisonLine label="Expense" value={monthlyOverview.comparison.expensePct} />
              <ComparisonLine label="Savings" value={monthlyOverview.comparison.savingsPct} />
              <ComparisonLine label="Focus" value={monthlyOverview.comparison.focusPct} />
              <ComparisonLine label="Workouts" value={monthlyOverview.comparison.workoutsPct} />
              <ComparisonLine label="Score" value={monthlyOverview.comparison.scorePct} />
            </div>
          </div>
        </div>

        <div className="mt-4 h-80 rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/55">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlySeriesWithLearning}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(8)} />
              <YAxis yAxisId="money" />
              <YAxis yAxisId="activity" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="money" dataKey="income" name="Income" fill="#16a34a" />
              <Bar yAxisId="money" dataKey="expense" name="Expense" fill="#ef4444" />
              <Line yAxisId="activity" dataKey="focusMinutes" name="Focus Minutes" stroke="#0ea5e9" strokeWidth={2.2} />
              <Line yAxisId="activity" dataKey="learningMinutes" name="Learning Minutes" stroke="#a855f7" strokeWidth={2.2} />
              <Line yAxisId="activity" dataKey="score" name="Score" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="relative z-10 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
        <p className="mb-3 text-lg font-black text-slate-900 dark:text-white">Monthly History</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {monthlyHistory.map((month) => (
            <button
              key={`${month.year}-${month.month}`}
              onClick={() => void setSelectedMonth(`${month.year}-${String(month.month).padStart(2, "0")}`)}
              className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-cyan-500/40 dark:hover:bg-slate-950"
            >
              <p className="text-sm font-black text-slate-900 dark:text-white">{month.label}</p>
              <p className="mt-2 text-xs text-slate-500">Income {formatCurrency(month.income)} | Expense {formatCurrency(month.expense)}</p>
              <p className="text-xs text-slate-500">Focus {month.totalFocusMinutes} min | Learning {month.totalLearningMinutes ?? (isSelectedCurrentMonth && month.month === monthlyOverview.selectedMonth.month && month.year === monthlyOverview.selectedMonth.year ? monthlyLearningTotal : 0)} min</p>
              <p className="text-xs text-slate-500">Workouts {month.totalWorkouts} | Learning sessions {month.totalLearningSessions ?? 0}</p>
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
    <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
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

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900/80">
      <p className="text-[11px] uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-base font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function MoneyMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "neutral";
}) {
  const color =
    tone === "income"
      ? "text-emerald-700 dark:text-emerald-200"
      : tone === "expense"
        ? "text-rose-700 dark:text-rose-200"
        : "text-slate-900 dark:text-white";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-950/55">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

function ComparisonLine({ label, value }: { label: string; value: number }) {
  if (value === 0) {
    return (
      <p className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-bold">0.0%</span>
      </p>
    );
  }

  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <p className={`inline-flex items-center gap-1 ${up ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-bold">{formatPercent(value)}</span>
    </p>
  );
}
