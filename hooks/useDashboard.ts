"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  DashboardApiError,
  getDashboard,
  getWeeklyStats,
  postFocus,
  postWater,
  postWeeklyGoal,
  postWeeklyStats,
} from "@/lib/dashboardApi";
import type {
  FocusPayload,
  WeeklyGoalPayload,
  WeeklyStatsPayload,
  WaterPayload,
} from "@/types/dashboard";

const DASHBOARD_KEY = ["dashboard", "summary"];
const WEEKLY_STATS_KEY = ["dashboard", "weekly-stats"];

function readableError(error: unknown, fallback: string) {
  if (error instanceof DashboardApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useDashboard() {
  const { isAuthenticated, loading: authLoading, clearUser } = useAuth();
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: getDashboard,
    enabled: isAuthenticated && !authLoading,
  });

  const weeklyStatsQuery = useQuery({
    queryKey: WEEKLY_STATS_KEY,
    queryFn: getWeeklyStats,
    enabled: isAuthenticated && !authLoading,
  });

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }),
      queryClient.invalidateQueries({ queryKey: WEEKLY_STATS_KEY }),
    ]);
  };

  const waterMutation = useMutation({
    mutationFn: (payload: WaterPayload) => postWater(payload),
    onSuccess: async () => {
      await refetchAll();
      toast.success("Water intake updated");
    },
    onError: (error) => {
      const msg = readableError(error, "Failed to update water intake");
      if (error instanceof DashboardApiError && error.status === 401) {
        clearUser();
      }
      toast.error(msg);
    },
  });

  const focusMutation = useMutation({
    mutationFn: (payload: FocusPayload) => postFocus(payload),
    onSuccess: async () => {
      await refetchAll();
      toast.success("Focus session logged");
    },
    onError: (error) => {
      const msg = readableError(error, "Failed to log focus session");
      if (error instanceof DashboardApiError && error.status === 401) {
        clearUser();
      }
      toast.error(msg);
    },
  });

  const weeklyGoalMutation = useMutation({
    mutationFn: (payload: WeeklyGoalPayload) => postWeeklyGoal(payload),
    onSuccess: async () => {
      await refetchAll();
      toast.success("Weekly goal updated");
    },
    onError: (error) => {
      const msg = readableError(error, "Failed to update weekly goal");
      if (error instanceof DashboardApiError && error.status === 401) {
        clearUser();
      }
      toast.error(msg);
    },
  });

  const weeklyStatsMutation = useMutation({
    mutationFn: (payload: WeeklyStatsPayload) => postWeeklyStats(payload),
    onSuccess: async () => {
      await refetchAll();
      toast.success("Weekly stats updated");
    },
    onError: (error) => {
      const msg = readableError(error, "Failed to update weekly stats");
      if (error instanceof DashboardApiError && error.status === 401) {
        clearUser();
      }
      toast.error(msg);
    },
  });

  const errorMessage =
    readableError(dashboardQuery.error, "") ||
    readableError(weeklyStatsQuery.error, "");

  return {
    data: dashboardQuery.data ?? null,
    weeklyStats: weeklyStatsQuery.data ?? [],
    loading: authLoading || dashboardQuery.isLoading || weeklyStatsQuery.isLoading,
    error: errorMessage || null,
    refresh: async () => {
      await refetchAll();
    },
    updateWaterIntake: async (glassesConsumed: number) => {
      await waterMutation.mutateAsync({ glassesConsumed });
    },
    logFocusSession: async (
      startTime: Date,
      endTime: Date,
      category: string,
    ) => {
      await focusMutation.mutateAsync({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        category,
      });
    },
    updateWeeklyGoal: async (completedWorkouts: number, goalWorkouts: number) => {
      await weeklyGoalMutation.mutateAsync({ completedWorkouts, goalWorkouts });
    },
    updateWeeklyStats: async (dailyStats: Array<{ workouts: number; focusMinutes: number }>) => {
      await weeklyStatsMutation.mutateAsync({ dailyStats });
    },
    mutationLoading:
      waterMutation.isPending ||
      focusMutation.isPending ||
      weeklyGoalMutation.isPending ||
      weeklyStatsMutation.isPending,
  };
}
