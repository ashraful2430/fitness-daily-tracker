"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { dashboardAPI } from "@/lib/api";
import type { DashboardData } from "@/types/dashboard";
import toast from "react-hot-toast";

let cache: { data: DashboardData; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000;

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(cache?.data ?? null);
  const [loading, setLoading] = useState<boolean>(!cache);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboard = useCallback(async (force = false) => {
    if (!force && cache && Date.now() - cache.timestamp < CACHE_TTL) {
      setData(cache.data);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await dashboardAPI.getDashboard();
      if (!isMounted.current) return;
      cache = { data: result.data, timestamp: Date.now() };
      setData(result.data);
      setError(null);
    } catch (err: unknown) {
      if (!isMounted.current) return;
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Failed to load dashboard");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const updateWaterIntake = useCallback(
    async (glasses: number) => {
      if (!data) return;

      // ✅ No cap — user can drink as much as they want
      const optimisticData: DashboardData = {
        ...data,
        waterIntake: {
          ...data.waterIntake,
          consumed: glasses,
          // ✅ Percentage caps at 100 for score purposes, but consumed keeps going
          percentage: Math.min(
            Math.round((glasses / data.waterIntake.goal) * 100),
            100,
          ),
        },
      };
      optimisticData.todayScore = recalculateScore(optimisticData);

      setData(optimisticData);
      if (cache) cache = { ...cache, data: optimisticData };

      // ✅ Funny overhydration messages
      const overGoal = glasses - data.waterIntake.goal;
      if (glasses === data.waterIntake.goal) {
        toast.success("🎉 Goal reached! You're perfectly hydrated!", {
          duration: 2500,
        });
      } else if (overGoal === 1) {
        toast("💧 9 glasses? Look at you go! Fisherman energy.", {
          icon: "🐟",
          duration: 2500,
        });
      } else if (overGoal === 2) {
        toast("🌊 10 glasses! Are you part dolphin?", {
          icon: "🐬",
          duration: 2500,
        });
      } else if (overGoal === 3) {
        toast("🚿 11 glasses! At this point you ARE water.", {
          icon: "💦",
          duration: 2500,
        });
      } else if (overGoal >= 4) {
        toast("🌊 Bro stop. Your kidneys filed a complaint.", {
          icon: "😂",
          duration: 3000,
        });
      } else {
        toast.success("💧 Water updated!", { duration: 1500 });
      }

      try {
        await dashboardAPI.updateWaterIntake(glasses);
      } catch (err: unknown) {
        setData(data);
        if (cache) cache = { ...cache, data };
        toast.error("Failed to update water intake");
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
      const newMinutes = data.focusTime.minutes + addedMinutes;

      const optimisticData: DashboardData = {
        ...data,
        focusTime: {
          ...data.focusTime,
          minutes: newMinutes,
          hours: Math.floor(newMinutes / 60),
          sessionsCount: data.focusTime.sessionsCount + 1,
        },
      };
      optimisticData.todayScore = recalculateScore(optimisticData);

      setData(optimisticData);
      if (cache) cache = { ...cache, data: optimisticData };

      try {
        await dashboardAPI.logFocusSession(startTime, endTime, category);
        toast.success("🎯 Focus session logged!", { duration: 1500 });
      } catch (err: unknown) {
        setData(data);
        if (cache) cache = { ...cache, data };
        toast.error("Failed to log focus session");
      }
    },
    [data],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchDashboard(true),
    updateWaterIntake,
    logFocusSession,
  };
}

// ✅ Fully dynamic score — each active section gets equal weight
// Sections: water (capped at goal), focus (capped at 2h), streak, weekly goal
// If you add more sections later, just add them here and weights auto-adjust
function recalculateScore(d: DashboardData): number {
  const sections = [
    // [achieved_pct (0–1), is_active]
    [Math.min(d.waterIntake.consumed / d.waterIntake.goal, 1), true],
    [Math.min(d.focusTime.minutes / 120, 1), true],
    [d.workoutStreak.current > 0 ? 1 : 0, true],
    [Math.min(d.weeklyGoal.percentage / 100, 1), true],
  ] as [number, boolean][];

  const active = sections.filter(([, on]) => on);
  const perSection = 100 / active.length; // e.g. 4 sections → 25pts each
  const total = active.reduce((sum, [pct]) => sum + pct * perSection, 0);
  return Math.min(Math.round(total), 100);
}
