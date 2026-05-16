import apiRequest from "@/lib/api";

export type WorkoutStatus =
  | "planned"
  | "active"
  | "completed"
  | "skipped"
  | "cancelled";
export type WorkoutType =
  | "cardio"
  | "strength"
  | "hiit"
  | "yoga"
  | "walking"
  | "running"
  | "cycling"
  | "sports"
  | "stretching"
  | "general";
export type GoalType =
  | "weight_loss"
  | "muscle_gain"
  | "general_fitness"
  | "strength_training"
  | "cardio_health"
  | "flexibility"
  | "daily_movement"
  | "recovery";
export type WorkoutIntensity = "easy" | "medium" | "hard" | "extreme";
export type BodyPart =
  | "full_body"
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "cardio"
  | "mobility";
export type MoodAfter = "great" | "good" | "tired" | "low_energy" | "sore";

export type SleepQuality = "poor" | "okay" | "good" | "excellent";
export type EnergyLevel = "high" | "medium" | "low";
export type SorenessLevel = "none" | "light" | "medium" | "high";

export interface FitnessWorkoutInput {
  title: string;
  workoutDate: string;
  workoutType: WorkoutType;
  goalType: GoalType;
  durationMinutes: number;
  calories: number;
  intensity: WorkoutIntensity;
  bodyPart: BodyPart;
  sets: number;
  reps: number;
  weight: number;
  distance: number;
  steps: number;
  moodAfter: MoodAfter;
  notes: string;
  status: WorkoutStatus;
}

export type FitnessWorkout = FitnessWorkoutInput & {
  _id?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
};

export interface FitnessGoals {
  weeklyWorkoutTarget: number;
  weeklyActiveMinutesTarget: number;
  weeklyCaloriesTarget: number;
  dailyStepsTarget: number;
}

