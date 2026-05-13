import type {
  DashboardData,
  DashboardEnvelope,
  DashboardMonthlyHistoryItem,
  DashboardMonthlyOverview,
  WeeklyStat,
  WeeklyStatsMeta,
} from "@/types/dashboard";

export class DashboardApiError extends Error {
  status: number;
  field?: string;

  constructor(message: string, status: number, field?: string) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
    this.field = field;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeWeeklyStat(value: unknown): WeeklyStat {
  const item = isRecord(value) ? value : {};
  return {
    date: toString(item.date),
    day: toString(item.day),
    workouts: toNumber(item.workouts),
    focusMinutes: toNumber(item.focusMinutes),
    moneyActivities: toNumber(item.moneyActivities),
  };
}

function normalizeWeeklyStats(value: unknown): WeeklyStat[] {
  return Array.isArray(value) ? value.map(normalizeWeeklyStat) : [];
}

function normalizeDashboardData(value: unknown): DashboardData {
  const raw = isRecord(value) ? value : {};
  const kpis = isRecord(raw.kpis) ? raw.kpis : {};
  const loginStreak = isRecord(kpis.loginStreak) ? kpis.loginStreak : {};

  const dailyProgress = isRecord(raw.dailyProgress) ? raw.dailyProgress : {};
  const breakdown = isRecord(dailyProgress.breakdown) ? dailyProgress.breakdown : {};
  const login = isRecord(breakdown.login) ? breakdown.login : {};
  const focus = isRecord(breakdown.focus) ? breakdown.focus : {};
  const workout = isRecord(breakdown.workout) ? breakdown.workout : {};
  const sections = isRecord(breakdown.sections) ? breakdown.sections : {};

  const moduleOverview = isRecord(raw.moduleOverview) ? raw.moduleOverview : {};
  const fitness = isRecord(moduleOverview.fitness) ? moduleOverview.fitness : {};
  const learning = isRecord(moduleOverview.learning) ? moduleOverview.learning : {};
  const money = isRecord(moduleOverview.money) ? moduleOverview.money : {};
  const loans = isRecord(moduleOverview.loans) ? moduleOverview.loans : {};
  const moduleSections = isRecord(moduleOverview.sections) ? moduleOverview.sections : {};

  return {
    kpis: {
      loginStreak: {
        current: toNumber(loginStreak.current),
        longest: toNumber(loginStreak.longest),
        lastLoginDate:
          loginStreak.lastLoginDate === null || typeof loginStreak.lastLoginDate === "string"
            ? loginStreak.lastLoginDate
            : null,
      },
      availableBalance: toNumber(kpis.availableBalance),
      focusToday: {
        minutes: toNumber(isRecord(kpis.focusToday) ? kpis.focusToday.minutes : undefined),
        sessionsCount: toNumber(
          isRecord(kpis.focusToday) ? kpis.focusToday.sessionsCount : undefined,
        ),
      },
      workoutsToday: {
        count: toNumber(isRecord(kpis.workoutsToday) ? kpis.workoutsToday.count : undefined),
        totalDuration: toNumber(
          isRecord(kpis.workoutsToday) ? kpis.workoutsToday.totalDuration : undefined,
        ),
        totalCalories: toNumber(
          isRecord(kpis.workoutsToday) ? kpis.workoutsToday.totalCalories : undefined,
        ),
      },
      todayScore: toNumber(kpis.todayScore),
    },
    dailyProgress: {
      percentage: toNumber(dailyProgress.percentage),
      breakdown: {
        login: {
          earned: toNumber(login.earned),
          max: toNumber(login.max, 20),
          completed: toBoolean(login.completed),
        },
        focus: {
          earned: toNumber(focus.earned),
          max: toNumber(focus.max, 25),
          completed: toBoolean(focus.completed),
          minutes: toNumber(focus.minutes),
          targetMinutes: toNumber(focus.targetMinutes, 120),
        },
        workout: {
          earned: toNumber(workout.earned),
          max: toNumber(workout.max, 25),
          completed: toBoolean(workout.completed),
          count: toNumber(workout.count),
          targetCount: toNumber(workout.targetCount, 1),
        },
        sections: {
          earned: toNumber(sections.earned),
          max: toNumber(sections.max, 30),
          completed: toBoolean(sections.completed),
          completedSections: toNumber(sections.completedSections),
          totalSections: toNumber(sections.totalSections),
        },
      },
      missing: Array.isArray(dailyProgress.missing)
        ? dailyProgress.missing.map((item) => toString(item)).filter(Boolean)
        : [],
    },
    moduleOverview: {
      fitness: {
        weeklyWorkouts: toNumber(fitness.weeklyWorkouts),
        todayWorkouts: toNumber(fitness.todayWorkouts),
        trend: fitness.trend === "up" || fitness.trend === "down" ? fitness.trend : "stable",
      },
      learning: {
        weeklyFocusMinutes: toNumber(learning.weeklyFocusMinutes),
        todayFocusMinutes: toNumber(learning.todayFocusMinutes),
        trend:
          learning.trend === "up" || learning.trend === "down" ? learning.trend : "stable",
      },
      money: {
        availableBalance: toNumber(money.availableBalance),
        monthIncome: toNumber(money.monthIncome),
        monthExpense: toNumber(money.monthExpense),
        trend: money.trend === "up" || money.trend === "down" ? money.trend : "stable",
      },
      loans: {
        activeLoans: toNumber(loans.activeLoans),
        activeLendings: toNumber(loans.activeLendings),
        trend: loans.trend === "up" || loans.trend === "down" ? loans.trend : "stable",
      },
      sections: {
        completedToday: toNumber(moduleSections.completedToday),
        totalToday: toNumber(moduleSections.totalToday),
        trend:
          moduleSections.trend === "up" || moduleSections.trend === "down"
            ? moduleSections.trend
            : "stable",
      },
    },
    recentActivities: Array.isArray(raw.recentActivities)
      ? raw.recentActivities.filter((item) => isRecord(item))
      : [],
    weeklyStats: Array.isArray(raw.weeklyStats) ? raw.weeklyStats.map(normalizeWeeklyStat) : [],
  };
}

function normalizeMonthlyOverview(value: unknown): DashboardMonthlyOverview {
  const raw = isRecord(value) ? value : {};
  const selectedMonth = isRecord(raw.selectedMonth) ? raw.selectedMonth : {};
  const money = isRecord(raw.money) ? raw.money : {};
  const productivity = isRecord(raw.productivity) ? raw.productivity : {};
  const comparison = isRecord(raw.comparison) ? raw.comparison : {};
  const previousMonth = isRecord(comparison.previousMonth) ? comparison.previousMonth : {};

  return {
    selectedMonth: {
      month: toNumber(selectedMonth.month),
      year: toNumber(selectedMonth.year),
      label: toString(selectedMonth.label),
    },
    money: {
      income: toNumber(money.income),
      expense: toNumber(money.expense),
      savings: toNumber(money.savings),
      netBalanceChange: toNumber(money.netBalanceChange),
      availableBalanceEndOfMonth: toNumber(money.availableBalanceEndOfMonth),
    },
    productivity: {
      averageDailyScore: toNumber(productivity.averageDailyScore),
      totalFocusMinutes: toNumber(productivity.totalFocusMinutes),
      totalWorkouts: toNumber(productivity.totalWorkouts),
    },
    comparison: {
      previousMonth: {
        month: toNumber(previousMonth.month),
        year: toNumber(previousMonth.year),
        label: toString(previousMonth.label),
      },
      incomePct: toNumber(comparison.incomePct),
      expensePct: toNumber(comparison.expensePct),
      savingsPct: toNumber(comparison.savingsPct),
      focusPct: toNumber(comparison.focusPct),
      workoutsPct: toNumber(comparison.workoutsPct),
      scorePct: toNumber(comparison.scorePct),
    },
    dailySeries: Array.isArray(raw.dailySeries)
      ? raw.dailySeries
          .map((item) => {
            const entry = isRecord(item) ? item : {};
            return {
              date: toString(entry.date),
              income: toNumber(entry.income),
              expense: toNumber(entry.expense),
              focusMinutes: toNumber(entry.focusMinutes),
              workouts: toNumber(entry.workouts),
              score: toNumber(entry.score),
            };
          })
          .filter((item) => !!item.date)
      : [],
  };
}

function normalizeMonthlyHistory(value: unknown): DashboardMonthlyHistoryItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const row = isRecord(item) ? item : {};
    return {
      month: toNumber(row.month),
      year: toNumber(row.year),
      label: toString(row.label),
      income: toNumber(row.income),
      expense: toNumber(row.expense),
      savings: toNumber(row.savings),
      netBalanceChange: toNumber(row.netBalanceChange),
      averageDailyScore: toNumber(row.averageDailyScore),
      totalFocusMinutes: toNumber(row.totalFocusMinutes),
      totalWorkouts: toNumber(row.totalWorkouts),
    };
  });
}

