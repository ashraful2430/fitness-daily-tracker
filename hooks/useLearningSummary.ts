"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { isUnauthorizedError, learningAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { LearningSummary } from "@/types/learning";

function defaultSummary(): LearningSummary {
  return {
    todayMinutes: 0,
    weekMinutes: 0,
    totalMinutes: 0,
    totalSessions: 0,
    completedSessions: 0,
    completionRate: 0,
    currentStreak: 0,
    activeSession: null,
    topSubjects: [],
    recentSessions: [],
  };
}

export function useLearningSummary() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const userId = user?.id ?? null;
  const [summary, setSummary] = useState<LearningSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const lastToastMessage = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSummary = useCallback(
    async (notify = false) => {
      if (authLoading) return;

      if (!userId) {
        if (isMounted.current) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const nextSummary = await learningAPI.getSummary();

        if (!isMounted.current) return;

        setSummary(nextSummary ?? defaultSummary());
        setError(null);
        lastToastMessage.current = null;
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          clearUser();
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load learning summary";
        if (!isMounted.current) return;

        setError(message);
        if (notify && lastToastMessage.current !== message) {
          lastToastMessage.current = message;
          toast.error(message);
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [authLoading, clearUser, userId],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void fetchSummary(false);
    });
  }, [fetchSummary]);

  return {
    summary,
    loading: loading || authLoading,
    error,
    refresh: () => fetchSummary(true),
  };
}
