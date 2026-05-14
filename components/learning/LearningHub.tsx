"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/20 sm:p-6";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800";

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
  const [activeTimer, setActiveTimer] = useState<LearningSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [alarmRinging, setAlarmRinging] = useState(false);

  const [learnerMode, setLearnerMode] = useState<LearnerMode>("student");
  const [form, setForm] = useState<SessionFormState>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [enableAlarm, setEnableAlarm] = useState(true);
  const [alarmSound, setAlarmSound] = useState("Classic beep");
  const [autoStartBreak, setAutoStartBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState("5");
  const [dailyGoalDraft, setDailyGoalDraft] = useState<string | null>(null);
  const [weeklyGoalDraft, setWeeklyGoalDraft] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null);
  const [detailsSession, setDetailsSession] = useState<LearningSession | null>(null);
  const [completeTarget, setCompleteTarget] = useState<LearningSession | null>(null);
  const [completeMinutes, setCompleteMinutes] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<LearningSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(getToday());
  const [parentControlsDraft, setParentControlsDraft] = useState<ParentControlsState | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

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

  const sessions = sessionsQuery.data?.data ?? [];
  const pagination = sessionsQuery.data?.pagination ?? {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    total: sessions.length,
    totalPages: 1,
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
  const error =
    sessionsQuery.error instanceof Error ? sessionsQuery.error.message : null;
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

  const invalidateLearning = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["learningSessions"] }),
      queryClient.invalidateQueries({ queryKey: learningQueryKeys.stats }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createLearningSession,
    onSuccess: async () => {
      toast.success("Learning session created");
      await invalidateLearning();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create session"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateLearningSession>[1] }) =>
      updateLearningSession(id, payload),
    onSuccess: async () => {
      toast.success("Learning session updated");
      await invalidateLearning();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update session"),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLearningSession,
    onSuccess: async () => {
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
      if (session.status === "active") {
        setActiveTimer(session);
        setRemainingSeconds(Math.max(0, session.plannedMinutes - session.actualMinutes) * 60);
      }
      if (session.status !== "active") setActiveTimer(null);
      await invalidateLearning();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Session action failed"),
  });
  const lifecycleMutationRef = useRef(lifecycleMutation);
  useEffect(() => {
    lifecycleMutationRef.current = lifecycleMutation;
  }, [lifecycleMutation]);
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
    totalSessions: pagination.total,
    activeSession: sessions.find((session) => session.status === "active") ?? null,
    topSubjects: stats.subjectBreakdown.map((item) => ({
      _id: item._id ?? item.label ?? item.key ?? "Unknown",
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
    setSelectedSession(session);
    await lifecycleMutation.mutateAsync({ action: session.status === "paused" ? "resume" : "start", session });
  };

  const pauseSessionTimer = async () => {
    if (!activeTimer) return;
    await lifecycleMutation.mutateAsync({ action: "pause", session: activeTimer });
  };

  const completeSessionManually = async () => {
    if (!activeTimer) return;
    await lifecycleMutation.mutateAsync({
      action: "complete",
      session: activeTimer,
      actualMinutes: activeTimer.plannedMinutes,
    });
    setAlarmRinging(false);
  };

  const resetSessionTimer = () => {
    if (!activeTimer) return;
    setRemainingSeconds(activeTimer.plannedMinutes * 60);
  };

  const stopAlarm = () => setAlarmRinging(false);

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

  useEffect(() => {
    if (!activeTimer) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setAlarmRinging(enableAlarm);
          void lifecycleMutationRef.current.mutateAsync({
            action: "complete",
            session: activeTimer,
            actualMinutes: activeTimer.plannedMinutes,
          });
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeTimer, enableAlarm]);

  const selectedMode = learnerModes.find((mode) => mode.value === learnerMode) ?? learnerModes[0];
  const chartData = useMemo(
    () =>
      summary.topSubjects.map((subject) => ({
        name: subject._id,
        totalMinutes: subject.totalMinutes,
      })),
    [summary.topSubjects],
  );
  const goalProgress = Math.min(100, Math.round((summary.todayMinutes / Math.max(1, Number(dailyGoal))) * 100));
  const nextSessionMessage =
    summary.todayMinutes >= Number(dailyGoal)
      ? "Daily goal complete. A light review session is enough now."
      : `You studied ${formatMinutes(summary.todayMinutes)} of ${formatMinutes(Number(dailyGoal) || 0)} minutes today. Try a ${learnerMode === "child" ? "10" : "25"} minute session next.`;
  const starterSession = selectedSession ?? sessions.find((session) => session.status !== "completed") ?? null;

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
    const confirmed = window.confirm(`Delete learning session "${session.title}"?`);
    if (!confirmed) return;
    const ok = await deleteSession(session._id);
    if (ok) {
      if (editingSessionId === session._id) resetForm();
      if (selectedSession?._id === session._id) setSelectedSession(null);
      if (detailsSession?._id === session._id) setDetailsSession(null);
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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#08111f] dark:text-white">
      <div className="relative z-10 space-y-5 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-700/80 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-950 md:p-8">
          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-300">
                <Brain className="h-3.5 w-3.5" />
                Learning Lab
              </div>
              <h1 className="mt-5 text-[clamp(2.2rem,5vw,4.4rem)] font-black leading-[1] text-slate-950 dark:text-white">
                Plan smarter sessions for every kind of learner.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Choose a learner mode, build practical study blocks, run the timer, and review progress without leaving the page.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Today", value: `${formatMinutes(summary.todayMinutes)}m` },
                { label: "Streak", value: `${summary.currentStreak} days` },
                { label: "Active", value: activeTimer ? activeTimer.subject : "No timer" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-950/60">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
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

        <section className={panelClass}>
          <div className="grid gap-5 lg:grid-cols-[0.75fr_1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">Learning Goals</p>
              <h2 className="mt-2 text-2xl font-black">Progress for today</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{nextSessionMessage}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.4fr]">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Daily goal minutes</span>
                <input className={inputClass} type="number" min="1" value={dailyGoal} onChange={(e) => setDailyGoalDraft(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Weekly goal minutes</span>
                <input className={inputClass} type="number" min="1" value={weeklyGoal} onChange={(e) => setWeeklyGoalDraft(e.target.value)} />
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Current progress</span>
                  <span>{goalProgress}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500" style={{ width: `${goalProgress}%` }} />
                </div>
                <button type="button" onClick={() => void saveGoals()} disabled={goalsMutation.isPending} className={`${secondaryButton} mt-4 w-full`}>
                  {goalsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save goals
                </button>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
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
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Session template</span>
                <select className={inputClass} value={selectedTemplate} onChange={(e) => applyTemplate(e.target.value)}>
                  <option value="">Start blank or choose a template</option>
                  {templates.map((template) => (
                    <option key={template.name} value={template.name}>{template.name}</option>
                  ))}
                </select>
              </label>

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

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Planned minutes" error={errors.plannedMinutes}>
                  <input className={inputClass} type="number" min="1" value={form.plannedMinutes} onChange={(e) => patchForm({ plannedMinutes: e.target.value })} />
                </Field>
                <Field label="Study date" error={errors.date}>
                  <input className={inputClass} type="date" value={form.date} onChange={(e) => patchForm({ date: e.target.value })} />
                </Field>
              </div>

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

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                <p className="mb-3 text-sm font-black">Editable timer presets</p>
                <div className="flex flex-wrap gap-2">
                  {timerPresets.map((preset) => {
                    const isDefault = defaultTimerPresets.some((item) => item.minutes === preset.minutes);
                    return (
                      <span key={preset.minutes} className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                        <button type="button" onClick={() => patchForm({ plannedMinutes: String(preset.minutes) })} className="px-3 py-2 text-sm font-bold">
                          {preset.minutes} min
                        </button>
                        {!isDefault ? (
                          <button type="button" onClick={() => void handleRemovePreset(preset)} className="border-l border-slate-200 px-2 text-slate-400 hover:text-rose-500 dark:border-slate-700">
                            <X className="h-3.5 w-3.5" />
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
                {alarmRinging ? "Alarm ringing" : activeTimer ? "Timer running" : "Ready"}
              </div>

              <div className="flex items-center justify-center">
                <div className="flex h-56 w-56 items-center justify-center rounded-full border-[16px] border-cyan-500/70 bg-white text-center text-5xl font-black text-slate-950 shadow-[inset_0_20px_60px_rgba(15,23,42,0.08)] dark:bg-slate-900 dark:text-white">
                  {activeTimer ? formatCountdown(remainingSeconds) : "00:00"}
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
                  {alarmRinging ? "Time is up. Stop the alarm when you are done." : enableAlarm ? `${alarmSound} alarm enabled` : "Alarm disabled"}
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => starterSession && void startSessionTimer(starterSession)} disabled={Boolean(activeTimer) || !starterSession} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-400 dark:text-slate-950">
                  <Play className="h-4 w-4" />
                  Start
                </button>
                <button type="button" onClick={() => void pauseSessionTimer()} disabled={!activeTimer} className={secondaryButton}>
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
                <button type="button" onClick={() => starterSession && void startSessionTimer(starterSession)} disabled={Boolean(activeTimer) || starterSession?.status !== "paused"} className={secondaryButton}>
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
                <select className={inputClass} value={alarmSound} onChange={(e) => setAlarmSound(e.target.value)}>
                  <option>Classic beep</option>
                  <option>Soft bell</option>
                  <option>Digital chime</option>
                </select>
                <input className={inputClass} type="number" min="1" value={breakDuration} onChange={(e) => setBreakDuration(e.target.value)} placeholder="Break duration" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
          <div className={panelClass}>
            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 dark:text-orange-300">Learning Queue</p>
                <h2 className="mt-2 text-2xl font-black">Plan, start, edit, reschedule, complete</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Click a row to open session details.</p>
              </div>
              <form onSubmit={handleApplyFilters} className="grid gap-2 sm:grid-cols-[150px_1fr_auto]">
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

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="hidden grid-cols-[1.15fr_0.8fr_1fr_0.65fr_0.7fr_0.65fr_1.25fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500 xl:grid dark:bg-slate-950/70">
                <span>Session</span>
                <span>Subject</span>
                <span>Goal</span>
                <span>Plan</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Actions</span>
              </div>
              {sessionsLoading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-50 dark:bg-slate-800" />)}
                </div>
              ) : sessions.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {sessions.map((session) => (
                    <button key={session._id} type="button" onClick={() => { setDetailsSession(session); setSelectedSession(session); }} className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-950/45 xl:grid-cols-[1.15fr_0.8fr_1fr_0.65fr_0.7fr_0.65fr_1.25fr] xl:items-center">
                      <QueueCell label="Session"><p className="font-black">{session.title}</p><p className="text-xs text-slate-500">{formatDate(session.date)}</p></QueueCell>
                      <QueueCell label="Subject"><p className="font-bold">{session.subject}</p></QueueCell>
                      <QueueCell label="Goal"><p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{session.goal ?? "No goal added"}</p></QueueCell>
                      <QueueCell label="Plan"><p className="font-semibold">{formatMinutes(session.actualMinutes || 0)}/{formatMinutes(session.plannedMinutes)}m</p></QueueCell>
                      <QueueCell label="Status"><span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold capitalize ${statusTone(session.status)}`}>{session.status}</span></QueueCell>
                      <QueueCell label="Priority"><p className={`font-black ${priorityTone(session.priority)}`}>{session.priority ?? "Medium"}</p><p className="text-xs text-slate-500">{session.learningType ?? "Reading"}</p></QueueCell>
                      <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                        {session.status === "active" ? (
                          <button type="button" onClick={() => void lifecycleMutation.mutateAsync({ action: "pause", session })} className={secondaryButton}><Pause className="h-4 w-4" />Pause</button>
                        ) : null}
                        {session.status === "paused" ? (
                          <button type="button" onClick={() => { setSelectedSession(session); void startSessionTimer(session); }} disabled={Boolean(activeTimer)} className={secondaryButton}><Play className="h-4 w-4" />Resume</button>
                        ) : null}
                        {session.status !== "completed" && session.status !== "cancelled" && session.status !== "active" && session.status !== "paused" ? (
                          <button type="button" onClick={() => { setSelectedSession(session); void startSessionTimer(session); }} disabled={Boolean(activeTimer)} className={secondaryButton}><Play className="h-4 w-4" />Start</button>
                        ) : null}
                        <button type="button" onClick={() => handleEdit(session)} className={secondaryButton}><PencilLine className="h-4 w-4" />Edit</button>
                        <button type="button" onClick={() => void handleCompleteSession(session)} disabled={session.status === "completed"} className={secondaryButton}><CheckCircle2 className="h-4 w-4" />Complete</button>
                        <button type="button" onClick={() => openRescheduleModal(session)} disabled={session.status === "completed" || session.status === "cancelled"} className={secondaryButton}><CalendarClock className="h-4 w-4" />Reschedule</button>
                        <button type="button" onClick={() => void lifecycleMutation.mutateAsync({ action: "cancel", session })} disabled={session.status === "completed" || session.status === "cancelled"} className={secondaryButton}><X className="h-4 w-4" />Cancel</button>
                        <button type="button" onClick={() => void handleDelete(session)} disabled={deletingSessionId === session._id} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{deletingSessionId === session._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete</button>
                      </div>
                    </button>
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
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.totalPages} | {pagination.total} total sessions</p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button type="button" onClick={() => void goToPage(Math.max(1, pagination.page - 1))} disabled={pagination.page <= 1 || sessionsLoading} className={secondaryButton}>Previous</button>
                <button type="button" onClick={() => void goToPage(Math.min(pagination.totalPages, pagination.page + 1))} disabled={pagination.page >= pagination.totalPages || sessionsLoading} className={secondaryButton}>Next</button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
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

function QueueCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 xl:hidden">{label}</p>
      {children}
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
