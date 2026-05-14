import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";
import type { DashboardData, WeeklyStat } from "@/types/dashboard";
import type {
  AdminBlockUpdateResponse,
  AdminRoleUpdateResponse,
  AdminUserSummaryResponse,
  AdminUsersParams,
  AdminUsersMeta,
  AdminUserListItem,
  UserRole,
} from "@/types/admin";
import type {
  CreateLearningSessionRequest,
  LearningTemplate,
  LearningSession,
  LearningSessionsQuery,
  LearningSessionsResponse,
  LearningSummary,
  TimerPreset,
  UpdateLearningSessionRequest,
} from "@/types/learning";
import type {
  CreateCategoryRequest,
  CreateExpenseRequest,
  ExpensesQuery,
  ExpensesResponse,
  InsightsQuery,
  MoneyCategory,
  MoneyExpense,
  MoneyInsights,
  MoneySummary,
  SalaryRecord,
  BalanceResponse,
  BalanceSource,
  MonthlyExpenseSummary,
  MonthlyIncomeData,
  MonthlyIncomeHistoryItem,
  UpdateExpenseRequest,
  UpdateSalaryRequest,
  Loan,
  ExternalDebt,
  FinancialSummary,
  LendingStats,
  CreateLoanRequest,
  RepaymentRequest,
  CreateLoanResponse,
  RepaymentResponse,
  LoanDetailsResponse,
  MonthlySummaryResponse,
  LoanRecord,
  LendingRecord,
  FinanceSummary,
  FundingSource,
  ExternalIncome,
  OtherSavings,
  CreateExternalIncomeRequest,
  CreateOtherSavingsRequest,
} from "@/types/money";
import toast from "react-hot-toast";

// Empty string → relative URLs → all requests go to the same Next.js app.
// Money/learning/score-sections routes are proxied to the external backend
// via next.config.ts rewrites (server-side, no CORS).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";
export const AUTH_FORBIDDEN_EVENT = "auth:forbidden";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
  cacheTtlMs?: number;
  showSuccessToast?: boolean;
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  user?: T;
  message?: string;
  field?: string;
};

type PaginatedApiEnvelope<T> = ApiEnvelope<T> & {
  pagination?: unknown;
  meta?: unknown;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;
  field?: string;

  constructor(message: string, status: number, body?: unknown, field?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.field = field;
  }
}

const DEFAULT_GET_CACHE_TTL_MS = 20_000;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();

function isClient() {
  return typeof window !== "undefined";
}

function isReadRequest(method?: string) {
  return !method || method.toUpperCase() === "GET";
}

function getCacheKey(endpoint: string, config: RequestInit) {
  return `${config.method ?? "GET"}:${endpoint}`;
}

function clearApiCache() {
  responseCache.clear();
}

function showBackendSuccess(message: string | undefined, options: ApiOptions) {
  if (!message || !isClient()) return;

  const method = options.method?.toUpperCase() ?? "GET";
  const shouldShow =
    options.showSuccessToast ?? (method !== "GET" && method !== "HEAD");

  if (!shouldShow) return;

  toast.success(message, { duration: 1800 });
}

function emitUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
  }
}

function emitForbidden(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUTH_FORBIDDEN_EVENT, {
        detail: {
          message,
          blocked:
            message.trim().toLowerCase() !==
            "forbidden: admin access only",
        },
      }),
    );
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
  const {
    requireAuth = true,
    cacheTtlMs = DEFAULT_GET_CACHE_TTL_MS,
    showSuccessToast,
    ...fetchOptions
  } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: fetchOptions.credentials ?? "include",
  };

  const readRequest = isReadRequest(config.method);
  const cacheKey = getCacheKey(endpoint, config);
  if (readRequest && cacheTtlMs > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config).catch(() => {
    throw new ApiError(
      "Service is temporarily unavailable. You can keep browsing, but actions need the backend connection.",
      0,
    );
  });
  const body = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    const message = body?.message || "Something went wrong";

    if (response.status === 401 && requireAuth) {
      emitUnauthorized();
    }
    if (response.status === 403 && requireAuth) {
      emitForbidden(message);
    }

    throw new ApiError(message, response.status, body, body?.field);
  }

  const payload = getPayload<T>(body);

  if (readRequest && cacheTtlMs > 0) {
    responseCache.set(cacheKey, {
      expiresAt: Date.now() + cacheTtlMs,
      value: payload,
    });
  } else if (!readRequest) {
    clearApiCache();
  }

  showBackendSuccess(body?.message, {
    ...options,
    showSuccessToast,
    method: config.method,
  });

  return payload;
}

