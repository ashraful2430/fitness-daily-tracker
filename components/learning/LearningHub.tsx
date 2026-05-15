"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlarmClock,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Pause,
  PencilLine,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  cancelLearningSession,
  completeLearningSession,
  createSessionNote,
  createLearningSession,
  createTimerPreset,
  defaultLearningTemplates,
  defaultTimerPresets,
  deleteLearningSession,
  deleteSessionNote,
  deleteTimerPreset,
  getSessionNotes,
  getLearningTemplates,
  getLearningGoals,
  getTimerPresets,
  getLearningSessions,
  getLearningStats,
  learningQueryKeys,
  pauseLearningSession,
  rescheduleLearningSession,
  resumeLearningSession,
  startLearningSession,
  updateSessionNote,
  updateChildControls,
  getChildControls,
  updateLearningGoals,
  updateLearningSession,
} from "@/lib/learningApi";
import { useAuth } from "@/hooks/useAuth";
import { emitFeedbackEffect } from "@/lib/feedbackEvents";
import type {
  LearnerMode,
  LearningDifficulty,
  LearningPriority,
  LearningSession,
  LearningSessionStatus,
  LearningSessionsQuery,
  LearningStats,
  LearningType,
  LearningNote,
  TimerPreset,
} from "@/types/learning";

type FormErrors = Record<string, string>;

type SessionFormState = {
  title: string;
  subject: string;
  goal: string;
  plannedMinutes: string;
  date: string;
  learningType: LearningType;
  difficulty: LearningDifficulty;
  priority: LearningPriority;
  tags: string;
  notes: string;
};

type ParentControlsState = {
  parentPin: string;
  dailyLimitMinutes: string;
  rewardPointsEnabled: boolean;
  allowedSubjects: string;
  messagePreview: string;
};

type StoredLearningTimer = {
  session: LearningSession;
  targetEndAt: number;
};

type CustomAlarmSound = {
  id: string;
  label: string;
  dataUrl: string;
  shared?: boolean;
};

type AlarmSoundOption =
  | {
      id: string;
      label: string;
      frequency: number;
      kind: "tone";
    }
  | {
      id: string;
      label: string;
      dataUrl: string;
      kind: "file";
    };

const ACTIVE_LEARNING_TIMER_KEY = "planify:learning:active-timer";
const PAUSED_LEARNING_TIMERS_KEY = "planify:learning:paused-timers";
const CUSTOM_ALARM_SOUNDS_KEY = "planify:learning:custom-alarm-sounds";
const SELECTED_ALARM_SOUND_KEY = "planify:learning:selected-alarm-sound";

const defaultAlarmSounds: AlarmSoundOption[] = [
  { id: "classic-beep", label: "Classic beep", frequency: 880, kind: "tone" },
  { id: "soft-bell", label: "Soft bell", frequency: 660, kind: "tone" },
  { id: "digital-chime", label: "Digital chime", frequency: 1040, kind: "tone" },
];

const learnerModes: Array<{
  value: LearnerMode;
  label: string;
  icon: LucideIcon;
  helper: string;
  presets: string[];
}> = [
  {
    value: "student",
    label: "Student",
    icon: GraduationCap,
    helper: "Exam prep, assignments, revision, and subject study.",
    presets: ["Exam prep", "Assignment", "Revision", "Subject study"],
  },
  {
    value: "job_holder",
    label: "Job Holder",
    icon: BriefcaseBusiness,
    helper: "Skill learning, certification, and office learning.",
    presets: ["Skill learning", "Certification", "Office learning"],
  },
  {
    value: "child",
    label: "Child",
    icon: Star,
    helper: "Short sessions, simple labels, and reward-friendly study.",
    presets: ["10 minute reading", "Homework", "Fun practice", "Reward goal"],
  },
  {
    value: "self_learner",
    label: "Self Learner",
    icon: UserRound,
    helper: "Books, courses, hobbies, and personal growth.",
    presets: ["Book reading", "Course", "Hobby practice", "Personal growth"],
  },
];

const learningTypes: LearningType[] = [
  "reading",
  "video",
  "practice",
  "revision",
  "assignment",
  "exam_prep",
  "course",
  "other",
];

const difficulties: LearningDifficulty[] = ["easy", "medium", "hard"];
const priorities: LearningPriority[] = ["low", "medium", "high"];
const subjectChartColors = ["#14b8a6", "#f59e0b", "#06b6d4", "#22c55e", "#f43f5e"];

const panelClass =
  "rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-cyan-300/10 dark:bg-[#0b1424] dark:shadow-black/20 sm:p-6";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 dark:border-cyan-200/10 dark:bg-[#07101e] dark:text-slate-100 dark:focus:bg-[#0d1829]";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-200/10 dark:bg-[#07101e] dark:text-slate-200 dark:hover:border-cyan-300/25 dark:hover:bg-[#0d1b2e]";

function toLocalDateInputValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getToday() {
  return toLocalDateInputValue(new Date());
}

function formatMinutes(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function emptyForm(defaultSubject = ""): SessionFormState {
  return {
    title: "",
    subject: defaultSubject,
    goal: "",
    plannedMinutes: "25",
    date: getToday(),
    learningType: "reading",
    difficulty: "medium",
    priority: "medium",
    tags: "",
    notes: "",
  };
}

function sessionToForm(session: LearningSession): SessionFormState {
  return {
    title: session.title,
    subject: session.subject,
    goal: session.goal ?? "",
    plannedMinutes: String(session.plannedMinutes),
    date: session.date.slice(0, 10),
    learningType: session.learningType ?? "reading",
    difficulty: session.difficulty ?? "medium",
    priority: session.priority ?? "medium",
    tags: session.tags?.join(", ") ?? "",
    notes: session.notes ?? "",
  };
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function readStoredLearningTimer() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(ACTIVE_LEARNING_TIMER_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredLearningTimer;
    if (!parsed?.session?._id || !Number.isFinite(parsed.targetEndAt)) {
      window.localStorage.removeItem(ACTIVE_LEARNING_TIMER_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(ACTIVE_LEARNING_TIMER_KEY);
    return null;
  }
}

function readStoredPausedTimers() {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(PAUSED_LEARNING_TIMERS_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, number>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => Number.isFinite(value) && value > 0),
    );
  } catch {
    window.localStorage.removeItem(PAUSED_LEARNING_TIMERS_KEY);
    return {};
  }
}

function readStoredCustomAlarmSounds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CUSTOM_ALARM_SOUNDS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CustomAlarmSound[];
    return Array.isArray(parsed)
      ? parsed.filter((sound) => sound.id && sound.label && sound.dataUrl)
      : [];
  } catch {
    window.localStorage.removeItem(CUSTOM_ALARM_SOUNDS_KEY);
    return [];
  }
}

function readStoredSelectedAlarmSound() {
  if (typeof window === "undefined") return "classic-beep";
  return window.localStorage.getItem(SELECTED_ALARM_SOUND_KEY) || "classic-beep";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function requestSharedAlarmSounds() {
  const response = await fetch("/api/learning/alarm-sounds", {
    credentials: "include",
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: Array<CustomAlarmSound & { mimeType?: string; size?: number }>;
    message?: string;
  } | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.message ?? "Failed to load shared alarm sounds");
  }

  return (body.data ?? []).map((sound) => ({ ...sound, shared: true }));
}

async function createSharedAlarmSound(payload: {
  label: string;
  dataUrl: string;
  mimeType: string;
  size: number;
}) {
  const response = await fetch("/api/learning/alarm-sounds", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: CustomAlarmSound;
    message?: string;
  } | null;

  if (!response.ok || !body?.success || !body.data) {
    throw new Error(body?.message ?? "Failed to save shared alarm sound");
  }

  return { ...body.data, shared: true };
}

