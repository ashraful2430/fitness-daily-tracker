"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { dashboardAPI, isUnauthorizedError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardData, WeeklyStat } from "@/types/dashboard";

type DashboardCache = {
  data: DashboardData;
  weeklyStats: WeeklyStat[];
  timestamp: number;
};

let cache: DashboardCache | null = null;
const CACHE_TTL = 60 * 1000;

function recalculateScore(data: DashboardData): number {
  const sections = [
    [Math.min(data.waterIntake.consumed / data.waterIntake.goal, 1), true],
    [Math.min(data.focusTime.minutes / 120, 1), true],
    [data.workoutStreak.current > 0 ? 1 : 0, true],
    [Math.min(data.weeklyGoal.percentage / 100, 1), true],
  ] as [number, boolean][];

  const active = sections.filter(([, enabled]) => enabled);
  const pointsPerSection = 100 / active.length;
  const total = active.reduce(
    (sum, [progress]) => sum + progress * pointsPerSection,
    0,
  );

  return Math.min(Math.round(total), 100);
}

export function useDashboard() {
  const { isAuthenticated, loading: authLoading, clearUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(cache?.data ?? null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>(
    cache?.weeklyStats ?? [],
  );
  const [loading, setLoading] = useState<boolean>(!cache);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const applyDashboardData = useCallback(
    (summary: DashboardData, stats: WeeklyStat[]) => {
      cache = {
        data: summary,
        weeklyStats: stats,
        timestamp: Date.now(),
      };

      if (!isMounted.current) return;

      setData(summary);
      setWeeklyStats(stats);
      setError(null);
    },
    [],
  );

  const clearDashboard = useCallback(() => {
    cache = null;

    if (!isMounted.current) return;

    setData(null);
    setWeeklyStats([]);
    setError(null);
    setLoading(false);
  }, []);

  const fetchDashboard = useCallback(
    async (force = false) => {
      if (authLoading) return;

      if (!isAuthenticated) {
        clearDashboard();
        return;
      }

      if (!force && cache && Date.now() - cache.timestamp < CACHE_TTL) {
        setData(cache.data);
        setWeeklyStats(cache.weeklyStats);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);

        const [summary, stats] = await Promise.all([
          dashboardAPI.getDashboard(),
          dashboardAPI.getWeeklyStats(),
        ]);

        applyDashboardData(summary, stats);
      } catch (error: unknown) {
        if (!isMounted.current) return;

        if (isUnauthorizedError(error)) {
          clearUser();
          clearDashboard();
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load dashboard";
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [applyDashboardData, authLoading, clearDashboard, clearUser, isAuthenticated],
  );

  const updateWaterIntake = useCallback(
    async (glassesConsumed: number) => {
      if (!data) return;

      const optimisticData: DashboardData = {
        ...data,
        waterIntake: {
          ...data.waterIntake,
          consumed: glassesConsumed,
          percentage: Math.min(
            Math.round((glassesConsumed / data.waterIntake.goal) * 100),
            100,
          ),
        },
      };
      optimisticData.todayScore = recalculateScore(optimisticData);

      setData(optimisticData);
      if (cache) cache = { ...cache, data: optimisticData };

      try {
        await dashboardAPI.updateWaterIntake(glassesConsumed);
      } catch (error: unknown) {
        setData(data);
        if (cache) cache = { ...cache, data };

        if (!isUnauthorizedError(error)) {
          toast.error("Failed to update water intake");
        }
      }
    },
    [data],
  );

  const logFocusSession = useCallback(
    async (startTime: Date, endTime: Date, category: string) => {
      if (!data) return;

      const addedMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / 60000,
      );
      const nextMinutes = data.focusTime.minutes + addedMinutes;

      const optimisticData: DashboardData = {
        ...data,
        focusTime: {
          ...data.focusTime,
          minutes: nextMinutes,
          hours: Math.floor(nextMinutes / 60),
          sessionsCount: data.focusTime.sessionsCount + 1,
        },
      };
      optimisticData.todayScore = recalculateScore(optimisticData);

      setData(optimisticData);
      if (cache) cache = { ...cache, data: optimisticData };

      try {
        await dashboardAPI.logFocusSession(startTime, endTime, category);
        toast.success("Focus session logged");
      } catch (error: unknown) {
        setData(data);
        if (cache) cache = { ...cache, data };

        if (!isUnauthorizedError(error)) {
          toast.error("Failed to log focus session");
        }
      }
    },
    [data],
  );

  const updateWeeklyGoal = useCallback(
    async (completedWorkouts: number, goalWorkouts: number) => {
      if (!data) return;

      const optimisticData: DashboardData = {
        ...data,
        weeklyGoal: {
          completed: completedWorkouts,
          goal: goalWorkouts,
          percentage: Math.min(
            Math.round((completedWorkouts / goalWorkouts) * 100),
            100,
          ),
        },
      };
      optimisticData.todayScore = recalculateScore(optimisticData);

      setData(optimisticData);
      if (cache) cache = { ...cache, data: optimisticData };

      try {
        await dashboardAPI.updateWeeklyGoal(completedWorkouts, goalWorkouts);
      } catch (error: unknown) {
        setData(data);
        if (cache) cache = { ...cache, data };

        if (!isUnauthorizedError(error)) {
          toast.error("Failed to update weekly goal");
        }
      }
    },
    [data],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDashboard();
    });
  }, [fetchDashboard]);

  return {
    data,
    weeklyStats,
    loading: loading || authLoading,
    error,
    refresh: () => fetchDashboard(true),
    updateWaterIntake,
    logFocusSession,
    updateWeeklyGoal,
  };
}
