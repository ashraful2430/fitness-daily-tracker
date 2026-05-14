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

function getMoneySavingsBalance(balance: Awaited<ReturnType<typeof moneyAPI.getBalanceSources>>) {
  if (typeof balance?.totalBalance === "number" && Number.isFinite(balance.totalBalance)) {
    return balance.totalBalance;
  }

  return (balance?.sources ?? []).reduce(
    (total, source) => total + (Number.isFinite(source.amount) ? source.amount : 0),
    0,
  );
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

      const [dashboardData, history, initialOverview, moneyBalance] = await Promise.all([
        getDashboard(),
        getMonthlyHistory(6),
        getMonthlyOverview(),
        moneyAPI.getBalanceSources(),
      ]);

      if (!mounted.current) return;

      const savingsBalance = getMoneySavingsBalance(moneyBalance);
      const syncedDashboard: DashboardData = {
        ...dashboardData,
        kpis: {
          ...dashboardData.kpis,
          loginStreak: {
            ...dashboardData.kpis.loginStreak,
            current: user.loginStreak ?? dashboardData.kpis.loginStreak.current,
          },
          availableBalance: savingsBalance,
        },
        moduleOverview: {
          ...dashboardData.moduleOverview,
          money: {
            ...dashboardData.moduleOverview.money,
            availableBalance: savingsBalance,
          },
        },
      };

      setDashboard(syncedDashboard);
      setMonthlyHistory(history);
      setMonthlyOverview(initialOverview);

      const defaultMonthKey = monthKeyFromParts(
        initialOverview.selectedMonth.month || new Date().getMonth() + 1,
        initialOverview.selectedMonth.year || new Date().getFullYear(),
      );

      setSelectedMonth((current) => current || defaultMonthKey);
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
  }, [authLoading, clearUser, user]);

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
    error,
    refresh,
    loadWeeklyDetails,
  };
}
