import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";
import type { DashboardData, WeeklyStat } from "@/types/dashboard";
import type {
  CreateCategoryRequest,
  CreateExpenseRequest,
  ExpensesQuery,
  ExpensesResponse,
  MostSpentCategory,
  MoneyCategory,
  MoneyExpense,
  MoneySummary,
  SalaryRecord,
  UpdateExpenseRequest,
  UpdateSalaryRequest,
} from "@/types/money";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  user?: T;
  message?: string;
};

type PaginatedApiEnvelope<T> = ApiEnvelope<T> & {
  pagination?: unknown;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function emitUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
  }
}

function getPayload<T>(body: unknown): T {
  if (body && typeof body === "object") {
    const envelope = body as ApiEnvelope<T>;

    if (envelope.data !== undefined) return envelope.data;
    if (envelope.user !== undefined) return envelope.user;
  }

  return body as T;
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: fetchOptions.credentials ?? "include",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    const message = body?.message || "Something went wrong";

    if (response.status === 401 && requireAuth) {
      emitUnauthorized();
    }

    throw new ApiError(message, response.status, body);
  }

  return getPayload<T>(body);
}

async function apiRequestWithMeta<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<PaginatedApiEnvelope<T> | null> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: fetchOptions.credentials ?? "include",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const body = (await response.json().catch(() => null)) as
    | PaginatedApiEnvelope<T>
    | null;

  if (!response.ok) {
    const message = body?.message || "Something went wrong";

    if (response.status === 401 && requireAuth) {
      emitUnauthorized();
    }

    throw new ApiError(message, response.status, body);
  }

  return body;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export const authAPI = {
  register: (payload: RegisterRequest) =>
    apiRequest<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: false,
    }),

  login: (payload: LoginRequest) =>
    apiRequest<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: false,
    }),

  getCurrentUser: () => apiRequest<AuthUser>("/api/auth/me"),

  logout: async () => {
    await apiRequest("/api/auth/logout", { method: "POST" });
  },
};

export const dashboardAPI = {
  getDashboard: () => apiRequest<DashboardData>("/api/dashboard"),

  getWeeklyStats: () =>
    apiRequest<WeeklyStat[]>("/api/dashboard/weekly-stats"),

  updateWaterIntake: (glassesConsumed: number) =>
    apiRequest<{ glassesConsumed: number }>("/api/dashboard/water", {
      method: "POST",
      body: JSON.stringify({ glassesConsumed }),
    }),

  logFocusSession: (startTime: Date, endTime: Date, category: string) =>
    apiRequest<void>("/api/dashboard/focus", {
      method: "POST",
      body: JSON.stringify({ startTime, endTime, category }),
    }),

  updateWeeklyGoal: (completedWorkouts: number, goalWorkouts: number) =>
    apiRequest<void>("/api/dashboard/weekly-goal", {
      method: "POST",
      body: JSON.stringify({ completedWorkouts, goalWorkouts }),
    }),
};

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
    apiRequest<void>(`/api/workouts/${id}`, {
      method: "DELETE",
    }),
};

export const moneyAPI = {
  getCategories: () => apiRequest<MoneyCategory[]>("/api/money/categories"),

  createCategory: (payload: CreateCategoryRequest) =>
    apiRequest<MoneyCategory>("/api/money/category", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteCategory: (name: string) =>
    apiRequest<void>(`/api/money/category/${encodeURIComponent(name)}`, {
      method: "DELETE",
    }),

  createExpense: (payload: CreateExpenseRequest) =>
    apiRequest<MoneyExpense>("/api/money/expense", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateExpense: (id: string, payload: UpdateExpenseRequest) =>
    apiRequest<MoneyExpense>(`/api/money/expense/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteExpense: (id: string) =>
    apiRequest<void>(`/api/money/expense/${id}`, {
      method: "DELETE",
    }),

  updateSalary: (payload: UpdateSalaryRequest) =>
    apiRequest<SalaryRecord>("/api/money/salary", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteSalary: () =>
    apiRequest<void>("/api/money/salary", {
      method: "DELETE",
    }),

  getSalary: (userId: string) =>
    apiRequest<SalaryRecord | null>(`/api/money/salary/${userId}`),

  getExpenses: async (query: ExpensesQuery) => {
    const params = new URLSearchParams();

    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);
    if (query.category) params.set("category", query.category);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const search = params.toString();
    const response = await apiRequestWithMeta<MoneyExpense[]>(
      `/api/money/expenses${search ? `?${search}` : ""}`,
    );

    return {
      data: response?.data ?? [],
      pagination: (response?.pagination as ExpensesResponse["pagination"]) ?? {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total: response?.data?.length ?? 0,
        totalPages: 1,
      },
    } satisfies ExpensesResponse;
  },

  getSummary: () => apiRequest<MoneySummary>("/api/money/summary"),

  getMostSpentCategory: (userId: string) =>
    apiRequest<MostSpentCategory | null>(
      `/api/money/most-spent-category/${userId}`,
    ),
};

export type ScoreGoalType = "count" | "duration" | "boolean";

export interface ScoreSection {
  _id: string;
  name: string;
  emoji: string;
  goalType: ScoreGoalType;
  goalValue: number;
  currentValue: number;
  order: number;
}

export interface ScoreSectionInput {
  name: string;
  emoji: string;
  goalType: ScoreGoalType;
  goalValue: number;
}

export const scoreSectionAPI = {
  getSections: () => apiRequest<ScoreSection[]>("/api/score-sections"),

  createSection: (section: ScoreSectionInput) =>
    apiRequest<ScoreSection>("/api/score-sections", {
      method: "POST",
      body: JSON.stringify(section),
    }),

  updateSection: (id: string, section: Partial<ScoreSectionInput>) =>
    apiRequest<ScoreSection>(`/api/score-sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(section),
    }),

  deleteSection: (id: string) =>
    apiRequest<void>(`/api/score-sections/${id}`, {
      method: "DELETE",
    }),

  updateProgress: (id: string, value: number) =>
    apiRequest<ScoreSection>(`/api/score-sections/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),
};

export default apiRequest;
