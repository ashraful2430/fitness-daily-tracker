"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DashboardApiError,
  getDashboard,
  getMonthlyHistory,
  getMonthlyOverview,
  getWeeklyStats,
} from "@/lib/dashboardApi";
import { moneyAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  DashboardData,
  DashboardMonthlyHistoryItem,
  DashboardMonthlyOverview,
  WeeklyStat,
  WeeklyStatsMeta,
} from "@/types/dashboard";

function monthKeyFromParts(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthKeyToParts(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return { month, year };
}

function getErrorMessage(error: unknown) {
  if (error instanceof DashboardApiError) {
    if (error.status === 400) {
      return error.field ? `${error.message} (${error.field})` : error.message;
    }
    if (error.status === 401) {
      return "Unauthorized. Redirecting to login...";
    }
    if (error.status >= 500) {
      return "Server error. Please try again shortly.";
    }
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Failed to load dashboard";
}

export function useDashboard() {
  const { user, loading: authLoading, clearUser } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [monthlyOverview, setMonthlyOverview] = useState<DashboardMonthlyOverview | null>(null);
  const [monthlyHistory, setMonthlyHistory] = useState<DashboardMonthlyHistoryItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [weeklyInsight, setWeeklyInsight] = useState<WeeklyStat[] | null>(null);
  const [weeklyMeta, setWeeklyMeta] = useState<WeeklyStatsMeta | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualAvailableBalance, setActualAvailableBalance] = useState<number | null>(null);

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadMonthlyOverview = useCallback(
    async (
      monthKey: string,
      withLoading = true,
    ) => {
      try {
        if (withLoading && mounted.current) {
          setOverviewLoading(true);
        }

        const { month, year } = monthKeyToParts(monthKey);
        const data = await getMonthlyOverview(month, year);

        if (!mounted.current) return;

        setMonthlyOverview(data);
        setError(null);
      } catch (error: unknown) {
        if (error instanceof DashboardApiError && error.status === 401) {
          clearUser();
          return;
        }
        if (mounted.current) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (withLoading && mounted.current) {
          setOverviewLoading(false);
        }
      }
    },
    [clearUser],
  );

  const refresh = useCallback(async () => {
    if (authLoading) return;

    if (!user?.id) {
      if (mounted.current) {
        setLoading(false);
        setDashboard(null);
      }
      return;
    }

    try {
      if (mounted.current) {
        setLoading(true);
        setError(null);
      }

      const [dashboardData, history, balance] = await Promise.all([
        getDashboard(),
        getMonthlyHistory(6),
        moneyAPI.getBalanceSources(),
      ]);

      if (!mounted.current) return;

      const syncedDashboard: DashboardData = {
        ...dashboardData,
        kpis: {
          ...dashboardData.kpis,
          loginStreak: {
            ...dashboardData.kpis.loginStreak,
            current: user.loginStreak ?? dashboardData.kpis.loginStreak.current,
          },
        },
      };

      setDashboard(syncedDashboard);
      setMonthlyHistory(history);
      setActualAvailableBalance(balance?.totalBalance ?? 0);

      const defaultMonthKey = history.length
        ? monthKeyFromParts(history[0].month, history[0].year)
        : monthKeyFromParts(new Date().getMonth() + 1, new Date().getFullYear());

      setSelectedMonth((current) => current || defaultMonthKey);
      await loadMonthlyOverview(
        defaultMonthKey,
        false,
      );
    } catch (error: unknown) {
      if (error instanceof DashboardApiError && error.status === 401) {
        clearUser();
      }
      if (mounted.current) {
        setError(getErrorMessage(error));
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [authLoading, clearUser, loadMonthlyOverview, user]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const changeSelectedMonth = useCallback(
    async (monthKey: string) => {
      setSelectedMonth(monthKey);
      await loadMonthlyOverview(monthKey, true);
    },
    [loadMonthlyOverview],
  );

  const loadWeeklyDetails = useCallback(async () => {
    try {
      if (mounted.current) {
        setWeeklyLoading(true);
      }
      const response = await getWeeklyStats();
      if (!mounted.current) return;
      setWeeklyInsight(response.data);
      setWeeklyMeta(response.meta ?? null);
    } catch (error: unknown) {
      if (error instanceof DashboardApiError && error.status === 401) {
        clearUser();
        return;
      }
      if (mounted.current) {
        setError(getErrorMessage(error));
      }
    } finally {
      if (mounted.current) {
        setWeeklyLoading(false);
      }
    }
  }, [clearUser]);

  const monthOptions = useMemo(
    () =>
      monthlyHistory.map((item) => ({
        value: monthKeyFromParts(item.month, item.year),
        label: item.label,
      })),
    [monthlyHistory],
  );

  return {
    dashboard,
    monthlyOverview,
    monthlyHistory,
    monthOptions,
    selectedMonth,
    setSelectedMonth: changeSelectedMonth,
    weeklyInsight,
    weeklyMeta,
    weeklyLoading,
    loading,
    overviewLoading,
    actualAvailableBalance,
    error,
    refresh,
    loadWeeklyDetails,
  };
}
