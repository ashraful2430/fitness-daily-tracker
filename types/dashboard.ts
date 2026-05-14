export type TrendDirection = "up" | "down" | "stable";

export interface DashboardKpis {
  loginStreak: {
    current: number;
    longest: number;
    lastLoginDate: string | null;
  };
  availableBalance: number;
  focusToday: {
    minutes: number;
    sessionsCount: number;
  };
  workoutsToday: {
    count: number;
    totalDuration: number;
    totalCalories: number;
  };
  todayScore: number;
}

export interface DailyProgressBreakdownItem {
  earned: number;
  max: number;
  completed: boolean;
}

export interface DashboardDailyProgress {
  percentage: number;
  breakdown: {
    login: DailyProgressBreakdownItem;
    focus: DailyProgressBreakdownItem & {
      minutes: number;
      targetMinutes: number;
    };
    workout: DailyProgressBreakdownItem & {
      count: number;
      targetCount: number;
    };
    sections: DailyProgressBreakdownItem & {
      completedSections: number;
      totalSections: number;
    };
  };
  missing: string[];
}

export interface DashboardModuleOverview {
  fitness: {
    weeklyWorkouts: number;
    todayWorkouts: number;
    trend: TrendDirection;
  };
  learning: {
    weeklyFocusMinutes: number;
    todayFocusMinutes: number;
    trend: TrendDirection;
  };
  money: {
    availableBalance: number;
    monthIncome: number;
    monthExpense: number;
    trend: TrendDirection;
  };
  loans: {
    activeLoans: number;
    activeLendings: number;
    trend: TrendDirection;
  };
  sections: {
    completedToday: number;
    totalToday: number;
    trend: TrendDirection;
  };
}

export interface DashboardActivity {
  [key: string]: unknown;
}

export interface WeeklyStat {
  date: string;
  day: string;
  workouts: number;
  focusMinutes: number;
  learningMinutes: number;
  learningSessions: number;
  completedLearningSessions: number;
  moneyActivities: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  dailyProgress: DashboardDailyProgress;
  moduleOverview: DashboardModuleOverview;
  recentActivities: DashboardActivity[];
  weeklyStats: WeeklyStat[];
}

export interface WeeklyStatsMeta {
  weekStartRule: string;
  timezone: string;
}

export interface DashboardMonthlyOverview {
  selectedMonth: {
    month: number;
    year: number;
    label: string;
  };
  money: {
    income: number;
    expense: number;
    savings: number;
    netBalanceChange: number;
    availableBalanceEndOfMonth: number;
  };
  productivity: {
    averageDailyScore: number;
    totalFocusMinutes: number;
    totalLearningMinutes: number;
    totalLearningSessions: number;
    completedLearningSessions: number;
    totalWorkouts: number;
  };
  comparison: {
    previousMonth: {
      month: number;
      year: number;
      label: string;
    };
    incomePct: number;
    expensePct: number;
    savingsPct: number;
    focusPct: number;
    workoutsPct: number;
    scorePct: number;
  };
  dailySeries: Array<{
    date: string;
    income: number;
    expense: number;
    focusMinutes: number;
    learningMinutes: number;
    learningSessions: number;
    workouts: number;
    score: number;
  }>;
}

export interface DashboardMonthlyHistoryItem {
  month: number;
  year: number;
  label: string;
  income: number;
  expense: number;
  savings: number;
  netBalanceChange: number;
  averageDailyScore: number;
  totalFocusMinutes: number;
  totalLearningMinutes: number;
  totalLearningSessions: number;
  completedLearningSessions: number;
  totalWorkouts: number;
}

export interface DashboardEnvelope<T, M = undefined> {
  success: boolean;
  message?: string;
  field?: string;
  data?: T;
  meta?: M;
}
