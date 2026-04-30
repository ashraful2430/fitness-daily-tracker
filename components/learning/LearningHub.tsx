"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlarmClock,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Pause,
  PencilLine,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
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
import { useLearningDashboard } from "@/hooks/useLearningDashboard";
import type { LearningSession, LearningSessionStatus } from "@/types/learning";

type FormErrors = Record<string, string>;

type SessionFormState = {
  title: string;
  subject: string;
  plannedMinutes: string;
  notes: string;
  date: string;
};

const presetDurations = [25, 45, 60, 90];
const subjectChartColors = ["#14b8a6", "#8b5cf6", "#f97316", "#06b6d4", "#ec4899"];

function toLocalDateInputValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getToday() {
  return toLocalDateInputValue(new Date());
}

function formatMinutes(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
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
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function emptyForm(defaultSubject = ""): SessionFormState {
  return {
    title: "",
    subject: defaultSubject,
    plannedMinutes: "60",
    notes: "",
    date: getToday(),
  };
}

function sessionToForm(session: LearningSession): SessionFormState {
  return {
    title: session.title,
    subject: session.subject,
    plannedMinutes: String(session.plannedMinutes),
    notes: session.notes ?? "",
    date: session.date.slice(0, 10),
  };
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
      return "bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-slate-300";
  }
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
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#120d27] dark:shadow-black/30"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-3xl`}
      />
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-900/10`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </motion.div>
  );
}

export default function LearningHub() {
  const {
    summary,
    sessions,
    pagination,
    filters,
    loading,
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
    stopAlarm,
    updateFilterField,
    applyFilters,
    goToPage,
  } = useLearningDashboard();

  const [form, setForm] = useState<SessionFormState>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const chartData = useMemo(
    () =>
      summary.topSubjects.map((subject) => ({
        name: subject._id,
        totalMinutes: subject.totalMinutes,
      })),
    [summary.topSubjects],
  );

  const resetForm = () => {
    setEditingSessionId(null);
    setErrors({});
    setForm(emptyForm(subjectOptions[0] ?? ""));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      title: form.title,
      subject: form.subject,
      plannedMinutes: Number(form.plannedMinutes),
      notes: form.notes,
      date: form.date,
    };

    const result = editingSessionId
      ? await updateSession(editingSessionId, payload)
      : await createSession(payload);

    setErrors(result.errors);

    if (result.ok) {
      resetForm();
    }
  };

  const handleEdit = (session: LearningSession) => {
    setEditingSessionId(session._id);
    setErrors({});
    setForm(sessionToForm(session));
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleDelete = async (session: LearningSession) => {
    const confirmed = window.confirm(
      `Delete learning session "${session.title}"?`,
    );

    if (!confirmed) return;

    const ok = await deleteSession(session._id);

    if (ok && editingSessionId === session._id) {
      resetForm();
    }
  };

  const handleApplyFilters = async (
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();
    await applyFilters({ page: 1 }, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-[#09090f] sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-5">
          <div className="h-56 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]" />
          <div className="grid gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#09090f] dark:text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[10%] top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[8%] h-[360px] w-[360px] rounded-full bg-violet-600/10 blur-[110px]" />
      </div>

      <div className="relative z-10 space-y-5 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <section className="relative overflow-hidden rounded-[2.3rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-white/[0.08] dark:bg-[#110d2e] dark:shadow-black/30 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="absolute -right-14 top-10 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-cyan-300">
                <Brain className="h-3.5 w-3.5" />
                Learning Lab
              </div>

              <h1 className="mt-5 text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-slate-950 dark:text-white">
                Plan your study,
                <span className="block bg-gradient-to-r from-cyan-500 via-teal-500 to-violet-500 bg-clip-text text-transparent">
                  run the timer, and finish with intent.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300/85">
                Create study sessions, track real learning time, and let the
                built-in alarm pull you out of deep work when your block ends.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Today", value: `${formatMinutes(summary.todayMinutes)}m` },
                { label: "Streak", value: `${summary.currentStreak} days` },
                {
                  label: "Active",
                  value: activeTimer ? activeTimer.subject : "No timer",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.45rem] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Today Minutes"
            value={`${formatMinutes(summary.todayMinutes)}m`}
            subtitle="Learning time logged today."
            icon={Clock3}
            gradient="from-cyan-500 to-sky-400"
          />
          <StatCard
            title="Week Minutes"
            value={`${formatMinutes(summary.weekMinutes)}m`}
            subtitle="Your rolling weekly study load."
            icon={CalendarDays}
            gradient="from-violet-600 to-fuchsia-500"
          />
          <StatCard
            title="Completion Rate"
            value={`${summary.completionRate}%`}
            subtitle="Completed sessions versus total."
            icon={CheckCircle2}
            gradient="from-emerald-500 to-lime-400"
          />
          <StatCard
            title="Current Streak"
            value={`${summary.currentStreak}`}
            subtitle="Consecutive learning days."
            icon={Trophy}
            gradient="from-orange-500 to-amber-400"
          />
        </section>

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
          <div
            ref={formRef}
            className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
                  Session Builder
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {editingSessionId ? "Edit learning session" : "Create a learning session"}
                </h2>
              </div>

              {editingSessionId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Session title
                  </label>
                  <input
                    value={form.title}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, title: event.target.value }));
                      if (errors.title) setErrors({});
                    }}
                    placeholder="DSA revision"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {errors.title ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {errors.title}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Subject
                  </label>
                  <input
                    value={form.subject}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, subject: event.target.value }));
                      if (errors.subject) setErrors({});
                    }}
                    placeholder="Algorithms"
                    list="learning-subjects"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  <datalist id="learning-subjects">
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject} />
                    ))}
                  </datalist>
                  {errors.subject ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {errors.subject}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Planned minutes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.plannedMinutes}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        plannedMinutes: event.target.value,
                      }));
                      if (errors.plannedMinutes) setErrors({});
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {errors.plannedMinutes ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {errors.plannedMinutes}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Study date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, date: event.target.value }));
                      if (errors.date) setErrors({});
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {errors.date ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {errors.date}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  Quick presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {presetDurations.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          plannedMinutes: String(duration),
                        }))
                      }
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-200"
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Chapters, goals, or practice focus for this session..."
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                />
              </div>

              <button
                type="submit"
                disabled={sessionSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sessionSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingSessionId ? (
                  <PencilLine className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingSessionId ? "Update session" : "Create session"}
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                  Live Timer
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Study clock and alarm
                </h2>
              </div>

              <button
                onClick={() => void refreshAll(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/[0.10] dark:hover:text-white"
                aria-label="Refresh learning data"
              >
                <RefreshCcw className={`h-4.5 w-4.5 ${summaryLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex min-h-[390px] flex-col justify-between rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.04]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
                  <AlarmClock className="h-3.5 w-3.5" />
                  {alarmRinging ? "Alarm ringing" : activeTimer ? "Timer running" : "Ready to focus"}
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex h-64 w-64 items-center justify-center rounded-full border-[18px] border-cyan-500/70 bg-white text-center text-5xl font-black tracking-[-0.04em] text-slate-950 shadow-[inset_0_20px_60px_rgba(15,23,42,0.08)] dark:bg-[#171329] dark:text-white dark:shadow-[inset_0_20px_60px_rgba(0,0,0,0.35)]">
                    {activeTimer ? formatCountdown(remainingSeconds) : "00:00"}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    {activeTimer ? activeTimer.subject : summary.activeSession?.subject ?? "No active subject"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    {activeTimer ? activeTimer.title : summary.activeSession?.title ?? "Choose a session from below"}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {alarmRinging
                      ? "Time is up. Stop the alarm when you're done."
                      : activeTimer
                        ? `Planned ${activeTimer.plannedMinutes} minutes`
                        : "Create a session, then press Start from the list to begin."}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void pauseSessionTimer()}
                  disabled={!activeTimer}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                >
                  <Pause className="h-4 w-4" />
                  Pause timer
                </button>

                <button
                  type="button"
                  onClick={() => void completeSessionManually()}
                  disabled={!activeTimer}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete now
                </button>

                <button
                  type="button"
                  onClick={stopAlarm}
                  disabled={!alarmRinging}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  Stop alarm
                </button>

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 dark:border-white/[0.08] dark:bg-[#171329] dark:text-slate-300">
                  Alarm keeps sounding until you stop it.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
            <div className="mb-6 space-y-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                    Session Queue
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    Launch, pause, complete, and clean up study blocks
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                    Manage current and past learning sessions without leaving the page.
                  </p>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[320px]">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Visible
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      {sessions.length}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      {pagination.total}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Completed
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      {summary.completedSessions}
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleApplyFilters}
                className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]"
              >
                <div className="grid gap-3 xl:grid-cols-[180px_minmax(0,1fr)_auto]">
                  <label className="space-y-2">
                    <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Status
                    </span>
                    <select
                      value={filters.status}
                      onChange={(event) =>
                        updateFilterField("status", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-500 dark:border-white/[0.08] dark:bg-[#171329] dark:text-white"
                    >
                      <option value="">All statuses</option>
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Subject
                    </span>
                    <input
                      value={filters.subject}
                      list="learning-filter-subjects"
                      onChange={(event) =>
                        updateFilterField("subject", event.target.value)
                      }
                      placeholder="Filter by subject"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-500 dark:border-white/[0.08] dark:bg-[#171329] dark:text-white"
                    />
                    <datalist id="learning-filter-subjects">
                      {subjectOptions.map((subject) => (
                        <option key={subject} value={subject} />
                      ))}
                    </datalist>
                  </label>

                  <div className="flex items-end xl:pt-[1.9rem]">
                    <button
                      type="submit"
                      disabled={sessionsLoading}
                      className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 lg:w-auto lg:min-w-[120px]"
                    >
                      {sessionsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Apply
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-white/[0.08]">
              <div className="hidden grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 lg:grid dark:bg-white/[0.04]">
                <span>Session</span>
                <span>Subject</span>
                <span>Plan</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {sessionsLoading ? (
                <div className="space-y-3 px-5 py-5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-2xl bg-slate-50 dark:bg-white/[0.04]"
                    />
                  ))}
                </div>
              ) : sessions.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-white/[0.08]">
                  {sessions.map((session) => (
                    <div
                      key={session._id}
                      className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1fr] lg:items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Session
                        </p>
                        <p className="font-black text-slate-950 dark:text-white">
                          {session.title}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {formatDate(session.date)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Subject
                        </p>
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          {session.subject}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Plan
                        </p>
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          {session.actualMinutes > 0
                            ? `${formatMinutes(session.actualMinutes)}/${formatMinutes(
                                session.plannedMinutes,
                              )}m`
                            : `${formatMinutes(session.plannedMinutes)}m`}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Status
                        </p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold capitalize ${statusTone(session.status)}`}
                        >
                          {session.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                        {session.status !== "completed" ? (
                          <button
                            type="button"
                            onClick={() => void startSessionTimer(session)}
                            disabled={
                              (activeTimer !== null &&
                                activeTimer.sessionId !== session._id) ||
                              session.status === "active"
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                          >
                            <Play className="h-4 w-4" />
                            {session.status === "paused" ? "Resume" : "Start"}
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleEdit(session)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                        >
                          <PencilLine className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(session)}
                          disabled={deletingSessionId === session._id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                        >
                          {deletingSessionId === session._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                    No learning sessions yet
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Create your first study block and start the timer when you are ready.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages} | {pagination.total} total sessions
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={() => void goToPage(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1 || sessionsLoading}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void goToPage(Math.min(pagination.totalPages, pagination.page + 1))
                  }
                  disabled={
                    pagination.page >= pagination.totalPages || sessionsLoading
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                Subject Mix
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Where your learning time goes
              </h2>

              <div className="mt-6 h-72 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid rgba(148,163,184,0.16)",
                          background: "#0f172a",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="totalMinutes" radius={[12, 12, 4, 4]}>
                        {chartData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={subjectChartColors[index % subjectChartColors.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-slate-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      Subject insights appear as you log learning sessions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
                Recent Learning
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Latest completed and active work
              </h2>

              <div className="mt-5 space-y-3">
                {summary.recentSessions.length > 0 ? (
                  summary.recentSessions.slice(0, 5).map((session) => (
                    <div
                      key={session._id}
                      className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-base font-black text-slate-950 dark:text-white">
                            {session.title}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {session.subject} | {formatMinutes(session.actualMinutes || session.plannedMinutes)}m
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold capitalize ${statusTone(session.status)}`}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                    No recent learning sessions yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
