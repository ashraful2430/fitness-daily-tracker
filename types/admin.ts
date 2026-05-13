export type UserRole = "user" | "admin";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  blockedReason: string | null;
  loginStreak: number;
  longestLoginStreak: number;
  lastLoginDate: string | null;
  createdAt: string;
}

export interface AdminUsersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminRoleUpdateResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AdminBlockUpdateResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  blockedReason: string | null;
  blockedAt: string | null;
}

export interface AdminUserSummaryResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isBlocked: boolean;
    blockedReason: string | null;
    blockedAt: string | null;
    createdAt: string;
    lastLoginDate: string | null;
    loginStreak: number;
    longestLoginStreak: number;
  };
  summary: {
    workouts: { total: number; thisMonth: number };
    learning: { totalSessions: number; completedSessions: number };
    scoreSections: { totalToday: number; completedToday: number };
    finance: {
      totalIncome: number;
      totalExpense: number;
      totalSavings: number;
      availableBalance: number;
      loanDebt: number;
    };
    loans: { active: number; total: number };
    lending: { active: number; total: number };
  };
}
