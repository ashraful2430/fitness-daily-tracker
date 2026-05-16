"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Dumbbell,
  Flame,
  Footprints,
  Info,
  Loader2,
  Moon,
  PencilLine,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BodyPart,
  FitnessGoals,
  FitnessRecovery,
  FitnessRecoveryInput,
  FitnessTemplate,
  FitnessWorkout,
  FitnessWorkoutInput,
  GoalType,
  MoodAfter,
  WorkoutIntensity,
  WorkoutStatus,
  WorkoutType,
  defaultFitnessGoals,
  defaultRecoveryPayload,
  defaultWorkoutPayload,
  fitnessAPI,
  fitnessId,
  fitnessQueryKeys,
} from "@/lib/fitnessApi";

type Tab = "workouts" | "templates" | "goals" | "recovery" | "records";
type SelectOption<T extends string> = { value: T; label: string };
type WorkoutFilters = {
  search: string;
  status: string;
  workoutType: string;
  intensity: string;
  bodyPart: string;
  fromDate: string;
  toDate: string;
};

const workoutTypes: SelectOption<WorkoutType>[] = [
  { value: "cardio", label: "Cardio" },
  { value: "strength", label: "Strength" },
  { value: "hiit", label: "HIIT" },
  { value: "yoga", label: "Yoga" },
  { value: "walking", label: "Walking" },
  { value: "running", label: "Running" },
  { value: "cycling", label: "Cycling" },
  { value: "sports", label: "Sports" },
  { value: "stretching", label: "Stretching" },
  { value: "general", label: "General" },
];
const goalTypes: SelectOption<GoalType>[] = [
  { value: "weight_loss", label: "Weight loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "general_fitness", label: "General fitness" },
  { value: "strength_training", label: "Strength training" },
  { value: "cardio_health", label: "Cardio health" },
  { value: "flexibility", label: "Flexibility" },
  { value: "daily_movement", label: "Daily movement" },
  { value: "recovery", label: "Recovery" },
];
const intensities: SelectOption<WorkoutIntensity>[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "extreme", label: "Extreme" },
];
const bodyParts: SelectOption<BodyPart>[] = [
  { value: "full_body", label: "Full body" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "mobility", label: "Mobility" },
];
const moods: SelectOption<MoodAfter>[] = [
  { value: "great", label: "Great" },
  { value: "good", label: "Good" },
  { value: "tired", label: "Tired" },
  { value: "low_energy", label: "Low energy" },
  { value: "sore", label: "Sore" },
];
const statuses: SelectOption<WorkoutStatus>[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "skipped", label: "Skipped" },
  { value: "cancelled", label: "Cancelled" },
];

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 dark:border-white/[0.08] dark:bg-[#07101e] dark:text-white";
const softButton =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-200/10 dark:bg-[#07101e] dark:text-slate-200";
const primaryButton =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50";
const dangerButton =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function titleCase(value?: string) {
  return (value ?? "-").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function asList<T>(value: T[] | { data?: T[]; meta?: unknown } | undefined) {
  if (Array.isArray(value)) return value;
  return value?.data ?? [];
}

function asMeta(value: unknown) {
  if (value && typeof value === "object" && "meta" in value) {
    return (value as { meta?: { page?: number; totalPages?: number; total?: number } }).meta;
  }
  return undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numericValue(...values: unknown[]) {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function textValue(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim());
  return typeof value === "string" ? value : "";
}

function normalizeDateValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString().slice(0, 10);
}

function isDefaultTemplate(template: FitnessTemplate) {
  return Boolean(template.isDefault ?? template.default);
}

function sortTemplates(templates: FitnessTemplate[]) {
  return [...templates].sort((left, right) => {
    const leftDefault = isDefaultTemplate(left);
    const rightDefault = isDefaultTemplate(right);

    if (leftDefault !== rightDefault) return leftDefault ? 1 : -1;
    if (leftDefault) return (left.title ?? "").localeCompare(right.title ?? "");

    const leftTime = new Date(left.createdAt ?? left.updatedAt ?? 0).getTime();
    const rightTime = new Date(right.createdAt ?? right.updatedAt ?? 0).getTime();
    return rightTime - leftTime;
  });
}

function workoutDefaultsFrom(input: Partial<FitnessWorkoutInput>) {
  const item = input as Partial<FitnessWorkoutInput> & Record<string, unknown>;

  return {
    ...defaultWorkoutPayload,
    ...item,
    title: textValue(item.title, item.name) || defaultWorkoutPayload.title,
    workoutDate: normalizeDateValue(textValue(item.workoutDate, item.date, item.templateDate) || today()),
    workoutType: (item.workoutType ?? item.type ?? defaultWorkoutPayload.workoutType) as WorkoutType,
    goalType: (item.goalType ?? item.goal ?? defaultWorkoutPayload.goalType) as GoalType,
    durationMinutes: numericValue(item.durationMinutes, item.duration, item.minutes),
    calories: numericValue(item.calories, item.caloriesEstimate, item.caloriesBurned),
    intensity: (item.intensity ?? defaultWorkoutPayload.intensity) as WorkoutIntensity,
    bodyPart: (item.bodyPart ?? item.bodyFocus ?? item.muscleGroup ?? defaultWorkoutPayload.bodyPart) as BodyPart,
    sets: numericValue(item.sets),
    reps: numericValue(item.reps),
    weight: numericValue(item.weight),
    distance: numericValue(item.distance),
    steps: numericValue(item.steps),
    moodAfter: (item.moodAfter ?? defaultWorkoutPayload.moodAfter) as MoodAfter,
    notes: textValue(item.notes, item.description),
    status: (item.status ?? defaultWorkoutPayload.status) as WorkoutStatus,
  };
}

function chartRows(data: unknown, nameKey = "name") {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => {
    const record = item as Record<string, unknown>;
    return {
      name: titleCase(String(record[nameKey] ?? record.label ?? record.type ?? record.bodyPart ?? record.intensity ?? `Item ${index + 1}`)),
      value: numberValue(record.value ?? record.count ?? record.total ?? record.minutes),
    };
  });
}

function normalizeWorkout(input: FitnessWorkoutInput): FitnessWorkoutInput {
  return {
    ...input,
    title: input.title.trim(),
    workoutDate: normalizeDateValue(input.workoutDate),
    notes: input.notes.trim(),
    durationMinutes: Number(input.durationMinutes || 0),
    calories: Number(input.calories || 0),
    sets: Number(input.sets || 0),
    reps: Number(input.reps || 0),
    weight: Number(input.weight || 0),
    distance: Number(input.distance || 0),
    steps: Number(input.steps || 0),
  };
}

function validateWorkoutInput(input: FitnessWorkoutInput) {
  if (!input.title.trim()) return "Workout title is required.";
  if (!input.workoutDate) return "Workout date is required.";
  if (!Number.isFinite(Number(input.durationMinutes)) || Number(input.durationMinutes) < 1) {
    return "Workout minutes must be at least 1.";
  }
  if (Number(input.calories) < 0) return "Calories cannot be negative.";
  return "";
}

export default function FitnessTracker() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("workouts");
  const [workoutPage, setWorkoutPage] = useState(1);
  const [recoveryPage, setRecoveryPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    workoutType: "",
    intensity: "",
    bodyPart: "",
    fromDate: "",
    toDate: "",
  });
  const [workoutForm, setWorkoutForm] = useState<FitnessWorkoutInput>({
    ...defaultWorkoutPayload,
    workoutDate: today(),
  });
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<FitnessWorkoutInput>({
    ...defaultWorkoutPayload,
    title: "My workout template",
    workoutDate: today(),
  });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState<FitnessGoals | null>(null);
  const [recoveryForm, setRecoveryForm] = useState<FitnessRecoveryInput>({
    ...defaultRecoveryPayload,
    checkDate: today(),
  });
  const [editingRecoveryId, setEditingRecoveryId] = useState<string | null>(null);
  const [recoveryRecommendation, setRecoveryRecommendation] = useState("");

  const workoutQueryParams = { ...filters, page: workoutPage, limit: 8 };
  const recoveryQueryParams = { page: recoveryPage, limit: 6 };

  const statsQuery = useQuery({
    queryKey: fitnessQueryKeys.stats,
    queryFn: fitnessAPI.getStats,
  });
  const workoutsQuery = useQuery({
    queryKey: fitnessQueryKeys.workouts(workoutQueryParams),
    queryFn: () => fitnessAPI.getWorkouts(workoutQueryParams),
  });
  const goalsQuery = useQuery({
    queryKey: fitnessQueryKeys.goals,
    queryFn: fitnessAPI.getGoals,
  });
  const templatesQuery = useQuery({
    queryKey: fitnessQueryKeys.templates,
    queryFn: fitnessAPI.getTemplates,
  });
  const recoveryQuery = useQuery({
    queryKey: fitnessQueryKeys.recovery(recoveryQueryParams),
    queryFn: () => fitnessAPI.getRecovery(recoveryQueryParams),
  });
  const recordsQuery = useQuery({
    queryKey: fitnessQueryKeys.records,
    queryFn: fitnessAPI.getPersonalRecords,
  });

  const workouts = asList(workoutsQuery.data);
  const workoutMeta = asMeta(workoutsQuery.data);
  const templates = sortTemplates(templatesQuery.data ?? []);
  const recoveryItems = asList(recoveryQuery.data);
  const recoveryMeta = asMeta(recoveryQuery.data);
  const stats = statsQuery.data ?? {};
  const records = recordsQuery.data ?? [];

  const currentGoals = goalForm ?? { ...defaultFitnessGoals, ...goalsQuery.data };

  const invalidateFitness = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["fitness"] }),
    ]);
  };

  const workoutSaveMutation = useMutation({
    mutationFn: (payload: FitnessWorkoutInput) => {
      const normalized = normalizeWorkout(payload);
      return editingWorkoutId
        ? fitnessAPI.updateWorkout(editingWorkoutId, normalized)
        : fitnessAPI.createWorkout({ ...normalized, status: "planned" });
    },
    onSuccess: async () => {
      toast.success(editingWorkoutId ? "Workout updated" : "Workout created");
      setWorkoutForm({ ...defaultWorkoutPayload, workoutDate: today() });
      setEditingWorkoutId(null);
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Workout save failed"),
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: fitnessAPI.deleteWorkout,
    onSuccess: async () => {
      toast.success("Workout deleted");
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Workout delete failed"),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "start" | "complete" | "skip" | "cancel" }) =>
      fitnessAPI.workoutAction(id, action),
    onSuccess: async (_, vars) => {
      toast.success(`Workout ${vars.action}ed`);
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Workout action failed"),
  });

  const goalsMutation = useMutation({
    mutationFn: fitnessAPI.updateGoals,
    onSuccess: async () => {
      toast.success("Fitness goals updated");
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Goal update failed"),
  });

  const templateSaveMutation = useMutation({
    mutationFn: (payload: FitnessWorkoutInput) =>
      editingTemplateId
        ? fitnessAPI.updateTemplate(editingTemplateId, normalizeWorkout(payload))
        : fitnessAPI.createTemplate(normalizeWorkout(payload)),
    onSuccess: async () => {
      toast.success(editingTemplateId ? "Template updated" : "Template created");
      setTemplateForm({ ...defaultWorkoutPayload, title: "My workout template", workoutDate: today() });
      setEditingTemplateId(null);
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Template save failed"),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: fitnessAPI.deleteTemplate,
    onSuccess: async () => {
      toast.success("Template deleted");
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Template delete failed"),
  });

  const recoverySaveMutation = useMutation({
    mutationFn: (payload: FitnessRecoveryInput) => {
      const normalized = {
        ...payload,
        checkDate: normalizeDateValue(payload.checkDate),
        waterGlasses: Number(payload.waterGlasses || 0),
      };

      return editingRecoveryId
        ? fitnessAPI.updateRecovery(editingRecoveryId, normalized)
        : fitnessAPI.createRecovery(normalized);
    },
    onSuccess: async (result) => {
      const recommendation = result.recoveryRecommendation ?? result.recommendation ?? "";
      setRecoveryRecommendation(recommendation);
      toast.success(editingRecoveryId ? "Recovery check updated" : "Recovery check saved");
      setRecoveryForm({ ...defaultRecoveryPayload, checkDate: today() });
      setEditingRecoveryId(null);
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Recovery save failed"),
  });

  const deleteRecoveryMutation = useMutation({
    mutationFn: fitnessAPI.deleteRecovery,
    onSuccess: async () => {
      toast.success("Recovery check deleted");
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Recovery delete failed"),
  });

  const recalculateMutation = useMutation({
    mutationFn: fitnessAPI.recalculatePersonalRecords,
    onSuccess: async () => {
      toast.success("Personal records recalculated");
      await invalidateFitness();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Record recalculation failed"),
  });

  const statCards = [
    ["Today", stats.completedWorkoutsToday, "workouts", CheckCircle2],
    ["Week", stats.completedWorkoutsThisWeek, "workouts", Dumbbell],
    ["Calories", stats.caloriesThisWeek, "this week", Flame],
    ["Active", stats.activeMinutesThisWeek, "minutes", Activity],
    ["Streak", stats.currentStreak, "current", Sparkles],
    ["Steps", stats.stepsGoalProgress, "% goal", Footprints],
  ] as const;

  const chartData = chartRows(stats.dailyWorkoutBreakdown);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 dark:bg-[#050914] dark:text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#08101f]">
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500" />
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_24rem] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
                <Dumbbell size={14} />
                Fitness Command
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Train, recover, and make the stats tell the truth.
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
                Plan workouts, use templates, track recovery, and keep personal records tied to completed training only.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Best day" value={String(stats.bestWorkoutDay ?? "-")} />
              <MiniStat label="Top type" value={titleCase(String(stats.mostTrainedType ?? "-"))} />
              <MiniStat label="Avg min" value={String(stats.averageWorkoutDuration ?? 0)} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {statCards.map(([label, value, suffix, Icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#08101f]">
              <Icon className="h-5 w-5 text-cyan-500" />
              <p className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-black">{String(value ?? 0)}</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{suffix}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5">
          <section className="space-y-5">
            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 [scrollbar-width:none] dark:border-white/[0.08] dark:bg-[#08101f] [&::-webkit-scrollbar]:hidden">
              {[
                ["workouts", "Workouts", Dumbbell],
                ["templates", "Templates", ShieldCheck],
                ["goals", "Goals", Target],
                ["recovery", "Recovery", Moon],
                ["records", "Records", Trophy],
              ].map(([key, label, Icon]) => (
                <button
                  key={String(key)}
                  type="button"
                  onClick={() => setActiveTab(key as Tab)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                    activeTab === key
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {String(label)}
                </button>
              ))}
            </div>

            {activeTab === "workouts" ? (
              <WorkoutPanel
                filters={filters}
                setFilters={setFilters}
                workouts={workouts}
                loading={workoutsQuery.isLoading}
                page={workoutPage}
                setPage={setWorkoutPage}
                totalPages={workoutMeta?.totalPages ?? 1}
                onEdit={(workout) => {
                  setWorkoutForm(workoutDefaultsFrom(workout));
                  setEditingWorkoutId(fitnessId(workout));
                  setActiveTab("workouts");
                }}
                onDelete={(id) => {
                  if (window.confirm("Delete this workout? This cannot be undone.")) {
                    deleteWorkoutMutation.mutate(id);
                  }
                }}
                onAction={(id, action) => actionMutation.mutate({ id, action })}
              />
            ) : null}

            {activeTab === "templates" ? (
              <TemplatesPanel
                templates={templates}
                loading={templatesQuery.isLoading}
                onUse={(template) => {
                  setWorkoutForm({ ...workoutDefaultsFrom(template), workoutDate: today(), status: "planned" });
                  setEditingWorkoutId(null);
                  setActiveTab("workouts");
                  toast.success("Template loaded into workout form");
                }}
                onEdit={(template) => {
                  setTemplateForm({ ...workoutDefaultsFrom(template), workoutDate: today() });
                  setEditingTemplateId(fitnessId(template));
                }}
                onDelete={(id) => {
                  if (window.confirm("Delete this custom template? This cannot be undone.")) {
                    deleteTemplateMutation.mutate(id);
                  }
                }}
              />
            ) : null}

            {activeTab === "goals" ? (
              <GoalsPanel
                goals={currentGoals}
                setGoals={setGoalForm}
                stats={stats}
                saving={goalsMutation.isPending}
                onSave={() => goalsMutation.mutate(currentGoals)}
              />
            ) : null}

            {activeTab === "recovery" ? (
              <RecoveryPanel
                items={recoveryItems}
                loading={recoveryQuery.isLoading}
                page={recoveryPage}
                setPage={setRecoveryPage}
                totalPages={recoveryMeta?.totalPages ?? 1}
                recommendation={recoveryRecommendation}
                onEdit={(item) => {
                  setRecoveryForm({ ...defaultRecoveryPayload, ...item, checkDate: (item.checkDate ?? today()).slice(0, 10) });
                  setEditingRecoveryId(fitnessId(item));
                }}
                onDelete={(id) => {
                  if (window.confirm("Delete this recovery check? This cannot be undone.")) {
                    deleteRecoveryMutation.mutate(id);
                  }
                }}
              />
            ) : null}

            {activeTab === "records" ? (
              <RecordsPanel
                records={records}
                loading={recordsQuery.isLoading}
                recalculating={recalculateMutation.isPending}
                onRecalculate={() => recalculateMutation.mutate()}
              />
            ) : null}
          </section>

          <aside className="grid items-start gap-5 xl:grid-cols-3">
            <WorkoutForm
              value={workoutForm}
              setValue={setWorkoutForm}
              editing={Boolean(editingWorkoutId)}
              saving={workoutSaveMutation.isPending}
              onReset={() => {
                setWorkoutForm({ ...defaultWorkoutPayload, workoutDate: today() });
                setEditingWorkoutId(null);
              }}
              onSave={() => {
                const validationError = validateWorkoutInput(workoutForm);
                if (validationError) {
                  toast.error(validationError);
                  return;
                }
                workoutSaveMutation.mutate(workoutForm);
              }}
            />
            <TemplateForm
              value={templateForm}
              setValue={setTemplateForm}
              editing={Boolean(editingTemplateId)}
              saving={templateSaveMutation.isPending}
              onReset={() => {
                setTemplateForm({ ...defaultWorkoutPayload, title: "My workout template", workoutDate: today() });
                setEditingTemplateId(null);
              }}
              onSave={() => templateSaveMutation.mutate(templateForm)}
            />
            <RecoveryForm
              value={recoveryForm}
              setValue={setRecoveryForm}
              editing={Boolean(editingRecoveryId)}
              saving={recoverySaveMutation.isPending}
              onReset={() => {
                setRecoveryForm({ ...defaultRecoveryPayload, checkDate: today() });
                setEditingRecoveryId(null);
              }}
              onSave={() => recoverySaveMutation.mutate(recoveryForm)}
            />
          </aside>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#08101f]">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-black">Daily workout breakdown</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black">{value}</p>
    </div>
  );
}

function WorkoutFields({ value, setValue }: { value: FitnessWorkoutInput; setValue: (next: FitnessWorkoutInput) => void }) {
  const hasAdvancedValue =
    Number(value.sets) > 0 ||
    Number(value.reps) > 0 ||
    Number(value.weight) > 0 ||
    Number(value.distance) > 0 ||
    Number(value.steps) > 0 ||
    Boolean(value.notes.trim()) ||
    value.moodAfter !== defaultWorkoutPayload.moodAfter;
  const [showAdvanced, setShowAdvanced] = useState(hasAdvancedValue);

  const set = <K extends keyof FitnessWorkoutInput>(key: K, next: FitnessWorkoutInput[K]) =>
    setValue({ ...value, [key]: next });
  const numberSet = (key: keyof FitnessWorkoutInput, next: string) =>
    setValue({ ...value, [key]: Number(next) } as FitnessWorkoutInput);

  return (
    <div className="grid gap-3">
      <Field label="Workout title" hint="Name this session so it is easy to find later.">
        <input className={inputClass} value={value.title} onChange={(event) => set("title", event.target.value)} placeholder="Grip strength" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date" hint="The day this workout is planned or completed.">
          <input className={inputClass} type="date" value={value.workoutDate} onChange={(event) => set("workoutDate", event.target.value)} />
        </Field>
        <Field label="Status" hint="Planned is safest for new workouts. Use actions to start or complete later.">
          <Select value={value.status} options={statuses} onChange={(next) => set("status", next)} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Workout type" hint="The main style of training, like strength, running, yoga, or walking.">
          <Select value={value.workoutType} options={workoutTypes} onChange={(next) => set("workoutType", next)} />
        </Field>
        <Field label="Goal" hint="Why you are doing it. This helps goal stats and history make sense.">
          <Select value={value.goalType} options={goalTypes} onChange={(next) => set("goalType", next)} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Intensity" hint="How hard it felt. Easy, medium, hard, or extreme.">
          <Select value={value.intensity} options={intensities} onChange={(next) => set("intensity", next)} />
        </Field>
        <Field label="Body focus" hint="The body area trained most in this workout.">
          <Select value={value.bodyPart} options={bodyParts} onChange={(next) => set("bodyPart", next)} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Minutes" hint="Active workout time. This powers active-minute stats.">
          <input className={inputClass} type="number" value={value.durationMinutes} onChange={(event) => numberSet("durationMinutes", event.target.value)} placeholder="30" />
        </Field>
        <Field label="Calories" hint="Estimated calories burned. Use 0 if you do not track it.">
          <input className={inputClass} type="number" value={value.calories} onChange={(event) => numberSet("calories", event.target.value)} placeholder="200" />
        </Field>
      </div>
      <button type="button" className={softButton} onClick={() => setShowAdvanced((current) => !current)}>
        <Sparkles className="h-4 w-4" />
        {showAdvanced ? "Hide advanced details" : "Add sets, reps, distance, mood"}
      </button>
      {showAdvanced ? (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/[0.08] dark:bg-white/[0.035]">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Sets" hint="Number of rounds for strength work. Use 0 if not needed.">
              <input className={inputClass} type="number" value={value.sets} onChange={(event) => numberSet("sets", event.target.value)} placeholder="0" />
            </Field>
            <Field label="Reps" hint="Repetitions per set or total reps. Use 0 if not needed.">
              <input className={inputClass} type="number" value={value.reps} onChange={(event) => numberSet("reps", event.target.value)} placeholder="0" />
            </Field>
            <Field label="Weight" hint="Weight lifted. Use your normal unit, like kg or lb.">
              <input className={inputClass} type="number" value={value.weight} onChange={(event) => numberSet("weight", event.target.value)} placeholder="0" />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Distance" hint="Distance for running, walking, cycling, or cardio.">
              <input className={inputClass} type="number" value={value.distance} onChange={(event) => numberSet("distance", event.target.value)} placeholder="0" />
            </Field>
            <Field label="Steps" hint="Steps from this workout. Useful for walking and daily movement goals.">
              <input className={inputClass} type="number" value={value.steps} onChange={(event) => numberSet("steps", event.target.value)} placeholder="0" />
            </Field>
          </div>
          <Field label="Mood after" hint="How you felt after training. Recovery stats can use this later.">
            <Select value={value.moodAfter} options={moods} onChange={(next) => set("moodAfter", next)} />
          </Field>
          <Field label="Notes" hint="Optional details like exercises, pace, pain, or what to improve next time.">
            <textarea className={inputClass} rows={3} value={value.notes} onChange={(event) => set("notes", event.target.value)} placeholder="Optional notes" />
          </Field>
        </div>
      ) : null}
    </div>
  );
}

function Select<T extends string>({ value, options, onChange }: { value: T; options: SelectOption<T>[]; onChange: (value: T) => void }) {
  return (
    <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Dumbbell; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#08101f]">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-500" />
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function WorkoutForm(props: { value: FitnessWorkoutInput; setValue: (next: FitnessWorkoutInput) => void; editing: boolean; saving: boolean; onReset: () => void; onSave: () => void }) {
  return (
    <Panel title={props.editing ? "Edit workout" : "Create workout"} icon={Plus}>
      <WorkoutFields value={props.value} setValue={props.setValue} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className={softButton} onClick={props.onReset}><RotateCcw className="h-4 w-4" />Reset</button>
        <button type="button" className={primaryButton} disabled={props.saving} onClick={props.onSave}>{props.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{props.editing ? "Update" : "Create"}</button>
      </div>
    </Panel>
  );
}

function TemplateForm(props: { value: FitnessWorkoutInput; setValue: (next: FitnessWorkoutInput) => void; editing: boolean; saving: boolean; onReset: () => void; onSave: () => void }) {
  return (
    <Panel title={props.editing ? "Edit template" : "Create template"} icon={ShieldCheck}>
      <WorkoutFields value={props.value} setValue={props.setValue} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className={softButton} onClick={props.onReset}><RotateCcw className="h-4 w-4" />Reset</button>
        <button type="button" className={primaryButton} disabled={props.saving} onClick={props.onSave}>{props.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{props.editing ? "Update" : "Save"}</button>
      </div>
    </Panel>
  );
}

function RecoveryForm(props: { value: FitnessRecoveryInput; setValue: (next: FitnessRecoveryInput) => void; editing: boolean; saving: boolean; onReset: () => void; onSave: () => void }) {
  const set = <K extends keyof FitnessRecoveryInput>(key: K, value: FitnessRecoveryInput[K]) => props.setValue({ ...props.value, [key]: value });
  return (
    <Panel title={props.editing ? "Edit recovery" : "Recovery check"} icon={Moon}>
      <div className="grid gap-3">
        <Field label="Check date" hint="The day this recovery check belongs to.">
          <input className={inputClass} type="date" value={props.value.checkDate} onChange={(event) => set("checkDate", event.target.value)} />
        </Field>
        <div className="grid gap-3">
          <Field label="Sleep quality" hint="How well you slept before training or resting.">
            <select className={inputClass} value={props.value.sleepQuality} onChange={(event) => set("sleepQuality", event.target.value as FitnessRecoveryInput["sleepQuality"])}>
              {["excellent", "good", "okay", "poor"].map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
            </select>
          </Field>
          <Field label="Energy level" hint="Your energy today. Low energy can suggest lighter training.">
            <select className={inputClass} value={props.value.energyLevel} onChange={(event) => set("energyLevel", event.target.value as FitnessRecoveryInput["energyLevel"])}>
              {["high", "medium", "low"].map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
            </select>
          </Field>
          <Field label="Soreness" hint="How sore your body feels. Heavy soreness usually means recovery first.">
            <select className={inputClass} value={props.value.sorenessLevel} onChange={(event) => set("sorenessLevel", event.target.value as FitnessRecoveryInput["sorenessLevel"])}>
              {["none", "light", "medium", "high"].map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid gap-3">
          <Field label="Water glasses" hint="How many glasses of water you drank today.">
            <input className={inputClass} type="number" value={props.value.waterGlasses} onChange={(event) => set("waterGlasses", Number(event.target.value))} placeholder="8" />
          </Field>
          <button type="button" onClick={() => set("isRestDay", !props.value.isRestDay)} className={props.value.isRestDay ? primaryButton : softButton}>
            <Moon className="h-4 w-4" />
            {props.value.isRestDay ? "Rest day" : "Training day"}
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className={softButton} onClick={props.onReset}><RotateCcw className="h-4 w-4" />Reset</button>
        <button type="button" className={primaryButton} disabled={props.saving} onClick={props.onSave}>{props.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{props.editing ? "Update" : "Save"}</button>
      </div>
    </Panel>
  );
}

function WorkoutPanel(props: {
  filters: WorkoutFilters;
  setFilters: (next: WorkoutFilters) => void;
  workouts: FitnessWorkout[];
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  onEdit: (workout: FitnessWorkout) => void;
  onDelete: (id: string) => void;
  onAction: (id: string, action: "start" | "complete" | "skip" | "cancel") => void;
}) {
  return (
    <Panel title="Workout list" icon={Dumbbell}>
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(2,11rem)]">
        <Field label="Search" hint="Find workouts by title, notes, type, or related text.">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="min-w-0 flex-1 bg-transparent py-3 text-sm font-bold outline-none" value={props.filters.search} onChange={(event) => props.setFilters({ ...props.filters, search: event.target.value })} placeholder="Search workouts" />
          </label>
        </Field>
        <Field label="Status" hint="Show planned, active, completed, skipped, or cancelled workouts.">
          <select className={inputClass} value={props.filters.status} onChange={(event) => props.setFilters({ ...props.filters, status: event.target.value })}><option value="">All statuses</option>{statuses.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
        </Field>
        <Field label="Type" hint="Filter by running, strength, yoga, cardio, and more.">
          <select className={inputClass} value={props.filters.workoutType} onChange={(event) => props.setFilters({ ...props.filters, workoutType: event.target.value })}><option value="">All types</option>{workoutTypes.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
        </Field>
        <Field label="Body focus" hint="Filter by the main trained body part.">
          <select className={inputClass} value={props.filters.bodyPart} onChange={(event) => props.setFilters({ ...props.filters, bodyPart: event.target.value })}><option value="">Any body part</option>{bodyParts.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
        </Field>
      </div>
      {props.loading ? <LoadingBlock /> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {props.workouts.map((workout) => {
            const id = fitnessId(workout);
            return (
              <article key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">{workout.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{titleCase(workout.workoutType)} • {titleCase(workout.bodyPart)} • {workout.durationMinutes} min</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase ${statusClass(workout.status)}`}>{workout.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <MiniStat label="Cal" value={String(workout.calories ?? 0)} />
                  <MiniStat label="Steps" value={String(workout.steps ?? 0)} />
                  <MiniStat label="Mood" value={titleCase(workout.moodAfter)} />
                </div>
                <div className="mt-4 flex flex-nowrap gap-1.5">
                  <IconButton label="Start" icon={<Play className="h-4 w-4" />} onClick={() => props.onAction(id, "start")} disabled={workout.status !== "planned"} />
                  <IconButton label="Complete" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => props.onAction(id, "complete")} disabled={workout.status === "completed" || workout.status === "cancelled"} />
                  <IconButton label="Skip" icon={<SkipForward className="h-4 w-4" />} onClick={() => props.onAction(id, "skip")} disabled={workout.status === "completed" || workout.status === "cancelled"} />
                  <IconButton label="Cancel" icon={<X className="h-4 w-4" />} onClick={() => props.onAction(id, "cancel")} disabled={workout.status === "completed" || workout.status === "cancelled"} />
                  <IconButton label="Edit" icon={<PencilLine className="h-4 w-4" />} onClick={() => props.onEdit(workout)} />
                  <IconButton label="Delete" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => props.onDelete(id)} />
                </div>
              </article>
            );
          })}
          {props.workouts.length === 0 ? <EmptyState text="No workouts match this view." /> : null}
        </div>
      )}
      <Pagination page={props.page} totalPages={props.totalPages} setPage={props.setPage} />
    </Panel>
  );
}

function TemplatesPanel(props: { templates: FitnessTemplate[]; loading: boolean; onUse: (template: FitnessTemplate) => void; onEdit: (template: FitnessTemplate) => void; onDelete: (id: string) => void }) {
  return (
    <Panel title="Workout templates" icon={ShieldCheck}>
      {props.loading ? <LoadingBlock /> : <div className="grid gap-3 lg:grid-cols-2">
        {props.templates.map((template) => {
          const id = fitnessId(template);
          const isDefault = Boolean(template.isDefault ?? template.default);
          return (
            <article key={id || template.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black">{template.title ?? template.name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{titleCase(template.workoutType)} • {template.durationMinutes ?? 0} min</p>
                </div>
                {isDefault ? <span className="shrink-0 rounded-full bg-cyan-500/15 px-2 py-1 text-[0.65rem] font-black uppercase text-cyan-700 dark:text-cyan-200">Default</span> : null}
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className={primaryButton} onClick={() => props.onUse(template)}><Plus className="h-4 w-4" />Use</button>
                {!isDefault ? <button type="button" className={softButton} onClick={() => props.onEdit(template)}><PencilLine className="h-4 w-4" />Edit</button> : null}
                {!isDefault ? <button type="button" className={dangerButton} onClick={() => props.onDelete(id)}><Trash2 className="h-4 w-4" />Delete</button> : null}
              </div>
            </article>
          );
        })}
        {props.templates.length === 0 ? <EmptyState text="No templates yet." /> : null}
      </div>}
    </Panel>
  );
}

function GoalsPanel(props: { goals: FitnessGoals; setGoals: (goals: FitnessGoals) => void; stats: Record<string, unknown>; saving: boolean; onSave: () => void }) {
  const set = (key: keyof FitnessGoals, value: string) => props.setGoals({ ...props.goals, [key]: Number(value) });
  return (
    <Panel title="Fitness goals" icon={Target}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Weekly workouts"><input className={inputClass} type="number" value={props.goals.weeklyWorkoutTarget} onChange={(event) => set("weeklyWorkoutTarget", event.target.value)} /></Field>
        <Field label="Weekly active minutes"><input className={inputClass} type="number" value={props.goals.weeklyActiveMinutesTarget} onChange={(event) => set("weeklyActiveMinutesTarget", event.target.value)} /></Field>
        <Field label="Weekly calories"><input className={inputClass} type="number" value={props.goals.weeklyCaloriesTarget} onChange={(event) => set("weeklyCaloriesTarget", event.target.value)} /></Field>
        <Field label="Daily steps"><input className={inputClass} type="number" value={props.goals.dailyStepsTarget} onChange={(event) => set("dailyStepsTarget", event.target.value)} /></Field>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <MiniStat label="Workout" value={`${props.stats.weeklyGoalProgress ?? 0}%`} />
        <MiniStat label="Calories" value={`${props.stats.caloriesGoalProgress ?? 0}%`} />
        <MiniStat label="Minutes" value={`${props.stats.activeMinutesGoalProgress ?? 0}%`} />
        <MiniStat label="Steps" value={`${props.stats.stepsGoalProgress ?? 0}%`} />
      </div>
      <button type="button" className={`${primaryButton} mt-4 w-full`} disabled={props.saving} onClick={props.onSave}>{props.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save goals</button>
    </Panel>
  );
}

function RecoveryPanel(props: { items: FitnessRecovery[]; loading: boolean; page: number; setPage: (page: number) => void; totalPages: number; recommendation: string; onEdit: (item: FitnessRecovery) => void; onDelete: (id: string) => void }) {
  return (
    <Panel title="Recovery history" icon={Moon}>
      {props.recommendation ? <p className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-200">{props.recommendation}</p> : null}
      {props.loading ? <LoadingBlock /> : <div className="grid gap-3 lg:grid-cols-2">
        {props.items.map((item) => {
          const id = fitnessId(item);
          return (
            <article key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
              <p className="font-black">{item.checkDate?.slice(0, 10)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Sleep {titleCase(item.sleepQuality)} • Energy {titleCase(item.energyLevel)} • Soreness {titleCase(item.sorenessLevel)}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">{item.isRestDay ? "Rest day" : "Training day"} • {item.waterGlasses} water glasses</p>
              <div className="mt-4 flex gap-2">
                <button type="button" className={softButton} onClick={() => props.onEdit(item)}><PencilLine className="h-4 w-4" />Edit</button>
                <button type="button" className={dangerButton} onClick={() => props.onDelete(id)}><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            </article>
          );
        })}
        {props.items.length === 0 ? <EmptyState text="No recovery checks yet." /> : null}
      </div>}
      <Pagination page={props.page} totalPages={props.totalPages} setPage={props.setPage} />
    </Panel>
  );
}

function RecordsPanel(props: { records: Record<string, unknown>[]; loading: boolean; recalculating: boolean; onRecalculate: () => void }) {
  return (
    <Panel title="Personal records" icon={Trophy}>
      <button type="button" className={`${primaryButton} mb-4`} disabled={props.recalculating} onClick={props.onRecalculate}>{props.recalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}Recalculate</button>
      {props.loading ? <LoadingBlock /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {props.records.map((record, index) => (
          <div key={String(record.id ?? record._id ?? index)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
            <Trophy className="h-5 w-5 text-amber-400" />
            <p className="mt-3 font-black">{String(record.title ?? record.label ?? record.metric ?? "Record")}</p>
            <p className="mt-1 text-2xl font-black text-cyan-500">{String(record.value ?? "-")}</p>
          </div>
        ))}
        {props.records.length === 0 ? <EmptyState text="No personal records yet." /> : null}
      </div>}
    </Panel>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        <span>{label}</span>
        {hint ? (
          <button
            type="button"
            title={hint}
            data-tooltip={hint}
            aria-label={`${label}: ${hint}`}
            onClick={(event) => {
              event.preventDefault();
              setOpen((current) => !current);
            }}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 transition hover:bg-cyan-500 hover:text-white dark:text-cyan-200"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </span>
      {children}
      {hint && open ? (
        <span className="mt-1.5 block text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function IconButton({ label, icon, onClick, disabled, danger }: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className={danger ? `${dangerButton} h-9 w-9 px-0` : `${softButton} h-9 w-9 px-0`}>{icon}</button>;
}

function LoadingBlock() {
  return <div className="flex justify-center rounded-2xl border border-slate-200 p-10 dark:border-white/[0.08]"><Loader2 className="animate-spin text-cyan-500" /></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500 dark:border-white/[0.08]">{text}</div>;
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (page: number) => void }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs font-bold text-slate-500">Page {page} of {Math.max(1, totalPages)}</p>
      <div className="flex gap-2">
        <button type="button" className={softButton} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <button type="button" className={softButton} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

function statusClass(status: WorkoutStatus) {
  const classes: Record<WorkoutStatus, string> = {
    planned: "bg-blue-500/15 text-blue-700 dark:text-blue-200",
    active: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-200",
    completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
    skipped: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
    cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-200",
  };
  return classes[status] ?? classes.planned;
}