async function request<T, M = undefined>(
  endpoint: string,
  normalize: (value: unknown) => T,
  options: RequestInit = {},
): Promise<{ data: T; meta?: M }> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  const body = (await response.json().catch(() => null)) as DashboardEnvelope<unknown, M> | null;

  if (!response.ok || !body?.success) {
    throw new DashboardApiError(
      body?.message ?? "Request failed",
      response.status,
      body?.field,
    );
  }

  return {
    data: normalize(body.data),
    meta: body.meta,
  };
}

export async function getDashboard() {
  const result = await request("/api/proxy/dashboard", normalizeDashboardData);
  return result.data;
}

export async function getWeeklyStats() {
  const result = await request<WeeklyStat[], WeeklyStatsMeta>(
    "/api/proxy/dashboard/weekly-stats",
    normalizeWeeklyStats,
  );

  return {
    data: result.data,
    meta: result.meta,
  };
}

export async function getMonthlyOverview(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month !== undefined) params.set("month", String(month));
  if (year !== undefined) params.set("year", String(year));
  const search = params.toString();

  const result = await request(
    `/api/proxy/dashboard/monthly-overview${search ? `?${search}` : ""}`,
    normalizeMonthlyOverview,
  );

  return result.data;
}

export async function getMonthlyHistory(limit = 6) {
  const safeLimit = Math.max(1, Math.min(limit, 24));
  const result = await request(
    `/api/proxy/dashboard/monthly-history?limit=${safeLimit}`,
    normalizeMonthlyHistory,
  );

  return result.data;
}
