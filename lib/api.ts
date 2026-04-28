// frontend/lib/api.ts

import type { ApiResponse, DashboardData } from "@/types/dashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> {
  const { requireAuth: _requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: "include",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => apiRequest<DashboardData>("/api/dashboard"),

  updateWaterIntake: (glassesConsumed: number) =>
    apiRequest<{ glassesConsumed: number }>("/api/dashboard/water", {
      method: "POST",
      body: JSON.stringify({ glassesConsumed }),
    }),

  logFocusSession: (startTime: Date, endTime: Date, category: string) =>
    apiRequest("/api/dashboard/focus", {
      method: "POST",
      body: JSON.stringify({ startTime, endTime, category }),
    }),

  updateWeeklyGoal: (completedWorkouts: number, goalWorkouts: number) =>
    apiRequest("/api/dashboard/weekly-goal", {
      method: "POST",
      body: JSON.stringify({ completedWorkouts, goalWorkouts }),
    }),
};

// Auth API
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authAPI = {
  register: (name: string, email: string, password: string) =>
    apiRequest<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      requireAuth: false,
    }),

  login: (email: string, password: string) =>
    apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      requireAuth: false,
    }),

  logout: () => apiRequest<null>("/api/auth/logout", { method: "POST" }),

  getCurrentUser: () => apiRequest<LoginResponse["user"]>("/api/auth/me"),
};

// Workout API
export interface WorkoutInput {
  exercise: string;
  duration: number;
  calories?: number;
}

export const workoutAPI = {
  getWorkouts: () => apiRequest<WorkoutInput[]>("/api/workouts"),

  createWorkout: (workout: WorkoutInput) =>
    apiRequest<WorkoutInput>("/api/workouts", {
      method: "POST",
      body: JSON.stringify(workout),
    }),

  updateWorkout: (id: string, workout: Partial<WorkoutInput>) =>
    apiRequest<WorkoutInput>(`/api/workouts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(workout),
    }),

  deleteWorkout: (id: string) =>
    apiRequest<null>(`/api/workouts/${id}`, {
      method: "DELETE",
    }),
};

export default apiRequest;
