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
  [key: string]: unknown;
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
