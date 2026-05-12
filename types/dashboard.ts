// frontend/types/dashboard.ts

export interface Workout {
  _id: string;
  userId: string;
  exercise: string;
  duration: number;
  calories?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyStat {
  date: string;
  day: string;
  workouts: number;
  focusMinutes: number;
}

export interface DashboardAnalytics {
  perfectDays: number;
  missedDays: number;
  bestScore: number;
  weeklyAverageScore: number;
  productivityTrend: "up" | "down" | "stable";
}

export interface DashboardData {
  workoutStreak: {
    current: number;
    longest: number;
  };
  waterIntake: {
    consumed: number;
    goal: number;
    percentage: number;
  };
  focusTime: {
    minutes: number;
    hours: number;
    sessionsCount: number;
  };
  weeklyGoal: {
    completed: number;
    goal: number;
    percentage: number;
  };
  todayScore: number;
  recentWorkouts: Workout[];
  weeklyStats: WeeklyStat[];
  analytics: DashboardAnalytics;
}

export interface DashboardEnvelope<T> {
  success: boolean;
  message?: string;
  field?: string;
  data?: T;
  pagination?: unknown;
}

export interface WaterPayload {
  glassesConsumed: number;
}

export interface FocusPayload {
  startTime: string;
  endTime: string;
  category: string;
}

export interface WeeklyGoalPayload {
  completedWorkouts: number;
  goalWorkouts: number;
}

export interface WeeklyStatsPayload {
  dailyStats: Array<{ workouts: number; focusMinutes: number }>;
}