async function deleteSharedAlarmSound(id: string) {
  const response = await fetch(`/api/learning/alarm-sounds?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.message ?? "Failed to delete shared alarm sound");
  }
}

function getStoredTimerRemainingSeconds(timer: StoredLearningTimer | null) {
  if (!timer) return 0;
  return Math.max(0, Math.ceil((timer.targetEndAt - Date.now()) / 1000));
}

function getSessionRemainingSeconds(session: LearningSession | null | undefined) {
  if (!session) return 0;
  return Math.max(0, (session.plannedMinutes - (session.actualMinutes || 0)) * 60);
}

function getStudiedMinutes(session: LearningSession, remainingSeconds: number) {
  const plannedSeconds = Math.max(0, session.plannedMinutes * 60);
  const studiedSeconds = Math.max(0, plannedSeconds - Math.max(0, remainingSeconds));
  return Math.min(session.plannedMinutes, Math.round(studiedSeconds / 60));
}

function statusTone(status: LearningSessionStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "paused":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    case "completed":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function priorityTone(priority?: LearningPriority) {
  if (priority === "high") return "text-rose-600 dark:text-rose-300";
  if (priority === "low") return "text-slate-500 dark:text-slate-400";
  return "text-amber-600 dark:text-amber-300";
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/20"
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </motion.div>
  );
}

export default function LearningHub() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filters, setFilters] = useState<LearningSessionsQuery>({
    page: 1,
    limit: 10,
    status: "",
    subject: "",
    learnerMode: "",
    fromDate: "",
    toDate: "",
    studyDate: "",
  });
  const [activeTimerState, setActiveTimerState] = useState<StoredLearningTimer | null>(
    readStoredLearningTimer,
  );
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getStoredTimerRemainingSeconds(readStoredLearningTimer()),
  );
  const [pausedRemainingSeconds, setPausedRemainingSeconds] = useState<Record<string, number>>(
    readStoredPausedTimers,
  );
  const [alarmRinging, setAlarmRinging] = useState(false);

  const [learnerMode, setLearnerMode] = useState<LearnerMode>("student");
  const [form, setForm] = useState<SessionFormState>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [enableAlarm, setEnableAlarm] = useState(true);
  const [alarmSound, setAlarmSound] = useState(readStoredSelectedAlarmSound);
  const [draftAlarmSound, setDraftAlarmSound] = useState(readStoredSelectedAlarmSound);
  const [customAlarmSounds, setCustomAlarmSounds] = useState<CustomAlarmSound[]>(
    readStoredCustomAlarmSounds,
  );
  const [sharedAlarmSounds, setSharedAlarmSounds] = useState<CustomAlarmSound[]>([]);
  const [alarmSoundSaving, setAlarmSoundSaving] = useState(false);
  const [previewingAlarmId, setPreviewingAlarmId] = useState<string | null>(null);
  const [autoStartBreak, setAutoStartBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState("5");
  const [dailyGoalDraft, setDailyGoalDraft] = useState<string | null>(null);
  const [weeklyGoalDraft, setWeeklyGoalDraft] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null);
  const [timerSessionId, setTimerSessionId] = useState("");
  const [detailsSession, setDetailsSession] = useState<LearningSession | null>(null);
  const [completeTarget, setCompleteTarget] = useState<LearningSession | null>(null);
  const [completeMinutes, setCompleteMinutes] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<LearningSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(getToday());
  const [deleteTarget, setDeleteTarget] = useState<LearningSession | null>(null);
  const [parentControlsDraft, setParentControlsDraft] = useState<ParentControlsState | null>(null);
  const [localSessions, setLocalSessions] = useState<LearningSession[]>([]);
  const formRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toneAlarmIntervalRef = useRef<number | null>(null);

  const activeTimer = activeTimerState?.session ?? null;
  const alarmOptions = useMemo<AlarmSoundOption[]>(
    () => [
      ...defaultAlarmSounds,
      ...sharedAlarmSounds.map((sound) => ({
        id: sound.id,
        label: sound.label,
        dataUrl: sound.dataUrl,
        kind: "file" as const,
      })),
      ...customAlarmSounds.map((sound) => ({
        id: sound.id,
        label: sound.label,
        dataUrl: sound.dataUrl,
        kind: "file" as const,
      })),
    ],
    [customAlarmSounds, sharedAlarmSounds],
  );
  const selectedAlarmSound =
    alarmOptions.find((option) => option.id === alarmSound) ?? alarmOptions[0];
  const draftAlarmOption =
    alarmOptions.find((option) => option.id === draftAlarmSound) ?? alarmOptions[0];

  const sessionsQuery = useQuery({
    queryKey: learningQueryKeys.sessions(filters),
    queryFn: () => getLearningSessions(filters),
  });
  const statsQuery = useQuery({
    queryKey: learningQueryKeys.stats,
    queryFn: getLearningStats,
  });
  const presetsQuery = useQuery({
    queryKey: learningQueryKeys.presets,
    queryFn: getTimerPresets,
  });
  const templatesQuery = useQuery({
    queryKey: learningQueryKeys.templates,
    queryFn: getLearningTemplates,
  });
  const goalsQuery = useQuery({
    queryKey: learningQueryKeys.goals,
    queryFn: getLearningGoals,
  });
  const childControlsQuery = useQuery({
    queryKey: learningQueryKeys.childControls,
    queryFn: getChildControls,
  });

  const sessions = useMemo(() => {
    const backendSessions = sessionsQuery.data?.data ?? [];
    const byId = new Map<string, LearningSession>();
    [...localSessions, ...backendSessions].forEach((session) => {
      byId.set(session._id, { ...byId.get(session._id), ...session });
    });
    return Array.from(byId.values());
  }, [sessionsQuery.data?.data, localSessions]);
  const pagination = sessionsQuery.data?.pagination ?? {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    total: sessions.length,
    totalPages: 1,
  };
  const visiblePagination = {
    ...pagination,
    total: Math.max(pagination.total, sessions.length),
    totalPages: Math.max(1, Math.max(pagination.totalPages, Math.ceil(Math.max(pagination.total, sessions.length) / pagination.limit))),
  };
  const stats: LearningStats = statsQuery.data ?? {
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    totalMinutes: 0,
    completedSessions: 0,
    activeSessions: 0,
    plannedSessions: 0,
    missedSessions: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionMinutes: 0,
    subjectBreakdown: [],
    dailyBreakdown: [],
    learningTypeBreakdown: [],
    priorityBreakdown: [],
  };
  const loading = sessionsQuery.isLoading || statsQuery.isLoading;
  const sessionsLoading = sessionsQuery.isFetching;
  const summaryLoading = statsQuery.isFetching;
  const serviceOffline =
    sessionsQuery.isError ||
    statsQuery.isError ||
    presetsQuery.isError ||
    templatesQuery.isError ||
    goalsQuery.isError ||
    childControlsQuery.isError;
  const subjectOptions = Array.from(
    new Set([
      ...sessions.map((session) => session.subject),
      ...stats.subjectBreakdown.map((item) => item._id ?? item.label ?? item.key ?? ""),
    ].filter(Boolean)),
  );
  const templates = templatesQuery.data ?? defaultLearningTemplates;
  const timerPresets = presetsQuery.data ?? defaultTimerPresets;
  const dailyGoal = dailyGoalDraft ?? String(goalsQuery.data?.dailyGoalMinutes ?? 60);
  const weeklyGoal = weeklyGoalDraft ?? String(goalsQuery.data?.weeklyGoalMinutes ?? 300);
  const parentControls: ParentControlsState =
    parentControlsDraft ?? {
      parentPin: "",
      dailyLimitMinutes: String(childControlsQuery.data?.dailyLimitMinutes ?? 45),
      rewardPointsEnabled: childControlsQuery.data?.rewardPointsEnabled ?? true,
      allowedSubjects:
        childControlsQuery.data?.allowedSubjects?.join(", ") || "Math, English, Science",
      messagePreview:
        childControlsQuery.data?.messagePreview ??
        "Great job. Finish one short session and earn a reward point.",
    };
  const setParentControls: React.Dispatch<React.SetStateAction<ParentControlsState>> = (value) => {
    setParentControlsDraft((current) => {
      const base = current ?? parentControls;
      return typeof value === "function" ? value(base) : value;
    });
  };

  const invalidateLearning = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["learningSessions"] }),
      queryClient.invalidateQueries({ queryKey: learningQueryKeys.stats }),
    ]);
  }, [queryClient]);
  const invalidateLearningStats = useCallback(
    () => queryClient.invalidateQueries({ queryKey: learningQueryKeys.stats }),
    [queryClient],
  );

  const upsertSessionInCache = useCallback((session: LearningSession) => {
    setLocalSessions((current) => {
      const exists = current.some((item) => item._id === session._id);
      return exists
        ? current.map((item) => (item._id === session._id ? session : item))
        : [session, ...current];
    });
    queryClient.setQueriesData<{ data: LearningSession[]; pagination: typeof pagination }>(
      { queryKey: ["learningSessions"] },
      (current) => {
        if (!current) return current;
        const exists = current.data.some((item) => item._id === session._id);
        const data = exists
          ? current.data.map((item) => (item._id === session._id ? session : item))
          : [session, ...current.data];
        return {
          ...current,
          data,
          pagination: {
            ...current.pagination,
            total: exists ? current.pagination.total : current.pagination.total + 1,
            totalPages: Math.max(
              current.pagination.totalPages,
              Math.ceil((exists ? current.pagination.total : current.pagination.total + 1) / current.pagination.limit),
            ),
          },
        };
      },
    );
  }, [queryClient]);

  const mergeCreatedSession = (
    session: LearningSession,
    payload: Parameters<typeof createLearningSession>[0],
  ): LearningSession => ({
    ...session,
    title: session.title === "Learning session" ? payload.title : session.title,
    subject: session.subject === "Learning" ? payload.subject : session.subject,
    goal: session.goal || payload.goal,
    plannedMinutes: session.plannedMinutes || payload.plannedMinutes,
    studyDate: session.studyDate || payload.studyDate,
    date: session.date || payload.date || payload.studyDate,
    learnerMode: session.learnerMode || payload.learnerMode,
    learningType: session.learningType || payload.learningType,
    difficulty: session.difficulty || payload.difficulty,
    priority: session.priority || payload.priority,
    tags: session.tags?.length ? session.tags : payload.tags ?? [],
    notes: session.notes || payload.notes,
  });

  const createMutation = useMutation({
    mutationFn: createLearningSession,
    onSuccess: async (session, payload) => {
      const displaySession = mergeCreatedSession(session, payload);
      upsertSessionInCache(displaySession);
      setSelectedSession(displaySession);
      toast.success("Learning session created");
      await invalidateLearningStats();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create session"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateLearningSession>[1] }) =>
      updateLearningSession(id, payload),
    onSuccess: async (session) => {
      upsertSessionInCache(session);
      if (activeTimerState?.session._id === session._id) {
        setActiveTimerState((current) =>
          current
            ? {
                ...current,
                session: { ...current.session, ...session },
              }
            : current,
        );
      }
      toast.success("Learning session updated");
      await invalidateLearningStats();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update session"),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLearningSession,
    onSuccess: async (_, id) => {
      setLocalSessions((current) => current.filter((session) => session._id !== id));
      if (activeTimerState?.session._id === id) {
        setActiveTimerState(null);
        setRemainingSeconds(0);
        setAlarmRinging(false);
      }
      toast.success("Learning session deleted");
      await invalidateLearning();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete session"),
  });
  const lifecycleMutation = useMutation({
    mutationFn: async ({ action, session, actualMinutes, studyDate }: { action: string; session: LearningSession; actualMinutes?: number; studyDate?: string }) => {
      if (action === "start") return startLearningSession(session._id);
      if (action === "pause") return pauseLearningSession(session._id);
      if (action === "resume") return resumeLearningSession(session._id);
      if (action === "complete") return completeLearningSession(session._id, actualMinutes);
      if (action === "cancel") return cancelLearningSession(session._id);
      if (action === "reschedule") return rescheduleLearningSession(session._id, studyDate ?? getToday());
      return session;
    },
    onSuccess: async (session) => {
      upsertSessionInCache(session);
      if (session.status === "active") {
        const nextRemainingSeconds = Math.max(0, session.plannedMinutes - session.actualMinutes) * 60;
        setActiveTimerState({
          session,
          targetEndAt: Date.now() + nextRemainingSeconds * 1000,
        });
        setRemainingSeconds(nextRemainingSeconds);
      }
      if (session.status !== "active") setActiveTimerState(null);
      await invalidateLearningStats();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Session action failed"),
  });
  const presetMutation = useMutation({
    mutationFn: createTimerPreset,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: learningQueryKeys.presets }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to save preset"),
  });
  const deletePresetMutation = useMutation({
    mutationFn: deleteTimerPreset,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: learningQueryKeys.presets }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete preset"),
  });
  const goalsMutation = useMutation({
    mutationFn: updateLearningGoals,
    onSuccess: async () => {
      toast.success("Learning goals saved");
      await queryClient.invalidateQueries({ queryKey: learningQueryKeys.goals });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to save goals"),
  });
  const childControlsMutation = useMutation({
    mutationFn: updateChildControls,
    onSuccess: async () => {
      toast.success("Child controls saved");
      await queryClient.invalidateQueries({ queryKey: learningQueryKeys.childControls });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to save child controls"),
  });

  const summary = {
    ...stats,
    totalSessions: visiblePagination.total,
    activeSession: sessions.find((session) => session.status === "active") ?? null,
    topSubjects: stats.subjectBreakdown.map((item) => ({
      _id: item._id ?? item.label ?? item.key ?? "Learning",
      totalMinutes: item.totalMinutes,
      sessionCount: item.sessionCount ?? item.count ?? 0,
    })),
    recentSessions: sessions.filter((session) => session.status === "completed").slice(0, 5),
  };
  const sessionSaving = createMutation.isPending || updateMutation.isPending;
  const deletingSessionId = deleteMutation.variables ?? null;

  const refreshAll = async (notify = false) => {
    await invalidateLearning();
    if (notify) toast.success("Learning data refreshed");
  };

  const createSession = async (payload: Parameters<typeof createLearningSession>[0]) => {
    const errors: FormErrors = {};
    if (!payload.title.trim()) errors.title = "Session title is required.";
    if (!payload.subject.trim()) errors.subject = "Subject is required.";
    if (!payload.goal.trim()) errors.goal = "Goal is required.";
    if (!payload.studyDate) errors.date = "Study date is required.";
    if (!Number.isFinite(payload.plannedMinutes) || payload.plannedMinutes < 1 || payload.plannedMinutes > 600) {
      errors.plannedMinutes = "Planned minutes must be between 1 and 600.";
    }
    if (Object.keys(errors).length > 0) return { ok: false as const, errors };
    try {
      await createMutation.mutateAsync(payload);
      return { ok: true as const, errors: {} };
    } catch {
      return { ok: false as const, errors: {} };
    }
  };

  const updateSession = async (id: string, payload: Parameters<typeof updateLearningSession>[1]) => {
    try {
      await updateMutation.mutateAsync({ id, payload });
      return { ok: true as const, errors: {} };
    } catch {
      return { ok: false as const, errors: {} };
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const startSessionTimer = async (session: LearningSession) => {
    if (session.status === "completed" || session.status === "cancelled") {
      toast.error("Finished or cancelled sessions cannot be started.");
      return;
    }

    const remaining = pausedRemainingSeconds[session._id] ?? getSessionRemainingSeconds(session);
    if (remaining <= 0) {
      toast.error("This session has no remaining time.");
      return;
    }

    try {
      const startedSession =
        session.status === "paused"
          ? await resumeLearningSession(session._id)
          : await startLearningSession(session._id);
      const nextSession = { ...session, ...startedSession, status: "active" as const };
      upsertSessionInCache(nextSession);
      setSelectedSession(nextSession);
      setTimerSessionId(nextSession._id);
      setActiveTimerState({
        session: nextSession,
        targetEndAt: Date.now() + remaining * 1000,
      });
      setPausedRemainingSeconds((current) => {
        const next = { ...current };
        delete next[session._id];
        return next;
      });
      setRemainingSeconds(remaining);
      setAlarmRinging(false);
      await invalidateLearningStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start timer");
    }
  };

  const pauseSessionTimer = async () => {
    if (!activeTimer) return;
    const pausedSeconds = Math.max(0, remainingSeconds);
    const actualMinutes = getStudiedMinutes(activeTimer, remainingSeconds);

    try {
      const pausedSession = await pauseLearningSession(activeTimer._id);
      let nextSession = {
        ...activeTimer,
        ...pausedSession,
        actualMinutes,
        status: "paused" as const,
      };

      try {
        const savedProgressSession = await updateLearningSession(activeTimer._id, {
          actualMinutes,
        });
        nextSession = {
          ...nextSession,
          ...savedProgressSession,
          actualMinutes,
          status: "paused" as const,
        };
      } catch {
        // The lifecycle pause already succeeded; keep the UI paused even if
        // the backend refuses a separate progress-only patch.
      }

      upsertSessionInCache(nextSession);
      setSelectedSession(nextSession);
      setTimerSessionId(nextSession._id);
      setPausedRemainingSeconds((current) => ({
        ...current,
        [nextSession._id]: pausedSeconds,
      }));
      setActiveTimerState(null);
      setRemainingSeconds(pausedSeconds);
      await invalidateLearningStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to pause timer");
    }
  };

  const completeSessionManually = async () => {
    if (!activeTimer) return;
    const actualMinutes = Math.max(
      getStudiedMinutes(activeTimer, remainingSeconds),
      activeTimer.actualMinutes || 0,
    );
    const completedSession = await completeLearningSession(activeTimer._id, actualMinutes);
    upsertSessionInCache({
      ...activeTimer,
      ...completedSession,
      status: "completed",
      actualMinutes,
    });
    setSelectedSession({
      ...activeTimer,
      ...completedSession,
      status: "completed",
      actualMinutes,
    });
    setActiveTimerState(null);
    setPausedRemainingSeconds((current) => {
      const next = { ...current };
      delete next[activeTimer._id];
      return next;
    });
    setRemainingSeconds(0);
    setAlarmRinging(false);
    await invalidateLearningStats();
  };

  const resetSessionTimer = () => {
    if (!activeTimer) return;
    const resetSeconds = activeTimer.plannedMinutes * 60;
    setActiveTimerState({
      session: { ...activeTimer, actualMinutes: 0 },
      targetEndAt: Date.now() + resetSeconds * 1000,
    });
    setRemainingSeconds(resetSeconds);
  };

  const saveGoals = async () => {
    const dailyGoalMinutes = Number(dailyGoal);
    const weeklyGoalMinutes = Number(weeklyGoal);
    if (
      !Number.isFinite(dailyGoalMinutes) ||
      !Number.isFinite(weeklyGoalMinutes) ||
      dailyGoalMinutes < 1 ||
      dailyGoalMinutes > 600 ||
      weeklyGoalMinutes < 1
    ) {
      toast.error("Use valid goal minutes. Daily goal must be 1-600.");
      return;
    }
    await goalsMutation.mutateAsync({
      dailyGoalMinutes,
      weeklyGoalMinutes,
      learnerMode,
    });
    setDailyGoalDraft(null);
    setWeeklyGoalDraft(null);
  };

  const saveChildControls = async () => {
    const dailyLimitMinutes = Number(parentControls.dailyLimitMinutes);
    if (!Number.isFinite(dailyLimitMinutes) || dailyLimitMinutes < 1 || dailyLimitMinutes > 600) {
      toast.error("Daily child limit must be between 1 and 600 minutes.");
      return;
    }
    await childControlsMutation.mutateAsync({
      dailyLimitMinutes,
      rewardPointsEnabled: parentControls.rewardPointsEnabled,
      allowedSubjects: parseTags(parentControls.allowedSubjects),
      messagePreview: parentControls.messagePreview,
      parentPin: parentControls.parentPin || undefined,
    });
    setParentControlsDraft(null);
  };

  const updateFilterField = (field: "status" | "subject" | "learnerMode" | "studyDate" | "fromDate" | "toDate", value: string) => {
    setFilters((current) => ({ ...current, [field]: value, page: 1 }));
  };

  const applyFilters = async (nextFilters: Partial<LearningSessionsQuery> = {}) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const goToPage = async (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const playToneOnce = useCallback((frequency: number) => {
    if (typeof window === "undefined") return;
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.6);
    window.setTimeout(() => void context.close().catch(() => null), 800);
  }, []);

  const stopAlarmAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (toneAlarmIntervalRef.current !== null) {
      window.clearInterval(toneAlarmIntervalRef.current);
      toneAlarmIntervalRef.current = null;
    }
    setPreviewingAlarmId(null);
  }, []);

  const stopAlarm = useCallback(() => {
    stopAlarmAudio();
    setAlarmRinging(false);
  }, [stopAlarmAudio]);

  const playAlarmOption = useCallback(
    async (option: AlarmSoundOption, loop: boolean) => {
      stopAlarmAudio();

      if (option.kind === "file") {
        const audio = new Audio(option.dataUrl);
        audio.loop = loop;
        audioRef.current = audio;
        setPreviewingAlarmId(option.id);
        try {
          await audio.play();
        } catch {
          toast.error("Browser blocked audio playback. Click Preview once before relying on this alarm.");
        }
        if (!loop) {
          audio.onended = () => setPreviewingAlarmId(null);
        }
        return;
      }

      setPreviewingAlarmId(option.id);
      playToneOnce(option.frequency);
      if (loop) {
        toneAlarmIntervalRef.current = window.setInterval(() => {
          playToneOnce(option.frequency);
        }, 1400);
      } else {
        window.setTimeout(() => setPreviewingAlarmId(null), 900);
      }
    },
    [playToneOnce, stopAlarmAudio],
  );

  const handleAlarmUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload an audio file.");
      return;
    }
    if (file.size > 1_500_000) {
      toast.error("Use an audio file under 1.5 MB so it can be saved in your browser.");
      return;
    }

    try {
      setAlarmSoundSaving(true);
      const dataUrl = await fileToDataUrl(file);
      const label = file.name.replace(/\.[^/.]+$/, "") || "Custom alarm";
      const sound = isAdmin
        ? await createSharedAlarmSound({
            label,
            dataUrl,
            mimeType: file.type,
            size: file.size,
          })
        : {
            id: `custom-${Date.now()}`,
            label,
            dataUrl,
            shared: false,
          };
      if (isAdmin) {
        setSharedAlarmSounds((current) => [sound, ...current]);
      } else {
        setCustomAlarmSounds((current) => [...current, sound]);
      }
      setDraftAlarmSound(sound.id);
      toast.success(
        isAdmin
          ? "Shared alarm uploaded for all users. Preview it, then apply if you like it."
          : "Personal alarm uploaded. Ask an admin to add sounds for everyone.",
      );
    } catch {
      toast.error("Failed to save that audio file.");
    } finally {
      setAlarmSoundSaving(false);
    }
  };

  const removeAlarmSound = async (option: AlarmSoundOption) => {
    if (option.kind !== "file") return;
    const sharedSound = sharedAlarmSounds.find((sound) => sound.id === option.id);

    try {
      setAlarmSoundSaving(true);
      if (sharedSound) {
        if (!isAdmin) {
          toast.error("Only admins can remove shared alarm sounds.");
          return;
        }
        await deleteSharedAlarmSound(option.id);
        setSharedAlarmSounds((current) => current.filter((sound) => sound.id !== option.id));
      } else {
        setCustomAlarmSounds((current) => current.filter((sound) => sound.id !== option.id));
      }

      if (alarmSound === option.id) setAlarmSound("classic-beep");
      if (draftAlarmSound === option.id) setDraftAlarmSound("classic-beep");
      stopAlarmAudio();
      toast.success("Alarm sound removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove alarm sound");
    } finally {
      setAlarmSoundSaving(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (activeTimerState) {
      window.localStorage.setItem(ACTIVE_LEARNING_TIMER_KEY, JSON.stringify(activeTimerState));
    } else {
      window.localStorage.removeItem(ACTIVE_LEARNING_TIMER_KEY);
    }
  }, [activeTimerState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (Object.keys(pausedRemainingSeconds).length > 0) {
      window.localStorage.setItem(
        PAUSED_LEARNING_TIMERS_KEY,
        JSON.stringify(pausedRemainingSeconds),
      );
    } else {
      window.localStorage.removeItem(PAUSED_LEARNING_TIMERS_KEY);
    }
  }, [pausedRemainingSeconds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CUSTOM_ALARM_SOUNDS_KEY, JSON.stringify(customAlarmSounds));
  }, [customAlarmSounds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SELECTED_ALARM_SOUND_KEY, alarmSound);
  }, [alarmSound]);

  useEffect(() => {
    let cancelled = false;

    void requestSharedAlarmSounds()
      .then((sounds) => {
        if (!cancelled) setSharedAlarmSounds(sounds);
      })
      .catch(() => {
        if (!cancelled) setSharedAlarmSounds([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeTimerState) return;

    const tick = () => {
      const nextRemaining = getStoredTimerRemainingSeconds(activeTimerState);
      setRemainingSeconds(nextRemaining);

      if (nextRemaining > 0) return;

      setActiveTimerState(null);
      setAlarmRinging(true);
      emitFeedbackEffect("learning.timer.finish.success");
      if (enableAlarm) {
        void playAlarmOption(selectedAlarmSound, true);
      }
      void completeLearningSession(
        activeTimerState.session._id,
        activeTimerState.session.plannedMinutes,
      )
        .then((completedSession) => {
          upsertSessionInCache({
            ...activeTimerState.session,
            ...completedSession,
            status: "completed",
            actualMinutes: activeTimerState.session.plannedMinutes,
          });
          return invalidateLearningStats();
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Failed to complete session");
        });
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [
    activeTimerState,
    enableAlarm,
    invalidateLearningStats,
    playAlarmOption,
    selectedAlarmSound,
    upsertSessionInCache,
  ]);

  const selectedMode = learnerModes.find((mode) => mode.value === learnerMode) ?? learnerModes[0];
  const startableSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.status !== "completed" &&
          session.status !== "cancelled" &&
          session.plannedMinutes > (session.actualMinutes || 0),
      ),
    [sessions],
  );
  const selectedTimerSession =
    startableSessions.find((session) => session._id === timerSessionId) ??
    startableSessions.find((session) => session._id === selectedSession?._id) ??
    startableSessions[0] ??
    null;
  const chartData = useMemo(() => {
    const bySubject = new Map<string, number>();
    sessions.forEach((session) => {
      const subject = session.subject?.trim() || "Learning";
      const minutes = session.actualMinutes || session.plannedMinutes || 0;
      bySubject.set(subject, (bySubject.get(subject) ?? 0) + minutes);
    });
    const localData = Array.from(bySubject.entries()).map(([name, totalMinutes]) => ({
      name,
      totalMinutes,
    }));
    if (localData.length > 0) return localData;
    return summary.topSubjects.map((subject) => ({
      name: subject._id?.trim() || "Learning",
      totalMinutes: subject.totalMinutes,
    }));
  }, [sessions, summary.topSubjects]);
  const goalProgress = Math.min(100, Math.round((summary.todayMinutes / Math.max(1, Number(dailyGoal))) * 100));
  const nextSessionMessage =
    summary.todayMinutes >= Number(dailyGoal)
      ? "Daily goal complete. A light review session is enough now."
      : `You studied ${formatMinutes(summary.todayMinutes)} of ${formatMinutes(Number(dailyGoal) || 0)} minutes today. Try a ${learnerMode === "child" ? "10" : "25"} minute session next.`;
  const starterSession = selectedTimerSession;
  const displayTimerSeconds = activeTimer
    ? remainingSeconds
    : pausedRemainingSeconds[starterSession?._id ?? ""] ?? getSessionRemainingSeconds(starterSession);

  const resetForm = () => {
    setEditingSessionId(null);
    setSelectedTemplate("");
    setErrors({});
    setForm(emptyForm(subjectOptions[0] ?? ""));
  };

  const patchForm = (patch: Partial<SessionFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const applyTemplate = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = templates.find((item) => item.name === templateName);
    if (!template) return;
    patchForm({
      title: template.title,
      subject: template.subject,
      goal: template.goal,
      plannedMinutes: String(template.plannedMinutes),
      learningType: template.learningType,
      notes: template.notes,
    });
  };

  const buildPayload = () => ({
    title: form.title,
    subject: form.subject,
    goal: form.goal,
    plannedMinutes: Number(form.plannedMinutes),
    studyDate: form.date,
    date: form.date,
    learnerMode,
    learningType: form.learningType,
    difficulty: form.difficulty,
    priority: form.priority,
    tags: parseTags(form.tags),
    notes: form.notes,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = buildPayload();
    const result = editingSessionId
      ? await updateSession(editingSessionId, payload)
      : await createSession(payload);
    setErrors(result.errors);
    if (result.ok) resetForm();
  };

  const handleEdit = (session: LearningSession) => {
    setEditingSessionId(session._id);
    setSelectedSession(session);
    setDetailsSession(null);
    setErrors({});
    setForm(sessionToForm(session));
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCompleteSession = async (session: LearningSession) => {
    if (activeTimer?._id === session._id) {
      await completeSessionManually();
      return;
    }
    setCompleteTarget(session);
    setCompleteMinutes(String(session.actualMinutes || session.plannedMinutes));
  };

  const submitCompleteSession = async () => {
    if (!completeTarget) return;
    const actualMinutes = Number(completeMinutes);
    if (!Number.isFinite(actualMinutes) || actualMinutes < 0) {
      toast.error("Actual minutes must be 0 or more.");
      return;
    }
    await lifecycleMutation.mutateAsync({
      action: "complete",
      session: completeTarget,
      actualMinutes,
    });
    setCompleteTarget(null);
  };

  const openRescheduleModal = (session: LearningSession) => {
    setRescheduleTarget(session);
    setRescheduleDate((session.studyDate ?? session.date ?? getToday()).slice(0, 10));
  };

  const submitRescheduleSession = async () => {
    if (!rescheduleTarget) return;
    if (!rescheduleDate) {
      toast.error("Choose a new study date.");
      return;
    }
    await lifecycleMutation.mutateAsync({
      action: "reschedule",
      session: rescheduleTarget,
      studyDate: rescheduleDate,
    });
    setRescheduleTarget(null);
  };

  const handleDelete = async (session: LearningSession) => {
    setDeleteTarget(session);
  };

  const submitDeleteSession = async () => {
    if (!deleteTarget) return;
    const session = deleteTarget;
    const ok = await deleteSession(session._id);
    if (ok) {
      if (editingSessionId === session._id) resetForm();
      if (selectedSession?._id === session._id) setSelectedSession(null);
      if (detailsSession?._id === session._id) setDetailsSession(null);
      setDeleteTarget(null);
    }
  };

  const handleApplyFilters = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    await applyFilters({ page: 1 });
  };

  const handleSavePreset = async () => {
    const minutes = Number(customMinutes);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 600) {
      toast.error("Preset minutes must be between 1 and 600.");
      return;
    }
    await presetMutation.mutateAsync({ minutes, label: `${minutes} min` });
    patchForm({ plannedMinutes: String(minutes) });
    setCustomMinutes("");
  };

  const handleRemovePreset = async (preset: TimerPreset) => {
    if (preset.isDefault || defaultTimerPresets.some((item) => item.minutes === preset.minutes)) return;
    const id = preset._id ?? preset.id;
    if (id) {
      await deletePresetMutation.mutateAsync(id);
      return;
    }
    toast("Custom preset will disappear after backend returns an id for it.");
  };

  const createSampleSession = async () => {
    await createSession({
      title: "Starter study block",
      subject: learnerMode === "child" ? "Reading" : "Learning",
      goal: "Start with a simple focused session.",
      plannedMinutes: 10,
      studyDate: getToday(),
      date: getToday(),
      learnerMode,
      learningType: "reading",
      difficulty: "easy",
      priority: "medium",
      tags: ["starter"],
      notes: "Begin with 10 minutes and write one thing you learned.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-[#08111f] sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-5">
          <div className="h-56 animate-pulse rounded-2xl bg-white shadow-xl shadow-slate-200/60 dark:bg-slate-900" />
          <div className="grid gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-2xl bg-white shadow-xl shadow-slate-200/60 dark:bg-slate-900" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,#f8fafc,#eef6fb)] text-slate-950 dark:bg-[radial-gradient(circle_at_12%_0%,rgba(20,184,166,0.2),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#06101e,#08111f_45%,#06101e)] dark:text-white">
      <div className="relative z-10 space-y-5 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 dark:border-cyan-300/10 dark:bg-[#081120]/95 dark:shadow-cyan-950/30 sm:p-6 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
            <div className="flex min-h-[280px] flex-col justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-300">
                <Brain className="h-3.5 w-3.5" />
                Learning Lab
              </div>
              <div className="mt-8 max-w-4xl">
                <h1 className="text-[clamp(2.1rem,7vw,5rem)] font-black leading-[0.95] tracking-[-0.055em] text-slate-950 dark:text-white">
                  Learning that feels calm, guided, and finishable.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Build sessions for school, work, children, or self-study. The page stays visible even when the backend is offline; actions simply wait until the service returns.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4 shadow-inner shadow-white dark:border-cyan-300/10 dark:bg-[#0d192b]/85 dark:shadow-none">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-500">Today Cockpit</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Fast read, no clutter</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${serviceOffline ? "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"}`}>
                  {serviceOffline ? "Offline-safe" : "Live"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { label: "Today", value: `${formatMinutes(summary.todayMinutes)}m` },
                { label: "Streak", value: `${summary.currentStreak} days` },
                { label: "Active", value: activeTimer ? activeTimer.subject : "No timer" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-cyan-300/10 dark:bg-[#07101e]">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>

        <section className={panelClass}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500 dark:text-cyan-300">Learner Mode</p>
              <h2 className="mt-2 text-2xl font-black">Pick the context for today</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{selectedMode.helper}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {learnerModes.map((mode) => {
              const Icon = mode.icon;
              const active = learnerMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setLearnerMode(mode.value)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-cyan-300 bg-cyan-50 shadow-lg shadow-cyan-500/10 dark:border-cyan-500/40 dark:bg-cyan-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-cyan-200 dark:border-slate-700 dark:bg-slate-950/60"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-cyan-600 dark:text-cyan-300" : "text-slate-500"}`} />
                  <p className="mt-3 text-sm font-black">{mode.label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{mode.presets.join(" | ")}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Today Minutes" value={`${formatMinutes(summary.todayMinutes)}m`} subtitle="Learning time logged today." icon={Clock3} gradient="from-cyan-500 to-sky-400" />
          <StatCard title="Week Minutes" value={`${formatMinutes(summary.weekMinutes)}m`} subtitle="Your weekly study load." icon={CalendarDays} gradient="from-amber-500 to-orange-400" />
          <StatCard title="Completion Rate" value={`${summary.completionRate}%`} subtitle="Completed sessions versus total." icon={CheckCircle2} gradient="from-emerald-500 to-lime-400" />
          <StatCard title="Current Streak" value={`${summary.currentStreak}`} subtitle="Consecutive learning days." icon={Trophy} gradient="from-rose-500 to-orange-400" />
        </section>

        <section className={`${panelClass} overflow-hidden`}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] xl:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">Learning Goals</p>
              <h2 className="mt-2 text-2xl font-black">Progress for today</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{nextSessionMessage}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Daily goal minutes</span>
                <input className={inputClass} type="number" min="1" value={dailyGoal} onChange={(e) => setDailyGoalDraft(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Weekly goal minutes</span>
                <input className={inputClass} type="number" min="1" value={weeklyGoal} onChange={(e) => setWeeklyGoalDraft(e.target.value)} />
              </label>
            </div>
          </div>
          <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 dark:border-cyan-300/10 dark:bg-[#07101e]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4 text-sm font-bold">
                  <span>Current progress</span>
                  <span className="text-lg font-black text-cyan-600 dark:text-cyan-300">{goalProgress}%</span>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 shadow-[0_0_24px_rgba(34,211,238,0.45)]" style={{ width: `${goalProgress}%` }} />
                </div>
              </div>
              <button type="button" onClick={() => void saveGoals()} disabled={goalsMutation.isPending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-300 dark:text-slate-950">
                {goalsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save goals
              </button>
            </div>
          </div>
        </section>

        {serviceOffline ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            Backend connection is unavailable right now. You can still view the Learning dashboard layout, but save/start actions need the service to reconnect.
          </div>
        ) : null}

        <section className="grid items-start gap-5 xl:grid-cols-[1.02fr_0.98fr]">
          <div ref={formRef} className={panelClass}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500 dark:text-cyan-300">Session Builder</p>
                <h2 className="mt-2 text-2xl font-black">{editingSessionId ? "Edit learning session" : "Create a learning session"}</h2>
              </div>
              {editingSessionId ? (
                <button type="button" onClick={resetForm} className={secondaryButton}>
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <FormSection title="Start Point" description="Choose a saved structure or start blank. You can still edit every field below.">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Session template</span>
                  <select className={inputClass} value={selectedTemplate} onChange={(e) => applyTemplate(e.target.value)}>
                    <option value="">Start blank or choose a template</option>
                    {templates.map((template) => (
                      <option key={template.name} value={template.name}>{template.name}</option>
                    ))}
                  </select>
                </label>
              </FormSection>

              <FormSection title="Basics" description="Name the session and define what finished means.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Session title" error={errors.title}>
                    <input className={inputClass} value={form.title} onChange={(e) => patchForm({ title: e.target.value })} placeholder="DSA revision" />
                  </Field>
                  <Field label="Subject" error={errors.subject}>
                    <input className={inputClass} value={form.subject} onChange={(e) => patchForm({ subject: e.target.value })} placeholder="Algorithms" list="learning-subjects" />
                    <datalist id="learning-subjects">
                      {subjectOptions.map((subject) => <option key={subject} value={subject} />)}
                    </datalist>
                  </Field>
                </div>

                <Field label="Goal" error={errors.goal}>
                  <input className={inputClass} value={form.goal} onChange={(e) => patchForm({ goal: e.target.value })} placeholder="Solve 3 practice problems and review mistakes" />
                </Field>
              </FormSection>

              <FormSection title="Time" description="Set the planned duration and study date. Presets update the minutes field instantly.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Planned minutes" error={errors.plannedMinutes}>
                    <input className={inputClass} type="number" min="1" value={form.plannedMinutes} onChange={(e) => patchForm({ plannedMinutes: e.target.value })} />
                  </Field>
                  <Field label="Study date" error={errors.date}>
                    <input className={inputClass} type="date" value={form.date} onChange={(e) => patchForm({ date: e.target.value })} />
                  </Field>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-black">Editable timer presets</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Click to apply</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {timerPresets.map((preset) => {
                      const isDefault = defaultTimerPresets.some((item) => item.minutes === preset.minutes);
                      const active = form.plannedMinutes === String(preset.minutes);
                      return (
                        <span key={`${preset._id ?? preset.id ?? preset.minutes}-${preset.minutes}`} className={`group inline-flex overflow-hidden rounded-full border transition hover:-translate-y-0.5 hover:shadow-lg ${active ? "border-cyan-300 bg-cyan-50 text-cyan-700 shadow-cyan-500/10 dark:border-cyan-400/40 dark:bg-cyan-400/10 dark:text-cyan-200" : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}>
                          <button type="button" onClick={() => patchForm({ plannedMinutes: String(preset.minutes) })} className="cursor-pointer px-3 py-2 text-sm font-bold transition group-hover:bg-cyan-50 dark:group-hover:bg-cyan-400/10">
                            {preset.minutes} min
                          </button>
                          {!isDefault ? (
                            <button type="button" aria-label={`Delete ${preset.minutes} minute preset`} onClick={() => void handleRemovePreset(preset)} className="cursor-pointer border-l border-slate-200 px-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:border-slate-700 dark:hover:bg-rose-500/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input className={inputClass} type="number" min="1" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} placeholder="Custom minutes" />
                    <button type="button" onClick={() => void handleSavePreset()} className={secondaryButton}>
                      <Save className="h-4 w-4" />
                      Save preset
                    </button>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Session Details" description="Keep the metadata, but grouped so scanning is easier.">
                <div className="grid gap-4 md:grid-cols-3">
                  <SelectField label="Learning type" value={form.learningType} onChange={(value) => patchForm({ learningType: value as LearningType })} options={learningTypes} />
                  <SelectField label="Difficulty" value={form.difficulty} onChange={(value) => patchForm({ difficulty: value as LearningDifficulty })} options={difficulties} />
                  <SelectField label="Priority" value={form.priority} onChange={(value) => patchForm({ priority: value as LearningPriority })} options={priorities} />
                </div>

                <Field label="Tags">
                  <input className={inputClass} value={form.tags} onChange={(e) => patchForm({ tags: e.target.value })} placeholder="exam, chapter-4, practice" />
                </Field>

                <Field label="Notes">
                  <textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => patchForm({ notes: e.target.value })} placeholder="Chapters, links, mistakes to review, or parent instructions..." />
                </Field>
              </FormSection>

              {learnerMode === "child" ? (
                <ChildControls
                  controls={parentControls}
                  setControls={setParentControls}
                  onSave={saveChildControls}
                  saving={childControlsMutation.isPending}
                />
              ) : null}

              <button type="submit" disabled={sessionSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70">
                {sessionSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingSessionId ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingSessionId ? "Update session" : "Create session"}
              </button>
            </form>
          </div>

          <div className={panelClass}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-300">Live Timer</p>
                <h2 className="mt-2 text-2xl font-black">Study clock and alarm</h2>
              </div>
              <button onClick={() => void refreshAll(true)} className={secondaryButton} aria-label="Refresh learning data">
                <RefreshCcw className={`h-4 w-4 ${summaryLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
                <AlarmClock className="h-3.5 w-3.5" />
                {alarmRinging ? "Alarm ringing" : activeTimer ? "Timer running" : starterSession?.status === "paused" ? "Paused" : "Ready"}
              </div>

              <label className="mb-5 block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Session to start
                </span>
                <select
                  className={inputClass}
                  value={selectedTimerSession?._id ?? ""}
                  onChange={(event) => {
                    const session = startableSessions.find((item) => item._id === event.target.value) ?? null;
                    setTimerSessionId(event.target.value);
                    setSelectedSession(session);
                  }}
                  disabled={Boolean(activeTimer) || startableSessions.length === 0}
                >
                  {startableSessions.length === 0 ? (
                    <option value="">No incomplete sessions available</option>
                  ) : null}
                  {startableSessions.map((session) => (
                    <option key={session._id} value={session._id}>
                      {session.title} - {session.subject} - {formatCountdown(pausedRemainingSeconds[session._id] ?? getSessionRemainingSeconds(session))} left
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center justify-center">
                <div className="flex h-56 w-56 items-center justify-center rounded-full border-[16px] border-cyan-500/70 bg-white text-center text-5xl font-black text-slate-950 shadow-[inset_0_20px_60px_rgba(15,23,42,0.08)] dark:bg-slate-900 dark:text-white">
                  {formatCountdown(displayTimerSeconds)}
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                  {activeTimer?.subject ?? starterSession?.subject ?? "No active subject"}
                </p>
                <h3 className="mt-2 text-2xl font-black">{activeTimer?.title ?? starterSession?.title ?? "Choose a session"}</h3>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {activeTimer?.goal ?? starterSession?.goal ?? "Select or create a session to begin."}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {alarmRinging ? "Time is up. Stop the alarm when you are done." : enableAlarm ? `${selectedAlarmSound.label} alarm enabled` : "Alarm disabled"}
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => selectedTimerSession && void startSessionTimer(selectedTimerSession)} disabled={Boolean(activeTimer) || !selectedTimerSession} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-400 dark:text-slate-950">
                  <Play className="h-4 w-4" />
                  Start
                </button>
                <button type="button" onClick={() => void pauseSessionTimer()} disabled={!activeTimer} className={secondaryButton}>
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
                <button type="button" onClick={() => selectedTimerSession && void startSessionTimer(selectedTimerSession)} disabled={Boolean(activeTimer) || selectedTimerSession?.status !== "paused"} className={secondaryButton}>
                  <Play className="h-4 w-4" />
                  Resume
                </button>
                <button type="button" onClick={() => void completeSessionManually()} disabled={!activeTimer} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </button>
                <button type="button" onClick={stopAlarm} disabled={!alarmRinging} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                  <RotateCcw className="h-4 w-4" />
                  Stop alarm
                </button>
                <button type="button" onClick={resetSessionTimer} disabled={!activeTimer} className={secondaryButton}>
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableAlarm}
                    onChange={(e) => {
                      setEnableAlarm(e.target.checked);
                      if (!e.target.checked) setAlarmRinging(false);
                    }}
                  />
                  Enable alarm
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={autoStartBreak} onChange={(e) => setAutoStartBreak(e.target.checked)} />
                  Auto start break
                </label>
                <div className="space-y-2 sm:col-span-2">
                  <span className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Alarm sound
                  </span>
                  <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
                    <select className={inputClass} value={draftAlarmSound} onChange={(e) => setDraftAlarmSound(e.target.value)}>
                      {alarmOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void playAlarmOption(draftAlarmOption, false)}
                      className={secondaryButton}
                    >
                      <Play className="h-4 w-4" />
                      {previewingAlarmId === draftAlarmOption.id ? "Playing" : "Preview"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlarmSound(draftAlarmOption.id);
                        toast.success(`${draftAlarmOption.label} applied`);
                      }}
                      className={secondaryButton}
                    >
                      <Save className="h-4 w-4" />
                      Apply
                    </button>
                  </div>
                  <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
                    <input
                      className={inputClass}
                      type="file"
                      accept="audio/*"
                      disabled={alarmSoundSaving}
                      onChange={(event) => {
                        void handleAlarmUpload(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                    {draftAlarmOption.kind === "file" ? (
                      <button
                        type="button"
                        disabled={alarmSoundSaving}
                        onClick={() => void removeAlarmSound(draftAlarmOption)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                      >
                        {alarmSoundSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Active alarm: {selectedAlarmSound.label}. {isAdmin ? "Admin uploads are shared with every user." : "Your uploads stay personal; admin uploads appear here for everyone."} Use MP3, WAV, OGG, or M4A under 1.5 MB.
                  </p>
                </div>
                <input className={inputClass} type="number" min="1" value={breakDuration} onChange={(e) => setBreakDuration(e.target.value)} placeholder="Break duration" />
              </div>
            </div>
          </div>
        </section>

        <section className={panelClass}>
            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 dark:text-orange-300">Learning Queue</p>
                <h2 className="mt-2 text-2xl font-black">Your study blocks</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Open a card for details, notes, and full session metadata.</p>
              </div>
              <form onSubmit={handleApplyFilters} className="grid gap-2 sm:grid-cols-[160px_minmax(160px,1fr)_auto] xl:min-w-[440px]">
                <select className={inputClass} value={filters.status} onChange={(e) => updateFilterField("status", e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
                <input className={inputClass} value={filters.subject} list="learning-filter-subjects" onChange={(e) => updateFilterField("subject", e.target.value)} placeholder="Filter subject" />
                <datalist id="learning-filter-subjects">
                  {subjectOptions.map((subject) => <option key={subject} value={subject} />)}
                </datalist>
                <button type="submit" disabled={sessionsLoading} className={secondaryButton}>
                  {sessionsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Apply
                </button>
              </form>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-3 dark:border-cyan-300/10 dark:bg-[#07101e]/70">
              {sessionsLoading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-50 dark:bg-slate-800" />)}
                </div>
              ) : sessions.length > 0 ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {sessions.map((session) => (
                    <SessionQueueCard
                      key={session._id}
                      session={session}
                      activeTimer={activeTimer}
                      deleting={deletingSessionId === session._id}
                      onOpen={() => { setDetailsSession(session); setSelectedSession(session); }}
                      onStart={() => { setSelectedSession(session); void startSessionTimer(session); }}
                      onPause={() => void pauseSessionTimer()}
                      onResume={() => { setSelectedSession(session); void startSessionTimer(session); }}
                      onEdit={() => handleEdit(session)}
                      onComplete={() => void handleCompleteSession(session)}
                      onReschedule={() => openRescheduleModal(session)}
                      onCancel={() => void lifecycleMutation.mutateAsync({ action: "cancel", session })}
                      onDelete={() => void handleDelete(session)}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-black">No learning sessions yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">Create your first study block. Start with 10 minutes if you are new.</p>
                  <button type="button" onClick={() => void createSampleSession()} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-black text-slate-950">
                    <Plus className="h-4 w-4" />
                    Create sample session
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Page {visiblePagination.page} of {visiblePagination.totalPages} | {visiblePagination.total} total sessions</p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button type="button" onClick={() => void goToPage(Math.max(1, visiblePagination.page - 1))} disabled={visiblePagination.page <= 1 || sessionsLoading} className={secondaryButton}>Previous</button>
                <button type="button" onClick={() => void goToPage(Math.min(visiblePagination.totalPages, visiblePagination.page + 1))} disabled={visiblePagination.page >= visiblePagination.totalPages || sessionsLoading} className={secondaryButton}>Next</button>
              </div>
            </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
            <div className={panelClass}>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500 dark:text-cyan-300">Subject Mix</p>
              <h2 className="mt-2 text-2xl font-black">Where your learning time goes</h2>
              <div className="mt-6 h-72 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,0.16)", background: "#0f172a", color: "#fff" }} />
                      <Bar dataKey="totalMinutes" radius={[12, 12, 4, 4]}>
                        {chartData.map((item, index) => <Cell key={item.name} fill={subjectChartColors[index % subjectChartColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <BookOpen className="h-8 w-8 text-slate-400" />
                    <h3 className="mt-3 text-lg font-black">No subject data yet</h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">Complete sessions to see where your learning time goes.</p>
                  </div>
                )}
              </div>
            </div>

            <div className={panelClass}>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">Recent Learning</p>
              <h2 className="mt-2 text-2xl font-black">Latest completed sessions</h2>
              <div className="mt-5 space-y-3">
                {summary.recentSessions.length > 0 ? summary.recentSessions.slice(0, 5).map((session) => (
                  <button key={session._id} type="button" onClick={() => setDetailsSession(session)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-950/60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{session.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{session.subject} | {formatMinutes(session.actualMinutes || session.plannedMinutes)}m</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusTone(session.status)}`}>{session.status}</span>
                    </div>
                  </button>
                )) : (
                  <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Completed sessions will appear here after your first study block.</p>
                )}
              </div>
            </div>
        </section>
      </div>

      {detailsSession ? (
        <SessionDetailsModal session={detailsSession} onClose={() => setDetailsSession(null)} onEdit={handleEdit} />
      ) : null}
      {completeTarget ? (
        <CompleteSessionModal
          session={completeTarget}
          minutes={completeMinutes}
          setMinutes={setCompleteMinutes}
          saving={lifecycleMutation.isPending}
          onClose={() => setCompleteTarget(null)}
          onSubmit={submitCompleteSession}
        />
      ) : null}
      {rescheduleTarget ? (
        <RescheduleSessionModal
          session={rescheduleTarget}
          studyDate={rescheduleDate}
          setStudyDate={setRescheduleDate}
          saving={lifecycleMutation.isPending}
          onClose={() => setRescheduleTarget(null)}
          onSubmit={submitRescheduleSession}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteSessionModal
          session={deleteTarget}
          deleting={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={submitDeleteSession}
        />
      ) : null}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      {children}
      {error ? <span className="block text-sm font-semibold text-rose-500">{error}</span> : null}
    </label>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-cyan-300/10 dark:bg-[#07101e]/80">
      <div className="mb-4">
        <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ChildControls({
  controls,
  setControls,
  onSave,
  saving,
}: {
  controls: ParentControlsState;
  setControls: React.Dispatch<React.SetStateAction<ParentControlsState>>;
  onSave: () => void | Promise<void>;
  saving: boolean;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
      <p className="text-sm font-black text-amber-700 dark:text-amber-200">Parent controls</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className={inputClass} placeholder="Parent PIN placeholder" value={controls.parentPin} onChange={(e) => setControls((current) => ({ ...current, parentPin: e.target.value }))} />
        <input className={inputClass} type="number" min="1" placeholder="Daily limit minutes" value={controls.dailyLimitMinutes} onChange={(e) => setControls((current) => ({ ...current, dailyLimitMinutes: e.target.value }))} />
        <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={controls.rewardPointsEnabled} onChange={(e) => setControls((current) => ({ ...current, rewardPointsEnabled: e.target.checked }))} />
          Reward points enabled
        </label>
        <input className={inputClass} placeholder="Allowed subjects" value={controls.allowedSubjects} onChange={(e) => setControls((current) => ({ ...current, allowedSubjects: e.target.value }))} />
      </div>
      <textarea className={`${inputClass} mt-3`} rows={2} value={controls.messagePreview} onChange={(e) => setControls((current) => ({ ...current, messagePreview: e.target.value }))} placeholder="Simple message preview" />
      <button type="button" onClick={() => void onSave()} disabled={saving} className={`${secondaryButton} mt-3`}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save parent controls
      </button>
    </div>
  );
}

function SessionQueueCard({
  session,
  activeTimer,
  deleting,
  onOpen,
  onStart,
  onPause,
  onResume,
  onEdit,
  onComplete,
  onReschedule,
  onCancel,
  onDelete,
}: {
  session: LearningSession;
  activeTimer: LearningSession | null;
  deleting: boolean;
  onOpen: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const isDone = session.status === "completed";
  const isCancelled = session.status === "cancelled";
  const isLocked = isDone || isCancelled;
  const progress = Math.min(100, Math.round(((session.actualMinutes || 0) / Math.max(1, session.plannedMinutes)) * 100));

  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-xl dark:border-cyan-300/10 dark:bg-[#0b1424] dark:shadow-black/20 dark:hover:border-cyan-300/25">
      <button type="button" onClick={onOpen} className="block w-full cursor-pointer p-4 text-left transition hover:bg-cyan-50/60 dark:hover:bg-cyan-400/5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h3 className="mt-3 text-xl font-black leading-tight text-slate-950 dark:text-white">{session.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{session.goal || "No goal added yet."}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${statusTone(session.status)}`}>{session.status}</span>
            <span className={`inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize dark:bg-slate-800 ${priorityTone(session.priority)}`}>{session.priority}</span>
            <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-bold capitalize text-slate-500 dark:border-cyan-300/10 dark:text-slate-400">
              {session.learningType?.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <MiniMeta label="Subject" value={session.subject} />
            <MiniMeta label="Study date" value={formatDate(session.date)} />
            <MiniMeta label="Plan" value={`${formatMinutes(session.actualMinutes || 0)} / ${formatMinutes(session.plannedMinutes)}m`} />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${progress}%` }} />
        </div>
      </button>

      <div className="border-t border-slate-200 bg-slate-50/80 p-3 dark:border-cyan-300/10 dark:bg-[#07101e]/80" onClick={(event) => event.stopPropagation()}>
        <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2">
          {session.status === "active" ? (
            <CommandButton label="Pause" onClick={onPause} icon={<Pause className="h-4 w-4" />} />
          ) : null}
          {session.status === "paused" ? (
            <CommandButton label="Resume" onClick={onResume} disabled={Boolean(activeTimer)} icon={<Play className="h-4 w-4" />} />
          ) : null}
          {!isLocked && session.status !== "active" && session.status !== "paused" ? (
            <CommandButton label="Start" onClick={onStart} disabled={Boolean(activeTimer)} icon={<Play className="h-4 w-4" />} primary />
          ) : null}
          <CommandButton label="Edit" onClick={onEdit} icon={<PencilLine className="h-4 w-4" />} />
          <CommandButton label="Complete" onClick={onComplete} disabled={isDone} icon={<CheckCircle2 className="h-4 w-4" />} />
          <CommandButton label="Move" onClick={onReschedule} disabled={isLocked} icon={<CalendarClock className="h-4 w-4" />} showLabel />
          <CommandButton label="Cancel" onClick={onCancel} disabled={isLocked} icon={<X className="h-4 w-4" />} />
          <CommandButton
            label="Delete"
            onClick={onDelete}
            disabled={deleting}
            danger
            icon={deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          />
        </div>
      </div>
    </article>
  );
}

function CommandButton({
  label,
  icon,
  onClick,
  disabled,
  primary,
  danger,
  showLabel = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 ${
        showLabel ? "px-2.5 sm:px-3" : "w-9 sm:w-10"
      } ${
        primary
          ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          : danger
            ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-cyan-200/10 dark:bg-[#07101e] dark:text-slate-200 dark:hover:border-cyan-300/25 dark:hover:bg-[#0d1b2e]"
      }`}
    >
      {icon}
      <span className={showLabel ? "text-xs sm:text-sm" : "sr-only"}>
        {label}
      </span>
    </button>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-cyan-300/10 dark:bg-[#07101e]">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

function CompleteSessionModal({
  session,
  minutes,
  setMinutes,
  saving,
  onClose,
  onSubmit,
}: {
  session: LearningSession;
  minutes: string;
  setMinutes: (value: string) => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">Complete Session</p>
            <h2 className="mt-2 text-2xl font-black">{session.title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Confirm the actual minutes studied before saving completion.</p>
          </div>
          <button type="button" onClick={onClose} className={secondaryButton}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Actual minutes</span>
          <input className={inputClass} type="number" min="0" max="600" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
        </label>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="button" onClick={() => void onSubmit()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

function RescheduleSessionModal({
  session,
  studyDate,
  setStudyDate,
  saving,
  onClose,
  onSubmit,
}: {
  session: LearningSession;
  studyDate: string;
  setStudyDate: (value: string) => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500">Reschedule</p>
            <h2 className="mt-2 text-2xl font-black">{session.title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose the new study date for this planned session.</p>
          </div>
          <button type="button" onClick={onClose} className={secondaryButton}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">New study date</span>
          <input className={inputClass} type="date" value={studyDate} onChange={(event) => setStudyDate(event.target.value)} />
        </label>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="button" onClick={() => void onSubmit()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteSessionModal({
  session,
  deleting,
  onClose,
  onConfirm,
}: {
  session: LearningSession;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-5 shadow-2xl dark:border-rose-500/25 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500">Delete Session</p>
            <h2 className="mt-2 text-2xl font-black">{session.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This will permanently remove the learning session from your queue. This action cannot be undone.
            </p>
          </div>
          <button type="button" onClick={onClose} className={secondaryButton} aria-label="Close delete confirmation">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-cyan-300/10 dark:bg-[#07101e]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Session</p>
          <p className="mt-1 font-black text-slate-900 dark:text-white">{session.subject} · {formatMinutes(session.plannedMinutes)} min</p>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={deleting} className={secondaryButton}>Keep session</button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-black text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionDetailsModal({
  session,
  onClose,
  onEdit,
}: {
  session: LearningSession;
  onClose: () => void;
  onEdit: (session: LearningSession) => void;
}) {
  const rows = [
    ["Title", session.title],
    ["Subject", session.subject],
    ["Goal", session.goal ?? "No goal added"],
    ["Learning type", session.learningType ?? "Reading"],
    ["Difficulty", session.difficulty ?? "Medium"],
    ["Priority", session.priority ?? "Medium"],
    ["Status", session.status],
    ["Created date", formatDate(session.createdAt)],
    ["Study date", formatDate(session.date)],
    ["Completed date", formatDate(session.completedAt)],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Session Details</p>
            <h2 className="mt-2 text-2xl font-black">{session.title}</h2>
          </div>
          <button type="button" onClick={onClose} className={secondaryButton}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tags</p>
          <p className="mt-1 text-sm font-bold">{session.tags?.length ? session.tags.join(", ") : "No tags"}</p>
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-700 dark:text-slate-200">{session.notes || "No notes added."}</p>
        </div>
        <LearningNotesPanel sessionId={session._id} />
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => onEdit(session)} className={secondaryButton}>
            <PencilLine className="h-4 w-4" />
            Edit session
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-black text-slate-950">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LearningNotesPanel({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const notesQuery = useQuery({
    queryKey: learningQueryKeys.notes(sessionId),
    queryFn: () => getSessionNotes(sessionId),
  });
  const invalidateNotes = () =>
    queryClient.invalidateQueries({ queryKey: learningQueryKeys.notes(sessionId) });
  const createNoteMutation = useMutation({
    mutationFn: (content: string) => createSessionNote(sessionId, content),
    onSuccess: async () => {
      setNewNote("");
      await invalidateNotes();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create note"),
  });
  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      updateSessionNote(noteId, content),
    onSuccess: async () => {
      setEditingNoteId(null);
      setEditingContent("");
      await invalidateNotes();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update note"),
  });
  const deleteNoteMutation = useMutation({
    mutationFn: deleteSessionNote,
    onSuccess: invalidateNotes,
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete note"),
  });
  const notes: LearningNote[] = notesQuery.data ?? [];

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Session Notes</p>
        {notesQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
      </div>
      <div className="mt-3 space-y-2">
        {notes.length > 0 ? notes.map((note) => {
          const id = note._id ?? note.id ?? "";
          const editing = editingNoteId === id;
          return (
            <div key={id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              {editing ? (
                <textarea className={inputClass} rows={3} value={editingContent} onChange={(event) => setEditingContent(event.target.value)} />
              ) : (
                <p className="whitespace-pre-wrap text-sm font-medium text-slate-700 dark:text-slate-200">{note.content}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {editing ? (
                  <button type="button" onClick={() => void updateNoteMutation.mutateAsync({ noteId: id, content: editingContent })} className={secondaryButton}>
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                ) : (
                  <button type="button" onClick={() => { setEditingNoteId(id); setEditingContent(note.content); }} className={secondaryButton}>
                    <PencilLine className="h-4 w-4" />
                    Edit
                  </button>
                )}
                <button type="button" onClick={() => void deleteNoteMutation.mutateAsync(id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        }) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No detailed notes yet. Add one for links, mistakes, or teacher feedback.</p>
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <textarea className={inputClass} rows={2} value={newNote} onChange={(event) => setNewNote(event.target.value)} placeholder="Add a new session note..." />
        <button
          type="button"
          onClick={() => newNote.trim() && void createNoteMutation.mutateAsync(newNote.trim())}
          disabled={!newNote.trim() || createNoteMutation.isPending}
          className={secondaryButton}
        >
          {createNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add note
        </button>
      </div>
    </div>
  );
}