async function apiRequestWithMeta<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<PaginatedApiEnvelope<T> | null> {
  const {
    requireAuth = true,
    cacheTtlMs = DEFAULT_GET_CACHE_TTL_MS,
    ...fetchOptions
  } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: fetchOptions.credentials ?? "include",
  };

  const readRequest = isReadRequest(config.method);
  const cacheKey = getCacheKey(endpoint, config);
  if (readRequest && cacheTtlMs > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as PaginatedApiEnvelope<T> | null;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config).catch(() => {
    throw new ApiError(
      "Service is temporarily unavailable. You can keep browsing, but actions need the backend connection.",
      0,
    );
  });
  const body = (await response
    .json()
    .catch(() => null)) as PaginatedApiEnvelope<T> | null;

  if (!response.ok) {
    const message = body?.message || "Something went wrong";

    if (response.status === 401 && requireAuth) {
      emitUnauthorized();
    }
    if (response.status === 403 && requireAuth) {
      emitForbidden(message);
    }

    throw new ApiError(message, response.status, body, body?.field);
  }

  if (readRequest && cacheTtlMs > 0) {
    responseCache.set(cacheKey, {
      expiresAt: Date.now() + cacheTtlMs,
      value: body,
    });
  } else if (!readRequest) {
    clearApiCache();
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

  getWeeklyStats: () => apiRequest<WeeklyStat[]>("/api/dashboard/weekly-stats"),

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

  addBalanceSource: (payload: {
    type: BalanceSource["type"];
    amount: number;
  }) =>
    apiRequest<BalanceSource>("/api/money/balance/add", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateBalanceSource: (
    id: string,
    payload: { type: BalanceSource["type"]; amount: number },
  ) =>
    apiRequest<BalanceSource>(`/api/money/balance/update/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteBalanceSource: (id: string) =>
    apiRequest<void>(`/api/money/balance/${id}`, {
      method: "DELETE",
    }),

  getBalanceSources: () => apiRequest<BalanceResponse>("/api/money/balance"),

  createExpense: (payload: CreateExpenseRequest) =>
    apiRequest<MoneyExpense>("/api/money/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateExpense: (id: string, payload: UpdateExpenseRequest) =>
    apiRequest<MoneyExpense>(`/api/money/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteExpense: (id: string) =>
    apiRequest<void>(`/api/money/expenses/${id}`, {
      method: "DELETE",
    }),

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

  getMonthlyExpenseSummary: () =>
    apiRequest<MonthlyExpenseSummary[]>("/api/money/expenses/monthly-summary"),

  getMonthlyIncome: (month: number, year: number) => {
    const params = new URLSearchParams();
    params.set("month", String(month));
    params.set("year", String(year));
    return apiRequest<MonthlyIncomeData>(
      `/api/money/monthly-income?${params.toString()}`,
    );
  },

  getMonthlyIncomeHistory: (limit = 12) => {
    const safeLimit = Math.max(1, Math.min(24, limit));
    return apiRequest<MonthlyIncomeHistoryItem[]>(
      `/api/money/monthly-income/history?limit=${safeLimit}`,
    );
  },

  createSalary: (payload: UpdateSalaryRequest) =>
    apiRequest<SalaryRecord>("/api/money/salary", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteSalary: () =>
    apiRequest<void>("/api/money/salary", {
      method: "DELETE",
    }),

  getCurrentSalary: () =>
    apiRequest<SalaryRecord | null>("/api/money/salary/current"),

  getSalaryHistory: () =>
    apiRequest<SalaryRecord[]>("/api/money/salary/history"),

  getSummary: () => apiRequest<MoneySummary>("/api/money/summary"),

  getMonthSummary: (month: number, year: number) => {
    const params = new URLSearchParams();
    params.set("month", String(month));
    params.set("year", String(year));
    return apiRequest<MonthlySummaryResponse>(
      `/api/money/summary?${params.toString()}`,
    );
  },

  getInsights: (query?: InsightsQuery) => {
    const params = new URLSearchParams();
    if (query?.month !== undefined) params.set("month", String(query.month));
    if (query?.year !== undefined) params.set("year", String(query.year));
    const search = params.toString();
    return apiRequest<MoneyInsights>(
      `/api/money/insights${search ? `?${search}` : ""}`,
    );
  },

  addIncome: (payload: CreateExternalIncomeRequest) =>
    apiRequest<ExternalIncome>("/api/money/income", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  addSavings: (payload: CreateOtherSavingsRequest) =>
    apiRequest<OtherSavings>("/api/money/savings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const lendingAPI = {
  // Loan Management
  createLoan: (payload: CreateLoanRequest) =>
    apiRequest<CreateLoanResponse>("/api/money/loans", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAllLoans: () => apiRequest<Loan[]>("/api/money/loans"),

  getLoanDetails: (id: string) =>
    apiRequest<LoanDetailsResponse>(`/api/money/loans/${id}`),

  repayLoan: (id: string, payload: RepaymentRequest) =>
    apiRequest<RepaymentResponse>(`/api/money/loans/${id}/repay`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getLoanTransactions: (id: string) =>
    apiRequest<LoanDetailsResponse>(`/api/money/loans/${id}/transactions`),

  // Financial Summary
  getFinancialSummary: () => apiRequest<FinancialSummary>("/api/finance/summary"),

  // External Debts
  getExternalDebts: () => apiRequest<ExternalDebt[]>("/api/money/debts"),

  // Statistics
  getLendingStats: () => apiRequest<LendingStats>("/api/lending-stats"),
};

export const learningAPI = {
  getSummary: () => apiRequest<LearningSummary>("/api/learning/summary"),

  getSessions: async (query: LearningSessionsQuery) => {
    const params = new URLSearchParams();

    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.status) params.set("status", query.status);
    if (query.subject) params.set("subject", query.subject);
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);

    const search = params.toString();
    const response = await apiRequestWithMeta<LearningSession[]>(
      `/api/learning/sessions${search ? `?${search}` : ""}`,
    );

    return {
      data: response?.data ?? [],
      pagination:
        (response?.pagination as LearningSessionsResponse["pagination"]) ?? {
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          total: response?.data?.length ?? 0,
          totalPages: 1,
        },
    } satisfies LearningSessionsResponse;
  },

  createSession: (payload: CreateLearningSessionRequest) =>
    apiRequest<LearningSession>("/api/learning/session", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateSession: (id: string, payload: UpdateLearningSessionRequest) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteSession: (id: string) =>
    apiRequest<void>(`/api/learning/session/${id}`, {
      method: "DELETE",
    }),

  startSession: (id: string) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}/start`, {
      method: "POST",
    }),

  pauseSession: (id: string) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}/pause`, {
      method: "POST",
    }),

  completeSession: (id: string) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}/complete`, {
      method: "POST",
    }),

  getTemplates: () => apiRequest<LearningTemplate[]>("/api/learning/templates"),

  getTimerPresets: () =>
    apiRequest<TimerPreset[]>("/api/learning/timer-presets"),

  saveTimerPreset: (payload: TimerPreset) =>
    apiRequest<TimerPreset>("/api/learning/timer-presets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
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

export const loansAPI = {
  getAll: () => apiRequest<LoanRecord[]>("/api/loans"),

  create: (payload: {
    personName: string;
    amount: number;
    reason?: string;
    date?: string;
  }) =>
    apiRequest<LoanRecord>("/api/loans", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  pay: (id: string, amount: number) =>
    apiRequest<LoanRecord>(`/api/loans/${id}/pay`, {
      method: "PATCH",
      body: JSON.stringify({ amount }),
    }),

  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/loans/${id}`, { method: "DELETE" }),
};

export const lendingRecordAPI = {
  getAll: () => apiRequest<LendingRecord[]>("/api/lending"),

  create: (payload: {
    personName: string;
    amount: number;
    fundingSource: FundingSource;
    borrowedFromName?: string;
    borrowReason?: string;
    date?: string;
  }) =>
    apiRequest<LendingRecord>("/api/lending", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  markRepaid: (id: string, amount: number) =>
    apiRequest<LendingRecord>(`/api/lending/${id}/repaid`, {
      method: "PATCH",
      body: JSON.stringify({ amount }),
    }),

  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/lending/${id}`, {
      method: "DELETE",
    }),
};

export const financeAPI = {
  getSummary: () => apiRequest<FinanceSummary>("/api/finance/summary"),
};

export const adminAPI = {
  getUsers: async (params: AdminUsersParams = {}) => {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 20));
    if (params.search?.trim()) {
      query.set("search", params.search.trim());
    }

    const response = await apiRequestWithMeta<AdminUserListItem[]>(
      `/api/admin/users?${query.toString()}`,
      { cacheTtlMs: 0 },
    );

    return {
      data: response?.data ?? [],
      meta: ((response?.meta ?? response?.pagination) as AdminUsersMeta) ?? {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total: response?.data?.length ?? 0,
        totalPages: 1,
      },
    };
  },

  updateUserRole: (userId: string, role: UserRole) =>
    apiRequest<AdminRoleUpdateResponse>(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  setUserBlockStatus: (
    userId: string,
    isBlocked: boolean,
    reason?: string,
  ) =>
    apiRequest<AdminBlockUpdateResponse>(`/api/admin/users/${userId}/block`, {
      method: "PATCH",
      body: JSON.stringify(
        isBlocked ? { isBlocked: true, reason: reason?.trim() ?? "" } : { isBlocked: false },
      ),
    }),

  getUserSummary: (userId: string) =>
    apiRequest<AdminUserSummaryResponse>(`/api/admin/users/${userId}/summary`, {
      cacheTtlMs: 0,
    }),
};

export default apiRequest;