export type FitnessTemplate = Partial<FitnessWorkoutInput> & {
  _id?: string;
  id?: string;
  title: string;
  name?: string;
  isDefault?: boolean;
  default?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export interface FitnessRecoveryInput {
  checkDate: string;
  sleepQuality: SleepQuality;
  energyLevel: EnergyLevel;
  sorenessLevel: SorenessLevel;
  isRestDay: boolean;
  waterGlasses: number;
}

export type FitnessRecovery = FitnessRecoveryInput & {
  _id?: string;
  id?: string;
  recommendation?: string;
  recoveryRecommendation?: string;
  createdAt?: string;
};

export type FitnessStats = Record<string, unknown> & {
  completedWorkoutsToday?: number;
  completedWorkoutsThisWeek?: number;
  completedWorkoutsThisMonth?: number;
  caloriesToday?: number;
  caloriesThisWeek?: number;
  caloriesThisMonth?: number;
  activeMinutesToday?: number;
  activeMinutesThisWeek?: number;
  activeMinutesThisMonth?: number;
  currentStreak?: number;
  longestStreak?: number;
  averageWorkoutDuration?: number;
  mostTrainedType?: string;
  mostTrainedBodyPart?: string;
  bestWorkoutDay?: string;
  weeklyGoalProgress?: number;
  caloriesGoalProgress?: number;
  activeMinutesGoalProgress?: number;
  stepsGoalProgress?: number;
  workoutTypeBreakdown?: Array<Record<string, unknown>>;
  bodyPartBreakdown?: Array<Record<string, unknown>>;
  intensityBreakdown?: Array<Record<string, unknown>>;
  dailyWorkoutBreakdown?: Array<Record<string, unknown>>;
};

export type PersonalRecord = Record<string, unknown> & {
  _id?: string;
  id?: string;
  title?: string;
  label?: string;
  value?: number | string;
  metric?: string;
};

export interface FitnessListResponse<T> {
  data: T[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const fitnessQueryKeys = {
  stats: ["fitness", "stats"] as const,
  workouts: (query: Record<string, string | number | undefined>) =>
    ["fitness", "workouts", query] as const,
  goals: ["fitness", "goals"] as const,
  templates: ["fitness", "templates"] as const,
  recovery: (query: Record<string, string | number | undefined>) =>
    ["fitness", "recovery", query] as const,
  records: ["fitness", "records"] as const,
};

function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export function fitnessId(item: { _id?: string; id?: string }) {
  return item._id ?? item.id ?? "";
}

export const defaultFitnessGoals: FitnessGoals = {
  weeklyWorkoutTarget: 4,
  weeklyActiveMinutesTarget: 150,
  weeklyCaloriesTarget: 1800,
  dailyStepsTarget: 8000,
};

export const defaultWorkoutPayload: FitnessWorkoutInput = {
  title: "",
  workoutDate: new Date().toISOString().slice(0, 10),
  workoutType: "general",
  goalType: "general_fitness",
  durationMinutes: 30,
  calories: 200,
  intensity: "medium",
  bodyPart: "full_body",
  sets: 0,
  reps: 0,
  weight: 0,
  distance: 0,
  steps: 0,
  moodAfter: "good",
  notes: "",
  status: "planned",
};

export const defaultRecoveryPayload: FitnessRecoveryInput = {
  checkDate: new Date().toISOString().slice(0, 10),
  sleepQuality: "good",
  energyLevel: "medium",
  sorenessLevel: "light",
  isRestDay: false,
  waterGlasses: 8,
};

export const fitnessAPI = {
  getStats: () => apiRequest<FitnessStats>("/api/fitness/stats", { cacheTtlMs: 0 }),

  getWorkouts: (params: Record<string, string | number | undefined>) =>
    apiRequest<FitnessWorkout[] | FitnessListResponse<FitnessWorkout>>(
      `/api/fitness/workouts${toQuery(params)}`,
      { cacheTtlMs: 0 },
    ),

  createWorkout: (payload: FitnessWorkoutInput) =>
    apiRequest<FitnessWorkout>("/api/fitness/workouts", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "fitness.workout.create.success",
    }),

  updateWorkout: (id: string, payload: Partial<FitnessWorkoutInput>) =>
    apiRequest<FitnessWorkout>(`/api/fitness/workouts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      feedbackEventKey: "fitness.workout.update.success",
    }),

  deleteWorkout: (id: string) =>
    apiRequest<void>(`/api/fitness/workouts/${id}`, {
      method: "DELETE",
      feedbackEventKey: "fitness.workout.delete.success",
    }),

  workoutAction: (
    id: string,
    action: "start" | "complete" | "skip" | "cancel",
  ) =>
    apiRequest<FitnessWorkout>(`/api/fitness/workouts/${id}/${action}`, {
      method: "POST",
      feedbackEventKey: `fitness.workout.${action}.success`,
    }),

  getGoals: () => apiRequest<FitnessGoals>("/api/fitness/goals", { cacheTtlMs: 0 }),

  updateGoals: (payload: FitnessGoals) =>
    apiRequest<FitnessGoals>("/api/fitness/goals", {
      method: "PUT",
      body: JSON.stringify(payload),
      feedbackEventKey: "fitness.goal.update.success",
    }),

  getTemplates: () =>
    apiRequest<FitnessTemplate[]>("/api/fitness/templates", { cacheTtlMs: 0 }),

  createTemplate: (payload: Partial<FitnessWorkoutInput> & { title: string }) =>
    apiRequest<FitnessTemplate>("/api/fitness/templates", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "fitness.template.create.success",
    }),

  updateTemplate: (
    id: string,
    payload: Partial<FitnessWorkoutInput> & { title?: string },
  ) =>
    apiRequest<FitnessTemplate>(`/api/fitness/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      feedbackEventKey: "fitness.template.update.success",
    }),

  deleteTemplate: (id: string) =>
    apiRequest<void>(`/api/fitness/templates/${id}`, {
      method: "DELETE",
      feedbackEventKey: "fitness.template.delete.success",
    }),

  getRecovery: (params: Record<string, string | number | undefined>) =>
    apiRequest<FitnessRecovery[] | FitnessListResponse<FitnessRecovery>>(
      `/api/fitness/recovery${toQuery(params)}`,
      { cacheTtlMs: 0 },
    ),

  createRecovery: (payload: FitnessRecoveryInput) =>
    apiRequest<FitnessRecovery>("/api/fitness/recovery", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "fitness.recovery.create.success",
    }),

  updateRecovery: (id: string, payload: Partial<FitnessRecoveryInput>) =>
    apiRequest<FitnessRecovery>(`/api/fitness/recovery/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      feedbackEventKey: "fitness.recovery.update.success",
    }),

  deleteRecovery: (id: string) =>
    apiRequest<void>(`/api/fitness/recovery/${id}`, {
      method: "DELETE",
      feedbackEventKey: "fitness.recovery.delete.success",
    }),

  getPersonalRecords: () =>
    apiRequest<PersonalRecord[]>("/api/fitness/personal-records", {
      cacheTtlMs: 0,
    }),

  recalculatePersonalRecords: () =>
    apiRequest<PersonalRecord[]>("/api/fitness/personal-records/recalculate", {
      method: "POST",
      feedbackEventKey: "fitness.personal-records.recalculate.success",
    }),
};
