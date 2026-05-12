import type {
  DashboardData,
  DashboardEnvelope,
  FocusPayload,
  WaterPayload,
  WeeklyGoalPayload,
  WeeklyStat,
  WeeklyStatsPayload,
} from "@/types/dashboard";

export class DashboardApiError extends Error {
  status: number;
  field?: string;

  constructor(message: string, status: number, field?: string) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
    this.field = field;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  const body = (await response
    .json()
    .catch(() => null)) as DashboardEnvelope<T> | null;

  if (!response.ok) {
    throw new DashboardApiError(
      body?.message ?? "Request failed",
      response.status,
      body?.field,
    );
  }

  if (!body?.success) {
    throw new DashboardApiError(
      body?.message ?? "Request failed",
      response.status,
      body?.field,
    );
  }

  if (body.data === undefined) {
    throw new DashboardApiError("Missing data in API response", response.status);
  }

  return body.data;
}

export function getDashboard() {
  return request<DashboardData>("/api/proxy/dashboard");
}

export function getWeeklyStats() {
  return request<WeeklyStat[]>("/api/proxy/dashboard/weekly-stats");
}

export function postWater(payload: WaterPayload) {
  return request("/api/proxy/dashboard/water", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function postFocus(payload: FocusPayload) {
  return request("/api/proxy/dashboard/focus", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function postWeeklyGoal(payload: WeeklyGoalPayload) {
  return request("/api/proxy/dashboard/weekly-goal", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function postWeeklyStats(payload: WeeklyStatsPayload) {
  return request("/api/proxy/dashboard/weekly-stats", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
