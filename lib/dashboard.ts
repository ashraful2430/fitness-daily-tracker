import type { DashboardData, WeeklyStat, Workout } from "@/types/dashboard";

type WorkoutDoc = {
  _id: { toString(): string } | string;
  userId?: { toString(): string } | string;
  title: string;
  duration: number;
  calories?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const DEFAULT_WEEKLY_GOAL = 5;
const DAYS_IN_WEEK = 7;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getDayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function formatDay(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function mapWorkout(workout: WorkoutDoc): Workout {
  return {
    _id: String(workout._id),
    userId: String(workout.userId ?? ""),
    exercise: workout.title,
    duration: workout.duration,
    calories: workout.calories ?? 0,
    createdAt: asDate(workout.createdAt).toISOString(),
    updatedAt: asDate(workout.updatedAt).toISOString(),
  };
}

export function buildWeeklyStats(workouts: WorkoutDoc[], now = new Date()) {
  const today = startOfDay(now);
  const totals = new Map<string, number>();

  for (const workout of workouts) {
    const createdAt = startOfDay(asDate(workout.createdAt));
    const key = getDayKey(createdAt);
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  const stats: WeeklyStat[] = [];

  for (let offset = DAYS_IN_WEEK - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const key = getDayKey(date);

    stats.push({
      date: key,
      day: formatDay(date),
      workouts: totals.get(key) ?? 0,
      focusMinutes: 0,
    });
  }

  return stats;
}

export function calculateWorkoutStreak(workouts: WorkoutDoc[], now = new Date()) {
  const workoutDays = new Set(
    workouts.map((workout) => getDayKey(asDate(workout.createdAt))),
  );

  const orderedDays = Array.from(workoutDays).sort();
  let longest = 0;
  let runningLongest = 0;
  let previousDate: Date | null = null;

  for (const day of orderedDays) {
    const currentDate = new Date(`${day}T00:00:00.000Z`);

    if (!previousDate) {
      runningLongest = 1;
    } else {
      const diffDays =
        (currentDate.getTime() - previousDate.getTime()) / 86_400_000;
      runningLongest = diffDays === 1 ? runningLongest + 1 : 1;
    }

    longest = Math.max(longest, runningLongest);
    previousDate = currentDate;
  }

  let current = 0;

  for (let offset = 0; ; offset += 1) {
    const key = getDayKey(addDays(startOfDay(now), -offset));
    if (!workoutDays.has(key)) {
      break;
    }
    current += 1;
  }

  return { current, longest };
}

export function buildDashboardData(workouts: WorkoutDoc[], now = new Date()) {
  const recentWorkouts = workouts
    .slice(0, 5)
    .map((workout) => mapWorkout(workout));
  const weeklyStats = buildWeeklyStats(workouts, now);
  const workoutStreak = calculateWorkoutStreak(workouts, now);
  const completedThisWeek = weeklyStats.reduce(
    (sum, stat) => sum + stat.workouts,
    0,
  );
  const weeklyGoalPercentage = Math.min(
    Math.round((completedThisWeek / DEFAULT_WEEKLY_GOAL) * 100),
    100,
  );

  const data: DashboardData = {
    workoutStreak,
    waterIntake: {
      consumed: 0,
      goal: 8,
      percentage: 0,
    },
    focusTime: {
      minutes: 0,
      hours: 0,
      sessionsCount: 0,
    },
    weeklyGoal: {
      completed: completedThisWeek,
      goal: DEFAULT_WEEKLY_GOAL,
      percentage: weeklyGoalPercentage,
    },
    todayScore: 0,
    recentWorkouts,
    weeklyStats,
    analytics: {
      perfectDays: 0,
      missedDays: 0,
      bestScore: 0,
      weeklyAverageScore: 0,
      productivityTrend: "stable",
    },
  };

  return data;
}
