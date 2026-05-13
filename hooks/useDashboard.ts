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
import type { BalanceSource } from "@/types/money";

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

function calculateMonthlyEarnedFromSources(
  sources: BalanceSource[],
  salaryBase: number,
) {
  const externalIncome = sources
    .filter((source) => {
      return source.type === "EXTERNAL" || source.source === "INCOME_ADDED";
    })
    .reduce((sum, source) => sum + source.amount, 0);
  return salaryBase + externalIncome;
}

function normalizeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
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
  const [balanceSources, setBalanceSources] = useState<BalanceSource[]>([]);
  const [currentSalaryAmount, setCurrentSalaryAmount] = useState(0);

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
      sourcesOverride?: BalanceSource[],
      salaryOverride?: number,
    ) => {
      try {
        if (withLoading && mounted.current) {
          setOverviewLoading(true);
        }

        const { month, year } = monthKeyToParts(monthKey);
        const data = await getMonthlyOverview(month, year);
        const computedIncome = calculateMonthlyEarnedFromSources(
          sourcesOverride ?? balanceSources,
          normalizeNumber(salaryOverride ?? currentSalaryAmount),
        );
        const syncedOverview: DashboardMonthlyOverview = {
          ...data,
          money: {
            ...data.money,
            income: computedIncome,
          },
        };

        if (!mounted.current) return;

        setMonthlyOverview(syncedOverview);
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
    [balanceSources, clearUser, currentSalaryAmount],
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

      const [dashboardData, history, balance, moneySummary] = await Promise.all([
        getDashboard(),
        getMonthlyHistory(6),
        moneyAPI.getBalanceSources(),
        moneyAPI.getSummary(),
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
      setBalanceSources(balance?.sources ?? []);
      setCurrentSalaryAmount(normalizeNumber(moneySummary?.salaryAmount));

      const defaultMonthKey = history.length
        ? monthKeyFromParts(history[0].month, history[0].year)
        : monthKeyFromParts(new Date().getMonth() + 1, new Date().getFullYear());

      setSelectedMonth((current) => current || defaultMonthKey);
      await loadMonthlyOverview(
        defaultMonthKey,
        false,
        balance?.sources ?? [],
        normalizeNumber(moneySummary?.salaryAmount),
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
