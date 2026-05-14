"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { isUnauthorizedError, learningAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  CreateLearningSessionRequest,
  LearningPagination,
  LearningSession,
  LearningSessionStatus,
  LearningSummary,
  UpdateLearningSessionRequest,
} from "@/types/learning";

type FormErrors = Record<string, string>;

type LearningFilters = {
  page: number;
  limit: number;
  status: LearningSessionStatus | "";
  subject: string;
};

type ActiveTimerState = {
  sessionId: string;
  title: string;
  subject: string;
  goal?: string;
  plannedMinutes: number;
  baseActualMinutes: number;
  startRemainingSeconds: number;
  targetEndAt: number;
};

const ACTIVE_TIMER_KEY = "learning:active-timer";

function defaultSummary(): LearningSummary {
  return {
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    totalMinutes: 0,
    activeSessions: 0,
    plannedSessions: 0,
    missedSessions: 0,
    totalSessions: 0,
    completedSessions: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionMinutes: 0,
    subjectBreakdown: [],
    dailyBreakdown: [],
    learningTypeBreakdown: [],
    priorityBreakdown: [],
    activeSession: null,
    topSubjects: [],
    recentSessions: [],
  };
}

function defaultPagination(limit = 10): LearningPagination {
  return {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  };
}

function toLocalDateInputValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getToday() {
  return toLocalDateInputValue(new Date());
}

function readStoredActiveTimer() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(ACTIVE_TIMER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as ActiveTimerState;
  } catch {
    window.localStorage.removeItem(ACTIVE_TIMER_KEY);
    return null;
  }
}

