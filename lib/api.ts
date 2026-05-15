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
import type {
  FeedbackEffect,
  FeedbackEffectInput,
  FeedbackUploadResponse,
} from "@/types/feedback";
import { emitFeedbackEffect } from "@/lib/feedbackEvents";
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
  feedbackEventKey?: string;
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

function emitSuccessFeedback(options: ApiOptions) {
  if (!options.feedbackEventKey || !isClient()) return;
  emitFeedbackEffect(options.feedbackEventKey);
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
  emitSuccessFeedback(options);

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
      feedbackEventKey: "auth.register.success",
    }),

  login: (payload: LoginRequest) =>
    apiRequest<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: false,
      feedbackEventKey: "auth.login.success",
    }),

  getCurrentUser: () => apiRequest<AuthUser>("/api/auth/me"),

  logout: async () => {
    await apiRequest("/api/auth/logout", {
      method: "POST",
      feedbackEventKey: "auth.logout.success",
    });
  },
};

export const dashboardAPI = {
  getDashboard: () => apiRequest<DashboardData>("/api/dashboard"),

  getWeeklyStats: () => apiRequest<WeeklyStat[]>("/api/dashboard/weekly-stats"),

  updateWaterIntake: (glassesConsumed: number) =>
    apiRequest<{ glassesConsumed: number }>("/api/dashboard/water", {
      method: "POST",
      body: JSON.stringify({ glassesConsumed }),
      feedbackEventKey: "dashboard.water.update.success",
    }),

  logFocusSession: (startTime: Date, endTime: Date, category: string) =>
    apiRequest<void>("/api/dashboard/focus", {
      method: "POST",
      body: JSON.stringify({ startTime, endTime, category }),
      feedbackEventKey: "dashboard.focus.create.success",
    }),

  updateWeeklyGoal: (completedWorkouts: number, goalWorkouts: number) =>
    apiRequest<void>("/api/dashboard/weekly-goal", {
      method: "POST",
      body: JSON.stringify({ completedWorkouts, goalWorkouts }),
      feedbackEventKey: "dashboard.weekly-goal.update.success",
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
      feedbackEventKey: "fitness.workout.create.success",
    }),

  updateWorkout: (id: string, workout: Partial<WorkoutInput>) =>
    apiRequest<WorkoutInput>(`/api/workouts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(workout),
      feedbackEventKey: "fitness.workout.update.success",
    }),

  deleteWorkout: (id: string) =>
    apiRequest<void>(`/api/workouts/${id}`, {
      method: "DELETE",
      feedbackEventKey: "fitness.workout.delete.success",
    }),
};

export const moneyAPI = {
  getCategories: () => apiRequest<MoneyCategory[]>("/api/money/categories"),

  createCategory: (payload: CreateCategoryRequest) =>
    apiRequest<MoneyCategory>("/api/money/category", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.category.create.success",
    }),

  deleteCategory: (name: string) =>
    apiRequest<void>(`/api/money/category/${encodeURIComponent(name)}`, {
      method: "DELETE",
      feedbackEventKey: "money.category.delete.success",
    }),

  addBalanceSource: (payload: {
    type: BalanceSource["type"];
    amount: number;
  }) =>
    apiRequest<BalanceSource>("/api/money/balance/add", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.balance.create.success",
    }),

  updateBalanceSource: (
    id: string,
    payload: { type: BalanceSource["type"]; amount: number },
  ) =>
    apiRequest<BalanceSource>(`/api/money/balance/update/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.balance.update.success",
    }),

  deleteBalanceSource: (id: string) =>
    apiRequest<void>(`/api/money/balance/${id}`, {
      method: "DELETE",
      feedbackEventKey: "money.balance.delete.success",
    }),

  getBalanceSources: () => apiRequest<BalanceResponse>("/api/money/balance"),

  createExpense: (payload: CreateExpenseRequest) =>
    apiRequest<MoneyExpense>("/api/money/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.expense.create.success",
    }),

  updateExpense: (id: string, payload: UpdateExpenseRequest) =>
    apiRequest<MoneyExpense>(`/api/money/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.expense.update.success",
    }),

  deleteExpense: (id: string) =>
    apiRequest<void>(`/api/money/expenses/${id}`, {
      method: "DELETE",
      feedbackEventKey: "money.expense.delete.success",
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
      feedbackEventKey: "money.salary.create.success",
    }),

  deleteSalary: () =>
    apiRequest<void>("/api/money/salary", {
      method: "DELETE",
      feedbackEventKey: "money.salary.delete.success",
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
      feedbackEventKey: "money.income.create.success",
    }),

  addSavings: (payload: CreateOtherSavingsRequest) =>
    apiRequest<OtherSavings>("/api/money/savings", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.savings.create.success",
    }),
};

export const lendingAPI = {
  // Loan Management
  createLoan: (payload: CreateLoanRequest) =>
    apiRequest<CreateLoanResponse>("/api/money/loans", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.loan.create.success",
    }),

  getAllLoans: () => apiRequest<Loan[]>("/api/money/loans"),

  getLoanDetails: (id: string) =>
    apiRequest<LoanDetailsResponse>(`/api/money/loans/${id}`),

  repayLoan: (id: string, payload: RepaymentRequest) =>
    apiRequest<RepaymentResponse>(`/api/money/loans/${id}/repay`, {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "money.loan.repay.success",
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
      feedbackEventKey: "learning.session.create.success",
    }),

  updateSession: (id: string, payload: UpdateLearningSessionRequest) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      feedbackEventKey: "learning.session.update.success",
    }),

  deleteSession: (id: string) =>
    apiRequest<void>(`/api/learning/session/${id}`, {
      method: "DELETE",
      feedbackEventKey: "learning.session.delete.success",
    }),

  startSession: (id: string) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}/start`, {
      method: "POST",
      feedbackEventKey: "learning.session.start.success",
    }),

  pauseSession: (id: string) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}/pause`, {
      method: "POST",
      feedbackEventKey: "learning.session.pause.success",
    }),

  completeSession: (id: string) =>
    apiRequest<LearningSession>(`/api/learning/session/${id}/complete`, {
      method: "POST",
      feedbackEventKey: "learning.session.complete.success",
    }),

  getTemplates: () => apiRequest<LearningTemplate[]>("/api/learning/templates"),

  getTimerPresets: () =>
    apiRequest<TimerPreset[]>("/api/learning/timer-presets"),

  saveTimerPreset: (payload: TimerPreset) =>
    apiRequest<TimerPreset>("/api/learning/timer-presets", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "learning.timer-preset.create.success",
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
      feedbackEventKey: "habits.section.create.success",
    }),

  updateSection: (id: string, section: Partial<ScoreSectionInput>) =>
    apiRequest<ScoreSection>(`/api/score-sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(section),
      feedbackEventKey: "habits.section.update.success",
    }),

  deleteSection: (id: string) =>
    apiRequest<void>(`/api/score-sections/${id}`, {
      method: "DELETE",
      feedbackEventKey: "habits.section.delete.success",
    }),

  updateProgress: (id: string, value: number) =>
    apiRequest<ScoreSection>(`/api/score-sections/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
      feedbackEventKey: "habits.section.progress.update.success",
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
      feedbackEventKey: "lending.loan.create.success",
    }),

  pay: (id: string, amount: number) =>
    apiRequest<LoanRecord>(`/api/loans/${id}/pay`, {
      method: "PATCH",
      body: JSON.stringify({ amount }),
      feedbackEventKey: "lending.loan.repay.success",
    }),

  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/loans/${id}`, {
      method: "DELETE",
      feedbackEventKey: "lending.loan.delete.success",
    }),
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
      feedbackEventKey: "lending.lending.create.success",
    }),

  markRepaid: (id: string, amount: number) =>
    apiRequest<LendingRecord>(`/api/lending/${id}/repaid`, {
      method: "PATCH",
      body: JSON.stringify({ amount }),
      feedbackEventKey: "lending.lending.repay.success",
    }),

  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/lending/${id}`, {
      method: "DELETE",
      feedbackEventKey: "lending.lending.delete.success",
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
      feedbackEventKey: "admin.user.role.update.success",
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
      feedbackEventKey: "admin.user.block.update.success",
    }),

  getUserSummary: (userId: string) =>
    apiRequest<AdminUserSummaryResponse>(`/api/admin/users/${userId}/summary`, {
      cacheTtlMs: 0,
    }),

  getFeedbackEffects: () =>
    apiRequest<FeedbackEffect[]>("/api/admin/feedback-effects", {
      cacheTtlMs: 0,
    }),

  upsertFeedbackEffect: (payload: FeedbackEffectInput) =>
    apiRequest<FeedbackEffect>("/api/admin/feedback-effects", {
      method: "POST",
      body: JSON.stringify(payload),
      feedbackEventKey: "admin.feedback-effect.create.success",
    }),

  updateFeedbackEffect: (id: string, payload: Partial<FeedbackEffectInput>) =>
    apiRequest<FeedbackEffect>(`/api/admin/feedback-effects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      feedbackEventKey: "admin.feedback-effect.update.success",
    }),

  deleteFeedbackEffect: (id: string) =>
    apiRequest<void>(`/api/admin/feedback-effects/${id}`, {
      method: "DELETE",
      feedbackEventKey: "admin.feedback-effect.delete.success",
    }),

  uploadFeedbackAsset: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/feedback-effects/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    }).catch(() => {
      throw new ApiError("Upload service is temporarily unavailable.", 0);
    });
    const body = (await response.json().catch(() => null)) as
      | (ApiEnvelope<FeedbackUploadResponse> & FeedbackUploadResponse)
      | null;

    if (!response.ok) {
      throw new ApiError(body?.message || "Failed to upload asset", response.status, body);
    }

    emitFeedbackEffect("admin.feedback-effect.upload.success");
    return (body?.data ?? body) as FeedbackUploadResponse;
  },
};

export default apiRequest;