function roundMinutes(seconds: number) {
  return Math.max(0, Math.round(seconds / 60));
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function useLearningDashboard() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const userId = user?.id ?? null;
  const [summary, setSummary] = useState<LearningSummary>(defaultSummary);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [pagination, setPagination] = useState<LearningPagination>(
    defaultPagination(),
  );
  const [filters, setFilters] = useState<LearningFilters>({
    page: 1,
    limit: 10,
    status: "",
    subject: "",
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(
    readStoredActiveTimer,
  );
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [alarmRinging, setAlarmRinging] = useState(false);
  const isMounted = useRef(true);
  const lastToastMessage = useRef<string | null>(null);
  const filtersRef = useRef<LearningFilters>({
    page: 1,
    limit: 10,
    status: "",
    subject: "",
  });
  const skipNextFilterDebounce = useRef(true);
  const completionLockRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);
  const titleIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current !== null) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    if (titleIntervalRef.current !== null) {
      window.clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
      document.title = "Planify Life | Personal Productivity Tracker";
    }

    setAlarmRinging(false);
  }, []);

  const beep = useCallback(() => {
    if (typeof window === "undefined") return;

    const audioContext =
      audioContextRef.current ?? new window.AudioContext();
    audioContextRef.current = audioContext;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.45,
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  const startAlarm = useCallback(() => {
    stopAlarm();
    setAlarmRinging(true);
    beep();
    alarmIntervalRef.current = window.setInterval(() => {
      beep();
    }, 1200);
    titleIntervalRef.current = window.setInterval(() => {
      document.title =
        document.title.startsWith("⏰")
          ? "Planify Life | Personal Productivity Tracker"
          : "⏰ Learning session finished";
    }, 1000);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Learning session completed", {
        body: "Your study timer finished. Stop the alarm when you're ready.",
      });
    }
  }, [beep, stopAlarm]);

  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, [stopAlarm]);

  const clearToastLock = useCallback(() => {
    lastToastMessage.current = null;
  }, []);

  const handleError = useCallback(
    (error: unknown, fallbackMessage: string, notify = true) => {
      if (isUnauthorizedError(error)) {
        clearUser();
        return;
      }

      const message = getErrorMessage(error, fallbackMessage);

      if (isMounted.current) {
        setError(message);
      }

      if (notify && lastToastMessage.current !== message) {
        lastToastMessage.current = message;
        toast.error(message);
      }
    },
    [clearUser],
  );

  const fetchSummary = useCallback(
    async (notify = false) => {
      if (!userId) return;

      try {
        setSummaryLoading(true);
        const nextSummary = await learningAPI.getSummary();

        if (!isMounted.current) return;

        setSummary(nextSummary ?? defaultSummary());
        setError(null);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load learning summary", notify);
      } finally {
        if (isMounted.current) {
          setSummaryLoading(false);
        }
      }
    },
    [clearToastLock, handleError, userId],
  );

  const fetchSessions = useCallback(
    async (nextFilters: LearningFilters, notify = false) => {
      if (!userId) return;

      try {
        setSessionsLoading(true);
        const response = await learningAPI.getSessions({
          page: nextFilters.page,
          limit: nextFilters.limit,
          status: nextFilters.status,
          subject: nextFilters.subject || undefined,
        });

        if (!isMounted.current) return;

        setSessions(response.data);
        setPagination(response.pagination);
        setError(null);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load learning sessions", notify);
      } finally {
        if (isMounted.current) {
          setSessionsLoading(false);
        }
      }
    },
    [clearToastLock, handleError, userId],
  );

  useEffect(() => {
    if (!userId) return;

    if (skipNextFilterDebounce.current) {
      skipNextFilterDebounce.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      const nextFilters = { ...filtersRef.current, page: 1 };
      filtersRef.current = nextFilters;
      setFilters(nextFilters);
      void fetchSessions(nextFilters, false);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [fetchSessions, filters.status, filters.subject, userId]);

  const refreshAll = useCallback(
    async (notify = false) => {
      if (authLoading) return;

      if (!userId) {
        if (isMounted.current) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await Promise.all([
          fetchSummary(notify),
          fetchSessions(filtersRef.current, notify),
        ]);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [authLoading, fetchSessions, fetchSummary, userId],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void refreshAll(false);
    });
  }, [refreshAll]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (activeTimer) {
      window.localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(activeTimer));
    } else {
      window.localStorage.removeItem(ACTIVE_TIMER_KEY);
    }
  }, [activeTimer]);

  const completeSessionFromTimer = useCallback(
    async (timerState: ActiveTimerState) => {
      const actualMinutes = timerState.plannedMinutes;

      try {
        await learningAPI.updateSession(timerState.sessionId, {
          status: "completed",
          actualMinutes,
          completedAt: new Date().toISOString(),
        });

        await Promise.all([
          fetchSummary(false),
          fetchSessions(filtersRef.current, false),
        ]);
      } catch (error: unknown) {
        handleError(error, "Failed to complete learning session", true);
      }
    },
    [fetchSessions, fetchSummary, handleError],
  );

  useEffect(() => {
    if (!activeTimer) {
      completionLockRef.current = null;
      return;
    }

    const tick = () => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((activeTimer.targetEndAt - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemaining);

      if (nextRemaining > 0) return;

      if (completionLockRef.current === activeTimer.sessionId) return;
      completionLockRef.current = activeTimer.sessionId;

      const finishedTimer = activeTimer;
      setRemainingSeconds(0);
      setActiveTimer(null);
      startAlarm();
      void completeSessionFromTimer(finishedTimer);
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [activeTimer, completeSessionFromTimer, startAlarm]);

  const validateSession = useCallback(
    (payload: CreateLearningSessionRequest) => {
      const errors: FormErrors = {};

      if (!payload.title.trim()) {
        errors.title = "Session title is required.";
      }

      if (!payload.subject.trim()) {
        errors.subject = "Subject is required.";
      }

      if (!payload.goal?.trim()) {
        errors.goal = "Goal is required.";
      }

      if (!Number.isFinite(payload.plannedMinutes) || payload.plannedMinutes <= 0) {
        errors.plannedMinutes = "Planned minutes must be greater than zero.";
      }

      if (!payload.date) {
        errors.date = "Study date is required.";
      }

      return errors;
    },
    [],
  );

  const createSession = useCallback(
    async (payload: CreateLearningSessionRequest) => {
      const normalizedPayload = {
        ...payload,
        title: payload.title.trim(),
        subject: payload.subject.trim(),
        goal: payload.goal?.trim() || "Complete the planned learning block.",
        studyDate: payload.studyDate ?? payload.date ?? getToday(),
        learnerMode: payload.learnerMode ?? "self_learner",
        learningType: payload.learningType ?? "reading",
        difficulty: payload.difficulty ?? "medium",
        priority: payload.priority ?? "medium",
        notes: payload.notes?.trim() || undefined,
        tags: payload.tags?.map((tag) => tag.trim()).filter(Boolean),
      };
      const errors = validateSession(normalizedPayload);
      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setSessionSaving(true);
        setError(null);
        await learningAPI.createSession(normalizedPayload);
        const nextFilters = { ...filtersRef.current, page: 1 };
        if (isMounted.current) {
          filtersRef.current = nextFilters;
          setFilters(nextFilters);
        }
        await Promise.all([fetchSummary(false), fetchSessions(nextFilters, false)]);
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to create learning session", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setSessionSaving(false);
        }
      }
    },
    [fetchSessions, fetchSummary, handleError, validateSession],
  );

  const updateSession = useCallback(
    async (id: string, payload: UpdateLearningSessionRequest) => {
      const maybeValidationPayload = {
        title: payload.title ?? "existing",
        subject: payload.subject ?? "existing",
        plannedMinutes: payload.plannedMinutes ?? 1,
        notes: payload.notes,
        goal: payload.goal ?? "existing",
        studyDate: payload.studyDate ?? payload.date ?? getToday(),
        learnerMode: payload.learnerMode ?? "self_learner",
        learningType: payload.learningType ?? "reading",
        difficulty: payload.difficulty ?? "medium",
        priority: payload.priority ?? "medium",
        date: payload.date ?? payload.studyDate ?? getToday(),
      } satisfies CreateLearningSessionRequest;
      const errors =
        payload.title !== undefined ||
        payload.subject !== undefined ||
        payload.plannedMinutes !== undefined ||
        payload.date !== undefined
          ? validateSession(maybeValidationPayload)
          : {};
      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setSessionSaving(true);
        setError(null);
        await learningAPI.updateSession(id, payload);
        await Promise.all([
          fetchSummary(false),
          fetchSessions(filtersRef.current, false),
        ]);
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to update learning session", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setSessionSaving(false);
        }
      }
    },
    [fetchSessions, fetchSummary, handleError, validateSession],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        setDeletingSessionId(id);
        setError(null);
        await learningAPI.deleteSession(id);

        const nextPage =
          sessions.length === 1 && filtersRef.current.page > 1
            ? filtersRef.current.page - 1
            : filtersRef.current.page;
        const nextFilters = { ...filtersRef.current, page: nextPage };

        if (isMounted.current) {
          filtersRef.current = nextFilters;
          setFilters(nextFilters);
        }

        if (activeTimer?.sessionId === id) {
          setActiveTimer(null);
          setRemainingSeconds(0);
          stopAlarm();
        }

        await Promise.all([fetchSummary(false), fetchSessions(nextFilters, false)]);
        return true;
      } catch (error: unknown) {
        handleError(error, "Failed to delete learning session", true);
        return false;
      } finally {
        if (isMounted.current) {
          setDeletingSessionId(null);
        }
      }
    },
    [activeTimer, fetchSessions, fetchSummary, handleError, sessions.length, stopAlarm],
  );

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission().catch(() => null);
    }
  }, []);

  const startSessionTimer = useCallback(
    async (session: LearningSession) => {
      if (activeTimer && activeTimer.sessionId !== session._id) {
        toast.error("Finish or pause the current timer before starting another session.");
        return;
      }

      const startRemainingSeconds = Math.max(
        session.plannedMinutes * 60 - Math.round(session.actualMinutes * 60),
        0,
      );

      if (startRemainingSeconds <= 0) {
        toast.error("This session has no remaining study time.");
        return;
      }

      await requestNotificationPermission();
      stopAlarm();

      const timerState: ActiveTimerState = {
        sessionId: session._id,
        title: session.title,
        subject: session.subject,
        goal: session.goal,
        plannedMinutes: session.plannedMinutes,
        baseActualMinutes: session.actualMinutes,
        startRemainingSeconds,
        targetEndAt: Date.now() + startRemainingSeconds * 1000,
      };

      setActiveTimer(timerState);

      try {
        await learningAPI.updateSession(session._id, {
          status: "active",
          startedAt: new Date().toISOString(),
        });
        await Promise.all([
          fetchSummary(false),
          fetchSessions(filtersRef.current, false),
        ]);
      } catch (error: unknown) {
        setActiveTimer(null);
        handleError(error, "Failed to start learning timer", true);
      }
    },
    [
      activeTimer,
      fetchSessions,
      fetchSummary,
      handleError,
      requestNotificationPermission,
      stopAlarm,
    ],
  );

  const pauseSessionTimer = useCallback(async () => {
    if (!activeTimer) return;

    const studiedMinutes = roundMinutes(
      activeTimer.startRemainingSeconds - remainingSeconds,
    );
    const actualMinutes = Math.min(
      activeTimer.plannedMinutes,
      activeTimer.baseActualMinutes + studiedMinutes,
    );

    try {
      await learningAPI.updateSession(activeTimer.sessionId, {
        status: "paused",
        actualMinutes,
      });
      setRemainingSeconds(0);
      setActiveTimer(null);
      await Promise.all([
        fetchSummary(false),
        fetchSessions(filtersRef.current, false),
      ]);
    } catch (error: unknown) {
      handleError(error, "Failed to pause learning timer", true);
    }
  }, [activeTimer, fetchSessions, fetchSummary, handleError, remainingSeconds]);

  const completeSessionManually = useCallback(async () => {
    if (!activeTimer) return;

    const studiedMinutes = roundMinutes(
      activeTimer.startRemainingSeconds - remainingSeconds,
    );
    const actualMinutes = Math.min(
      activeTimer.plannedMinutes,
      activeTimer.baseActualMinutes + studiedMinutes,
    );

    try {
      await learningAPI.updateSession(activeTimer.sessionId, {
        status: "completed",
        actualMinutes,
        completedAt: new Date().toISOString(),
      });
      setRemainingSeconds(0);
      setActiveTimer(null);
      stopAlarm();
      await Promise.all([
        fetchSummary(false),
        fetchSessions(filtersRef.current, false),
      ]);
    } catch (error: unknown) {
      handleError(error, "Failed to complete learning session", true);
    }
  }, [
    activeTimer,
    fetchSessions,
    fetchSummary,
    handleError,
    remainingSeconds,
    stopAlarm,
  ]);

  const resetSessionTimer = useCallback(() => {
    if (!activeTimer) return;

    const resetSeconds = activeTimer.plannedMinutes * 60;
    setActiveTimer({
      ...activeTimer,
      baseActualMinutes: 0,
      startRemainingSeconds: resetSeconds,
      targetEndAt: Date.now() + resetSeconds * 1000,
    });
    setRemainingSeconds(resetSeconds);
    stopAlarm();
  }, [activeTimer, stopAlarm]);

  const updateFilterField = useCallback(
    (field: "status" | "subject", value: string) => {
      setFilters((current) => ({
        ...current,
        [field]: value,
        page: 1,
      }));
    },
    [],
  );

  const applyFilters = useCallback(
    async (nextFilters: Partial<LearningFilters> = {}, notify = false) => {
      const merged = {
        ...filtersRef.current,
        ...nextFilters,
      };

      if (isMounted.current) {
        filtersRef.current = merged;
        skipNextFilterDebounce.current = true;
        setFilters(merged);
      }

      await fetchSessions(merged, notify);
    },
    [fetchSessions],
  );

  const goToPage = useCallback(
    async (page: number) => {
      await applyFilters({ page }, false);
    },
    [applyFilters],
  );

  const subjectOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...summary.topSubjects.map((subject) => subject._id),
            ...sessions.map((session) => session.subject),
          ].filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [sessions, summary.topSubjects],
  );

  return {
    summary,
    sessions,
    pagination,
    filters,
    loading: loading || authLoading,
    summaryLoading,
    sessionsLoading,
    sessionSaving,
    deletingSessionId,
    error,
    activeTimer,
    remainingSeconds,
    alarmRinging,
    subjectOptions,
    refreshAll,
    createSession,
    updateSession,
    deleteSession,
    startSessionTimer,
    pauseSessionTimer,
    completeSessionManually,
    resetSessionTimer,
    stopAlarm,
    updateFilterField,
    applyFilters,
    goToPage,
  };
}
